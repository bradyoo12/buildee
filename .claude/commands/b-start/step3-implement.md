# Step 3: Implement Ticket

`general-purpose` agent를 spawn해서 구현. 폴링으로 진행 상황 모니터링 (`common-agent-patterns.md` Method 4).

## 3a: Deploy-Retry 컨텍스트 확인

`DEPLOY_RETRY > 1`이면 이전 실패 코멘트 읽기:

```bash
RETRY_COMMENTS=$(gh api "repos/bradyoo12/buildee/issues/<number>/comments" \
  --jq '[.[] | select(.body | contains("Deploy-Retry 실패"))] | last | .body // empty')
```

`RETRY_COMMENTS`가 있으면 Step 3b agent prompt에 포함하여 다른 접근 사용 지시.

## 3b: RED 베이스라인 확인

Step 2c가 셋팅한 `EXISTING_BRANCH` / `TICKET_BRANCH`를 그대로 사용. create-ticket이 만든 RED 테스트가 정말 fail하는지 기록 — 구현 후 GREEN 검증의 베이스라인:

```bash
RED_BASELINE=""
RED_FAILED_TESTS=""

if [ "$EXISTING_BRANCH" = "true" ]; then
  pnpm --filter @buildee/server test -- "ticket-<number>" --reporter=verbose 2>&1 \
    | tee /tmp/red-baseline-<number>.txt || true
  RED_BASELINE=$(grep -E '(Tests|Failed|passed|failed)' /tmp/red-baseline-<number>.txt | tail -3 | tr '\n' ' ')

  # FAIL/error 태그 라인 추출 → GREEN 단계에서 동일 항목 통과 비교용
  RED_FAILED_TESTS=$(grep -E '(✗|FAIL|×)' /tmp/red-baseline-<number>.txt | head -50)

  if ! grep -qE '(fail|error|FAIL|×)' /tmp/red-baseline-<number>.txt; then
    gh issue comment <number> --repo bradyoo12/buildee \
      --body "[STATUS:UNEXPECTED_GREEN] RED 테스트가 이미 통과 — 테스트가 약하거나 이미 구현됨. 사람 확인 필요."
    # lock 해제 + 다음 티켓
  fi
else
  echo "[#<number>] No existing RED branch from create-ticket — agent가 phase 1에서 테스트 작성"
fi
```

기억할 것: **Step 3f에서 같은 테스트가 PASS로 바뀌어야 작업 완료**.

## 3c: Implementation Agent

`general-purpose` agent를 background로 spawn (max 20분, 폴링).

### Agent prompt

```
당신은 buildee 본체 레포의 ticket 구현 에이전트.

## 컨텍스트
- Issue #<number>: <ISSUE_TITLE>
- Branch: <BRANCH> (또는 batch mode: $BATCH_BRANCH에서 작업)
- 본체 컨텍스트: CLAUDE.md, docs/decisions/

## Issue 본문
<ISSUE_BODY>

[Deploy-Retry 재시도면 추가:]
⚠️ 이 티켓은 이전 deploy 검증 실패로 revert + 재시도 중. 아래 실패 코멘트 반드시 읽고 같은 실수 반복 금지. 다른 접근 방식으로 구현.
--- 이전 실패 ---
<RETRY_COMMENTS>
--- 끝 ---

## 작업 원칙
1. **레이어 분리** — Spec → Design → Code. 가장 높은 적용 가능 레이어부터.
2. **Prisma schema 변경 시** → 반드시 `pnpm --filter @buildee/db prisma migrate dev --name <slug>` 실행해서 마이그레이션 파일 함께 commit. `prisma/migrations/` 변경 없으면 PR 거부됨.
3. **시크릿 inline 금지** — Key Vault 또는 env. `lib/key-vault.ts` 패턴 따라.
4. **public API 변경 시** → 관련 단위 테스트 업데이트 (test/*.test.ts).
5. **트레이서빌리티** — 변경 파일 상단에 `// ticket: #<number>` 주석.

## Phase 1 — Goal-Proving 테스트 먼저

create-ticket Step 6이 작성한 ticket-<number>.test.ts 파일을 베이스라인으로.
- 베이스라인 어설션 라인 **수정·삭제 금지** (변경하면 검증 무효)
- 추가 어설션 작성은 OK
- Bug fix면 재현 테스트가 현재 fail함을 확인

## Phase 2 — 구현
- Issue body의 `## Goal`, `## Proposed changes`, `## Acceptance criteria` 기반 코드 수정
- Bug fix: Phase 1 재현 테스트가 fix 후 PASS해야 함
- 새 Prisma model 필드 → migration 추가 + Program 시작 시 idempotent SQL 적용

## Phase 3 — 테스트-구현 반복 (verbose)
```bash
pnpm --filter @buildee/server test -- "ticket-<number>" --reporter=verbose
```
- FAIL 분석 후 fix → re-run. 최대 5회.

## Phase 3.5 — Pre-merge 로컬 검증 (최대 3회 자동 수정)
1. `pnpm install --frozen-lockfile`
2. `pnpm --filter @buildee/db prisma:generate`
3. `pnpm typecheck`
4. `pnpm -r build`
5. `pnpm --filter @buildee/server test -- "ticket-<number>"` — GREEN
6. **성공 기준 코드-level grep** — 본문에 "제거", "없어야", "removed" 키워드 항목이 있으면 grep으로 패턴 부재 확인
7. **변경 파일 vs 성공 기준 교차 검증** — `git diff --name-only origin/main`이 성공 기준의 대상 파일을 포함하는지

3회 실패 시: `on hold` 라벨 + 실패 코멘트 → on hold 처리 후 종료.

## Phase 5 — Prisma migration 검증 (DB 변경 시)
- `packages/db/prisma/schema.prisma` 또는 `prisma/migrations/` 변경 있으면:
  ```bash
  cd packages/db
  pnpm prisma migrate dev --create-only --name <slug>  # 변경 미반영시
  # 생성된 SQL을 idempotent하게 보강 (CREATE TABLE IF NOT EXISTS 등)
  ```

## Commit (with `Refs #<number>`)

git diff/status 확인 후:
```bash
git add <files>
git commit -m "[ticket-<number>] <ISSUE_TITLE>

Refs #<number>"
```

⚠️ **NEVER use `Closes/Fixes/Resolves`** — Step 5 검증 통과 후에만 명시적으로 close.

## 배치 모드 (loop)
- push 건너뛴다. b-start가 Ready 소진 후 일괄 push + 단일 PR.
- 새 브랜치 안 만든다. `$BATCH_BRANCH`에서 작업.

## Single-ticket 모드
- Push: `git push -u origin <BRANCH>`
- PR 생성:
  ```bash
  gh pr create --repo bradyoo12/buildee \
    --title "[ticket-<number>] <ISSUE_TITLE>" \
    --body "Refs #<number>

## 변경 요약
$(git diff main --stat)

## Done conditions
$(grep -A 100 '## Acceptance criteria' /tmp/issue-<number>.json | head -50)
"
  ```

## 의미 있는 진척마다 코멘트
gh issue comment <number> --repo bradyoo12/buildee --body "[STATUS:WORKING] (1줄 요약)"

## 참조 docs
- CLAUDE.md
- docs/decisions/
- packages/db/prisma/schema.prisma

## 제약
- 최소 diff. 본 ticket 외 변경 금지.
- 테스트 skip/disable 금지.
- 신규 기능/리팩터링 금지 (티켓 범위 외).
```

## 3d: Failure 처리

agent fail/stuck 시:
- `on hold` 라벨 + 실패 코멘트
- **배치 모드**: 실패 티켓의 마지막 커밋 revert (`git revert --no-commit HEAD` if 마지막 커밋 해당). 배치 브랜치는 삭제 안 함. `BATCH_TICKETS`에서 제거.
- **Single-ticket 모드**: `git reset --hard origin/main`, 브랜치 삭제.
- **Lock 해제**:
  ```bash
  bash .claude/scripts/ticket-lock.sh release <number>
  bash .claude/scripts/ticket-lock-remote.sh release <number>
  ```

## 3e: GREEN 검증 — RED 테스트가 PASS로 전환되었는가 (REQUIRED)

create-ticket이 만들었거나 Phase 1에서 추가된 ticket-<number>.test.ts가 이제 모두 통과해야 한다. Phase 3.5 step 5에서 이미 한 번 돌렸지만 b-start 레벨에서 다시 명시적으로 확인하고 RED 베이스라인과 비교:

```bash
GREEN_LOG=/tmp/green-verify-<number>.txt
pnpm --filter @buildee/server test -- "ticket-<number>" --reporter=verbose 2>&1 | tee "$GREEN_LOG" || true

# fail/error 잔재 검사
if grep -qE '(✗|FAIL|×|failed)' "$GREEN_LOG" && ! grep -qE '0 failed|Tests *0 failed' "$GREEN_LOG"; then
  echo "[#<number>] GREEN 검증 실패 — RED 테스트가 여전히 fail"

  GREEN_TAIL=$(tail -80 "$GREEN_LOG")
  gh issue comment <number> --repo bradyoo12/buildee --body "$(cat <<EOF
[STATUS:GREEN_VERIFICATION_FAILED]

create-ticket이 만든 RED 테스트가 구현 후에도 통과하지 않습니다.

### RED 베이스라인 (구현 전)
\`\`\`
$RED_BASELINE
\`\`\`

### GREEN 시도 (구현 후, 최근 80줄)
\`\`\`
$GREEN_TAIL
\`\`\`

→ Deploy-Retry Loop이 revert + 다른 접근으로 재구현하거나, 10회 초과 시 on hold.
EOF
)"

  # b-start.md Deploy-Retry Loop이 이 실패를 감지하도록 변수 셋팅
  STEP3_RESULT=FAIL
  FAILURE_REASONS="GREEN verification failed: RED tests still failing after implementation"
  return 1
fi

# RED에서 fail이었는데 GREEN에서 빠진 테스트가 없는지 — 테스트 skip/disable 방어
if [ -n "$RED_FAILED_TESTS" ]; then
  MISSING=""
  while IFS= read -r LINE; do
    NAME=$(echo "$LINE" | sed -E 's/.*(✗|×|FAIL) +//' | sed -E 's/ +\([0-9.]+m?s\)$//')
    [ -z "$NAME" ] && continue
    if ! grep -qF "$NAME" "$GREEN_LOG"; then
      MISSING+="- $NAME"$'\n'
    fi
  done <<< "$RED_FAILED_TESTS"

  if [ -n "$MISSING" ]; then
    gh issue comment <number> --repo bradyoo12/buildee --body "[STATUS:RED_TESTS_DROPPED]

이전 RED 테스트가 GREEN 결과에서 누락 (skip/삭제 의심):
$MISSING

agent가 baseline 어설션을 수정·삭제했을 가능성 — 검증 무효."
    STEP3_RESULT=FAIL
    FAILURE_REASONS="RED test cases disappeared from GREEN run (skip/disable suspected)"
    return 1
  fi
fi

echo "[#<number>] GREEN 검증 통과 — RED 테스트 모두 PASS 전환"
```

## 3e-2: 진척 코멘트 (GREEN 검증 통과 후)

```bash
gh issue comment <number> --repo bradyoo12/buildee \
  --body "[STATUS:GUARDRAIL_PASSED] 로컬 검증 + RED→GREEN 전환 확인 — Step 4 진행

### RED 베이스라인
\`\`\`
$RED_BASELINE
\`\`\`

### GREEN 결과
\`\`\`
$(tail -10 $GREEN_LOG)
\`\`\`"
```

→ batch mode면 **Step 3.5 Batch Check**로 (loop 내), single mode면 **Step 4 (Merge)**로.

## 3.5: Batch Check (Loop mode 전용)

구현 완료 후 보드 새로고침:

```bash
READY_COUNT=$(bash .claude/scripts/gh-project-cache.sh get true | \
  jq '[.items[] | select(.status == "Ready") | select(.labels | map(.name) | index("on hold") | not)] | length')
```

- **Ready > 0** → **Step 2로 회귀** 다음 티켓 구현 (같은 batch branch에 커밋 누적)
- **Ready == 0** → **Step 3.7 (Batch Push)** 진행

## 3.7: Batch Push & PR (Loop mode 전용)

누적 커밋을 일괄 push + 단일 PR:

```bash
git push -u origin $BATCH_BRANCH

TICKET_LIST=""
for entry in "${BATCH_TICKETS[@]}"; do
  NUM=$(echo "$entry" | cut -d'|' -f1)
  TITLE=$(echo "$entry" | cut -d'|' -f3)
  TICKET_LIST+="- Refs #${NUM}: ${TITLE}"$'\n'
done

BATCH_NUMS=$(printf '%s\n' "${BATCH_TICKETS[@]}" | cut -d'|' -f1 | sed 's/^/#/' | tr '\n' ', ' | sed 's/, $//')

PR_JSON=$(gh api --method POST "repos/bradyoo12/buildee/pulls" \
  -f title="batch: ${BATCH_NUMS}" \
  -f head="$BATCH_BRANCH" \
  -f base="main" \
  -f body="## Summary

### Tickets
${TICKET_LIST}
---
Generated by b-start batch mode")

BATCH_PR_NUMBER=$(echo "$PR_JSON" | jq -r '.number')
```

`BATCH_PR_NUMBER` → Step 4에서 사용.

→ Step 4로 진행.
