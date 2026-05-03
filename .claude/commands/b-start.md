# /b-start

Buildee 본체 (`bradyoo12/buildee`) GitHub Issue를 픽업해서 작업 → 가드레일 → E2E 검증 → PR까지 자동 실행.

**ai-dev-request의 b-start 진화판** — 핵심 원칙 그대로:
> 티켓 Done ≠ 목적 달성. Acceptance criteria를 **실제 명령으로 실행**해서 검증한다.

---

## 인자

`/b-start <issue_num>` — 특정 이슈 처리 (예: `/b-start 4`)
`/b-start` — open + assignee=@me 중 가장 오래된 것 (RED 테스트 브랜치 `<num>-*`가 origin에 있는 것 우선)

---

## Phase 0 — 파싱

```bash
# $ARGUMENTS에서 issue 번호 추출
ISSUE_NUM=$(echo "$ARGUMENTS" | grep -oE '^[0-9]+' || true)

if [ -z "$ISSUE_NUM" ]; then
  # 1순위: origin에 RED 브랜치(`<num>-<slug>`)가 이미 푸시된 open + assignee=@me 이슈
  git fetch origin --prune 2>/dev/null || true
  for n in $(gh issue list --repo bradyoo12/buildee --state open --assignee @me \
              --limit 20 --json number --jq '.[].number' | sort -n); do
    if git branch -r | grep -qE "origin/${n}-"; then
      ISSUE_NUM=$n; break
    fi
  done
  # 2순위: RED 브랜치 없어도 가장 오래된 open + assignee=@me 이슈
  if [ -z "$ISSUE_NUM" ]; then
    ISSUE_NUM=$(gh issue list --repo bradyoo12/buildee --state open --assignee @me \
      --limit 1 --json number --jq '.[0].number')
  fi
fi

if [ -z "$ISSUE_NUM" ]; then
  echo "처리 가능한 이슈가 없음"; exit 1
fi
```

---

## Phase 1 — Issue 컨텍스트 로드

```bash
gh issue view $ISSUE_NUM --repo bradyoo12/buildee \
  --json number,title,body,labels > /tmp/issue.json

ISSUE_TITLE=$(jq -r .title /tmp/issue.json)
ISSUE_BODY=$(jq -r .body /tmp/issue.json)
```

**필수 확인 사항** (Issue body에서 추출):
- `## Goal` — 무엇을
- `## Acceptance criteria` — 통과 조건 (이 항목이 없거나 모호하면 **Phase 5에서 멈춤**)
- `## Done conditions` (있으면) — E2E 시나리오 (Given/When/Then)

> 📌 Acceptance criteria가 "구체적·실행 가능"하지 않으면 — 예: "잘 동작한다" 같은 모호한 항목 — `[STATUS:CLARIFICATION_NEEDED]` comment 후 멈춘다. Brad가 보강한 뒤 다시 `/b-start <num>`.

---

## Phase 2 — 시작 신고 + 브랜치

`/create-ticket`이 이미 만들어둔 ticket 브랜치 + 실패 테스트를 우선 사용. 없으면 (수동 issue) 새로 만든다.

```bash
SLUG=$(echo "$ISSUE_TITLE" | tr '[:upper:]' '[:lower:]' | tr -cs '[:alnum:]' '-' | cut -c1-30 | sed 's/-$//')
BRANCH="${ISSUE_NUM}-${SLUG}"   # 예: 4-infra-readme-monorepo

git fetch origin

if git rev-parse --verify "origin/$BRANCH" >/dev/null 2>&1; then
  # create-ticket이 만들어둔 브랜치 사용
  git checkout "$BRANCH" 2>/dev/null || git checkout -b "$BRANCH" "origin/$BRANCH"
  git pull --rebase origin "$BRANCH"
  EXISTING_BRANCH=true
else
  # 수동 issue — 그 자리에서 만들기
  git checkout main && git pull --rebase
  git checkout -b "$BRANCH"
  EXISTING_BRANCH=false
fi

gh issue comment $ISSUE_NUM --repo bradyoo12/buildee \
  --body "[STATUS:STARTED] 작업 시작 — branch: \`$BRANCH\` (existing=$EXISTING_BRANCH)"
```

---

## Phase 2.5 — RED 베이스라인 확인

`create-ticket`이 만든 실패 테스트가 정말 fail 상태인지 한번 확인. 작업 끝났을 때 같은 테스트가 PASS해야 의미가 있으니까.

```bash
# ticket-${ISSUE_NUM}로 시작하는 테스트만 (create-ticket 규칙)
RED_BASELINE=""
if [ "$EXISTING_BRANCH" = "true" ]; then
  pnpm --filter @buildee/server test -- "ticket-${ISSUE_NUM}" 2>&1 | tee /tmp/red-baseline.txt || true
  RED_BASELINE=$(grep -E '(Tests|Failed|passed|failed)' /tmp/red-baseline.txt | tail -3 | tr '\n' ' ')

  # 전부 PASS면 이상 — create-ticket이 너무 약한 테스트를 썼거나, 이미 구현된 상태
  if ! grep -qE '(fail|error|FAIL)' /tmp/red-baseline.txt; then
    gh issue comment $ISSUE_NUM --repo bradyoo12/buildee \
      --body "[STATUS:UNEXPECTED_GREEN] RED 테스트가 이미 통과 중. 테스트가 약하거나 이미 구현됨 — 사람 확인 필요."
    exit 1
  fi
fi
```

기억해둘 것: **Phase 5에서 같은 테스트가 PASS로 바뀌어야 작업 완료**.

---

## Phase 3 — 작업

Issue body의 `## Goal`, `## Proposed changes`, `## Acceptance criteria`를 기반으로 코드 수정.

**작업 중 원칙**:
1. **레이어 분리** — Spec → Design → Code. 가장 높은 적용 가능 레이어부터
2. **Prisma schema 변경 시** → 반드시 `pnpm --filter @buildee/db prisma migrate dev --name <slug>` 실행해서 마이그레이션 파일 함께 commit
3. **시크릿 inline 금지** — Key Vault 또는 env로 분리
4. **public API 변경 시** — 관련 단위 테스트 업데이트 (test/*.test.ts)
5. **트레이서빌리티** — 변경된 파일 상단에 `// ticket: #N` 주석 (이미 있으면 갱신)

**의미 있는 진척마다** comment:

```bash
gh issue comment $ISSUE_NUM --repo bradyoo12/buildee \
  --body "[STATUS:WORKING] (요약 1줄)"
```

---

## Phase 4 — 가드레일 (Layer 1·2·5 활성)

```bash
gh issue comment $ISSUE_NUM --repo bradyoo12/buildee \
  --body "[STATUS:GUARDRAIL_RUNNING]"
```

### Layer 1 — Build

```bash
pnpm install --frozen-lockfile && \
pnpm --filter @buildee/db prisma:generate && \
pnpm typecheck && \
pnpm -r build
```

### Layer 2 — Lint (있으면)

```bash
pnpm lint || pnpm --filter @buildee/server lint || true
```

> ESLint 설정 아직 없는 단계면 skip.

### Layer 5 — 도메인 룰 (Buildee 본체용)

직접 수동 검사 (또는 `scripts/guardrails/` 스크립트 호출):

| 체크 | 명령 |
|---|---|
| 시크릿 inline 금지 | `grep -rE "(sk-ant-\|api_key=\|password=\")" apps/server/src \|\| true` — 결과 없어야 함 |
| any 타입 신규 사용 | `git diff main -- '**/*.ts' \| grep -E '^\+.*: *any'` — 신규 추가 0이어야 함 (경고는 OK) |
| Prisma schema 변경 시 마이그레이션 동행 | schema.prisma 변경 있으면 `prisma/migrations/` 변경도 있어야 함 |
| public API 변경 시 테스트 동행 | `routes/*.ts` 변경 있으면 `test/` 변경도 있어야 함 |

**실패 시**:
1. **첫 실패** → 자동 수정 시도 1회 (예: typecheck 실패 → import 누락 추가)
2. **두 번째 실패** → `[STATUS:GUARDRAIL_FAILED] (어떤 layer 어떤 항목)` comment 후 **STOP** (사용자 개입)

```bash
gh issue comment $ISSUE_NUM --repo bradyoo12/buildee \
  --body "[STATUS:GUARDRAIL_PASSED]"
```

---

## Phase 5 — Acceptance criteria 실제 실행 (E2E + GREEN 전환)

> 🔥 **가장 중요한 단계**. 이 단계 없으면 b-start 의미 없음.
>
> 🟢 **`create-ticket`이 만들어둔 RED 테스트가 이제 PASS해야 한다** — Phase 2.5의 베이스라인과 정반대 결과여야 정상.

```bash
# 1) create-ticket이 박아둔 ticket 테스트 — 반드시 GREEN
pnpm --filter @buildee/server test -- "ticket-${ISSUE_NUM}" 2>&1 | tee /tmp/green-result.txt
if grep -qE '(fail|FAIL)' /tmp/green-result.txt; then
  gh issue comment $ISSUE_NUM --repo bradyoo12/buildee \
    --body "[STATUS:STILL_RED] ticket-${ISSUE_NUM} 테스트가 여전히 fail — 구현 미완"
  exit 1
fi
```

그 다음, Issue body의 `## Acceptance criteria`의 각 체크박스 항목을 **실제 명령으로 실행** (테스트 외 — curl, migrate 등).

### 패턴 매핑 예시

| Acceptance criteria 형태 | 실행 명령 |
|---|---|
| `[ ] /health endpoint returns 200` | `curl -sf http://localhost:3000/health` |
| `[ ] POST /projects creates Project + DB + repo` | 가입 → POST /projects → 응답에 dataDbName + repoUrl 검증 |
| `[ ] prisma migrate deploy succeeds` | `pnpm --filter @buildee/db prisma migrate deploy` |
| `[ ] webhook signature 검증 통과` | `pnpm --filter @buildee/server test -- github-webhook` |
| `[ ] queue claimTicket SKIP LOCKED 동작` | `pnpm --filter @buildee/db test -- queue` (테스트 파일 있을 시) |

### 실행 + 결과 기록

각 체크박스에 대해:
1. 실행
2. 결과를 PASS / FAIL로 기록
3. FAIL이면 1회 재시도, 그래도 FAIL이면 다음으로 진행 + 마지막에 `[STATUS:GUARDRAIL_FAILED]`로 종료

**서버 띄워서 검증 필요한 경우**:
```bash
# 백그라운드로 dev 서버 띄우고
pnpm dev:server &
SERVER_PID=$!
sleep 3

# 검증 명령 실행
curl -sf http://localhost:3000/health || FAIL=true
# ...

# 정리
kill $SERVER_PID
```

### 결과 요약

```markdown
## E2E 검증 결과
- [x] /health → 200 OK (응답 시간 42ms)
- [x] POST /projects → dataDbName=proj_xxx, repoUrl 둘 다 있음
- [ ] **FAIL**: GitHub webhook signature mismatch (expected sha256=... got ...)
```

이 요약을 PR body에 포함.

---

## Phase 6 — Commit + PR

```bash
git add .
git commit -m "[ticket-${ISSUE_NUM}] ${ISSUE_TITLE}

Closes #${ISSUE_NUM}"

git push -u origin "$BRANCH"

gh pr create --repo bradyoo12/buildee \
  --title "$ISSUE_TITLE" \
  --body "Closes #${ISSUE_NUM}

## 변경 요약
$(git diff main --stat)

## E2E 검증 결과
$(cat /tmp/e2e-results.md)

## Done conditions
$(grep -A 100 '## Acceptance criteria' /tmp/issue.json | head -50)
"

PR_URL=$(gh pr view --repo bradyoo12/buildee --json url --jq .url)

gh issue comment $ISSUE_NUM --repo bradyoo12/buildee \
  --body "[STATUS:READY_FOR_REVIEW] PR: $PR_URL"
```

---

## 실패 시 행동 매트릭스

| 상황 | 행동 |
|---|---|
| Issue 본문에 Goal/Acceptance 없음 | `[STATUS:CLARIFICATION_NEEDED]` + STOP |
| 빌드/lint 1차 실패 | 자동 수정 1회 시도 |
| 빌드/lint 2차 실패 | `[STATUS:GUARDRAIL_FAILED]` + STOP |
| E2E 1개라도 FAIL | 끝까지 다 돌리고 결과 요약 → `[STATUS:GUARDRAIL_FAILED]` + STOP (PR 만들지 않음) |
| 모호한 작업 (예: "최적화하라" 만 있음) | `[STATUS:CLARIFICATION_NEEDED]` + STOP |
| GitHub API 실패 | 5초 대기 후 1회 재시도, 그래도 실패면 `[STATUS:ERROR]` |
| `git push` 충돌 | rebase 시도 1회, 실패하면 `[STATUS:ERROR]` + 사람 개입 |

---

## 비고

- Issue 본문에 `<!-- buildee:ticket:... -->` HTML 주석이 있으면 그게 본체 시스템(`apps/server`의 issue-builder.ts)이 만든 표준 템플릿. 없으면 Brad가 수동으로 만든 issue — 그 경우 더 보수적으로 (모호하면 STOP)
- 본체 레포(`bradyoo12/buildee`) 작업 전용. 사용자 사이트 repo(`buildee-projects/proj-*`)에서 돌릴 워커 슬래시 커맨드는 별도로 만든다 (그건 시스템이 자동 생성)
- Phase 4·5에서 dev 서버 띄울 때 — 환경변수가 필요. `.env`가 없으면 `[STATUS:CLARIFICATION_NEEDED]`로 멈추고 Brad가 셋업
