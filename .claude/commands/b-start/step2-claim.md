# Step 2: Claim Ticket

티켓을 안전하게 점유 (local lock + remote lock + 보드 In Progress + assign).

## 2a: Claim — Race-Condition Safe Lock + Claim-First

1. **Rate limit 확인**, GraphQL < 20%면 계정 전환 (`common-rate-limit.md`)
2. **Stale lock 정리**: `bash .claude/scripts/ticket-lock.sh cleanup`
3. **보드 캐시에서 Ready 티켓 필터** (no `on hold`):
   ```bash
   READY_TICKETS=$(echo "$PROJECT_ITEMS" | jq -r '
     [.items[] | select(.status == "Ready") |
       select(.labels | map(.name) | index("on hold") | not)]')
   ```
4. **Ready 없음**:
   - In Progress / In Review 티켓 있으면 → Step 4로 skip
   - 아니면 **wait loop**:
     ```
     while true:
       if .claude/b-start-stop-signal exists OR .claude/b-start-fresh-mode removed:
         exit pipeline
       READY=$(bash .claude/scripts/gh-project-cache.sh get true | \
         jq '[.items[] | select(.status == "Ready") | select(.labels | map(.name) | index("on hold") | not)] | length')
       if READY > 0: break  # 대기 루프 탈출
       IN_PROG=$(... | jq '[.items[] | select(.status == "In progress" or .status == "In Review")] | length')
       if IN_PROG > 0: skip to Step 4
       echo "No Ready tickets — waiting 60s..."
       sleep 60
     ```
   - **CRITICAL — 절대 파이프라인 종료 금지**. Ready 0개여도 무한 대기. Stop signal만이 종료 조건.

5. **각 Ready 티켓**에 대해 (claim 성공할 때까지):

   **2a-1: Local lock**:
   ```bash
   export WORKER_ID="${WORKER_ID:-$(hostname)-$$}"
   LOCK_RESULT=$(bash .claude/scripts/ticket-lock.sh claim <number>)
   if [[ $? -ne 0 ]]; then
     echo "[#<number>] Locked by another agent ($LOCK_RESULT) — next ticket"
     continue
   fi
   ```

   > **CRITICAL**: Lock 실패 시 절대 `rm -rf`로 lock 디렉토리 강제 삭제 금지. 다른 에이전트 작업 중. `continue`로 다음 티켓. Stale(60분 초과)은 cleanup이 자동 처리.

   **2a-2: Remote lock** (cross-worker):
   ```bash
   REMOTE_LOCK=$(bash .claude/scripts/ticket-lock-remote.sh claim <number>)
   if [[ $? -ne 0 ]]; then
     echo "[#<number>] Remote-locked ($REMOTE_LOCK) — releasing local"
     bash .claude/scripts/ticket-lock.sh release <number>
     continue
   fi
   ```

   **2a-3: Claim-first — 즉시 In Progress로 이동** (다른 작업 전):
   ```bash
   source .claude/project-board.config
   gh project item-edit --project-id $PROJECT_ID --id <item_id> \
     --field-id $STATUS_FIELD_ID --single-select-option-id $OPT_IN_PROGRESS
   ```

   **2a-4: 보드 이동 검증** (force-refresh):
   ```bash
   ACTUAL_STATUS=$(bash .claude/scripts/gh-project-cache.sh get true | \
     jq -r '.items[] | select(.content.number == <number>) | .status')
   if [[ "$ACTUAL_STATUS" != "In progress" ]]; then
     echo "[#<number>] Board move 실패 또는 다른 에이전트가 claim — releasing locks"
     bash .claude/scripts/ticket-lock.sh release <number>
     bash .claude/scripts/ticket-lock-remote.sh release <number>
     continue
   fi
   ```

   **2a-5: Self-assign** (GitHub-level visibility 보조):
   ```bash
   WORKER=$(gh api user --jq '.login')
   gh api --method POST "repos/bradyoo12/buildee/issues/<number>/assignees" \
     -f "assignees[]=$WORKER"
   ```

6. **모든 Ready 티켓이 lock/claim됨** → wait loop 진입 (위 4와 동일)

## 2a-cleanup: Lock 해제 (실패 시)

Step 3 ~ Step 5에서 실패 시 **양쪽 lock** 모두 해제:

```bash
bash .claude/scripts/ticket-lock.sh release <number>
bash .claude/scripts/ticket-lock-remote.sh release <number>
```

Lock은 Step 5에서 Done + close 확정 후에도 해제된다.

## 2b: Issue 컨텍스트 로드

```bash
gh issue view <number> --repo bradyoo12/buildee \
  --json number,title,body,labels > /tmp/issue-<number>.json

ISSUE_TITLE=$(jq -r .title /tmp/issue-<number>.json)
ISSUE_BODY=$(jq -r .body /tmp/issue-<number>.json)
ISSUE_LABELS=$(jq -r '[.labels[].name] | join(",")' /tmp/issue-<number>.json)
```

**필수 추출**:
- `## Goal` — 무엇을
- `## Acceptance criteria` — 통과 조건 (없거나 모호하면 **STOP**)
- `## Done conditions` — E2E 시나리오 (Given/When/Then, 있으면)

> 📌 Acceptance criteria가 "구체적·실행 가능"하지 않으면 (예: "잘 동작한다") `[STATUS:CLARIFICATION_NEEDED]` 코멘트 + lock 해제 + 다음 티켓.

## 2c: 분류 + 브랜치 결정 (create-ticket이 만든 브랜치 우선 재사용)

브랜치 네이밍: 항상 `<number>-<slug>` (type prefix 없음).

**기존 브랜치 검색 (REQUIRED)** — create-ticket Step 6이 RED 테스트와 함께 이미 만든 브랜치가 있으면 새로 만들지 않고 재사용한다. 이 commit이 RED→GREEN 검증 베이스라인이라 사라지면 검증 무효:

```bash
EXISTING_BRANCH=false
TICKET_BRANCH=""

git fetch origin --prune

# remote에서 <number>-로 시작하는 브랜치 검색 (legacy <prefix>/<number>-도 호환)
CANDIDATE=$(git ls-remote --heads origin | awk '{print $2}' | sed 's|refs/heads/||' | \
  grep -E "(^|/)<number>-" | head -1)

if [ -n "$CANDIDATE" ]; then
  TICKET_BRANCH="$CANDIDATE"
  EXISTING_BRANCH=true
  echo "[#<number>] Reusing branch from create-ticket: $TICKET_BRANCH"
else
  # 새로 만들 때도 prefix 없이 <number>-<slug>
  TICKET_BRANCH="<number>-<slug>"
fi
```

**Single-ticket mode**:
- `EXISTING_BRANCH=true` → 기존 브랜치 그대로 checkout (RED commit 보존):
  ```bash
  git checkout "$TICKET_BRANCH" && git pull origin "$TICKET_BRANCH" --ff-only
  ```
  ⚠️ `git checkout -b` 또는 `git reset --hard origin/main` 금지 — create-ticket의 RED 테스트 commit이 사라진다.
- `EXISTING_BRANCH=false` → 새 브랜치 생성:
  ```bash
  git checkout -b "$TICKET_BRANCH" origin/main
  ```

**Loop mode (배치)** — 배치 브랜치(`$BATCH_BRANCH`)에서 작업하지만 RED 테스트는 배치에 cherry-pick하여 보존:
- `EXISTING_BRANCH=true` → ticket 브랜치의 main 이후 commit을 모두 cherry-pick:
  ```bash
  RED_COMMITS=$(git log "origin/$TICKET_BRANCH" ^origin/main --format=%H --reverse)
  for SHA in $RED_COMMITS; do
    git cherry-pick "$SHA" || { git cherry-pick --abort; break; }
  done
  ```
- `EXISTING_BRANCH=false` → 새 브랜치 안 만든다. 현재 `$BATCH_BRANCH`에서 바로 작업.

`EXISTING_BRANCH`, `TICKET_BRANCH`는 Step 3 (RED baseline + GREEN 검증)에서 다시 참조한다.

## 2d: Pre-Implementation Validation

구현 전 main에서 이슈가 여전히 존재하는지 확인:
- Bug: 실패 테스트 또는 빌드 재현
- Feature: 코드베이스에 이미 존재하는지

**이미 해결됨** → 증거 코멘트 + 보드 Done + close + lock 해제 → Step 6로 skip

**여전히 존재** → Step 3로 진행

## 2e: 시작 신고

```bash
gh issue comment <number> --repo bradyoo12/buildee \
  --body "[STATUS:STARTED] worker=$WORKER_ID branch=\`$TICKET_BRANCH\` (existing=$EXISTING_BRANCH)"
```

→ Step 3으로 진행.
