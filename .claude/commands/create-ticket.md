# /create-ticket

자연어 요청을 표준 템플릿의 GitHub Issue로 변환. **`b-start`가 자동으로 처리할 수 있는 형식** 보장.

핵심 원칙 (ai-dev-request에서 가져옴):
> Acceptance criteria는 **실제로 실행 가능한 명령**이어야 한다. "잘 동작한다" 금지.

---

## 인자

`/create-ticket <자연어 요청>` — 예: `/create-ticket Project 삭제 시 DB grace period 30일 후 자동 영구 삭제 동작 검증`

---

## Step 1 — 인자 파싱

```bash
REQUEST="$ARGUMENTS"
if [ -z "$REQUEST" ]; then
  echo "사용법: /create-ticket <자연어 요청>"; exit 1
fi
```

---

## Step 2 — 분류 (Claude가 직접 판단)

요청을 읽고 다음을 추정:

1. **Type**: `INFRA` / `SERVER` / `DATABASE` / `GITHUB` / `WORKER` / `EDITOR` / `BUG`
2. **Scope**: 어떤 폴더가 영향받는지 (`packages/db`, `apps/server`, `infra` 등)
3. **Risk**: HIGH (DB 마이그레이션 / 인증 / 결제 관련) / MEDIUM (API 변경) / LOW (내부 리팩토링)

---

## Step 3 — 표준 템플릿 작성

다음 형식 **엄격히** 준수. b-start가 파싱 가능해야 함.

```markdown
## Goal

(한 문장으로 무엇을 달성하는지)

## Context

- **Type**: ${TYPE}
- **Scope**: ${SCOPE}
- **Risk**: ${RISK}
- **관련 이슈**: (있으면 #N)

## Proposed changes

(어떤 파일을 어떻게 바꿀지. 추정이라도 OK — 작업 시 b-start가 조정)

- `apps/server/src/routes/xxx.ts`: ...
- `packages/db/prisma/schema.prisma`: ...

## Acceptance criteria

⚠️ **각 항목은 단일 명령으로 실행 가능해야 한다.** 모호한 항목 금지.

- [ ] (예: `pnpm --filter @buildee/server test -- xxx` 통과)
- [ ] (예: `curl -sf http://localhost:3000/xxx` → 200)
- [ ] (예: Prisma `pnpm migrate deploy` 적용 후 새 컬럼 존재)

## Done conditions (E2E)

⚠️ **실제 사용자 시나리오**. b-start가 실제로 실행해서 확인.

### 시나리오 1: (이름)
- **Given**: (초기 상태 — 구체적으로)
- **When**: (실행할 명령 / API 호출)
- **Then**: (검증 가능한 결과 — 숫자나 문자열)

### 시나리오 2: ...

## Out of scope

- (이번 티켓에서 안 할 것 명시 — scope creep 방지)
```

---

## Step 4 — 모호한 요청 거부

요청이 "최적화", "개선", "리팩터링" 같은 추상적이고 검증 불가능한 단어만 있으면:

1. Issue를 만들기 전에 Brad에게 명확화 요청 (Claude가 직접 응답으로):

```
요청이 모호해서 검증 가능한 티켓으로 만들기 어려워.
다음 중 하나로 좁혀줘:

(a) 구체적 행동: "X를 Y로 바꿔서 Z를 만족시킨다"
(b) 측정 가능한 목표: "응답 시간을 X ms 이하로"
(c) 사용자 시나리오: "사용자가 X 했을 때 Y 보여야 한다"
```

2. Brad의 답변 기다린 뒤 진행.

---

## Step 5 — Issue 생성 + Project Board (Ready로)

```bash
# Project board IDs 로드
source .claude/project-board.config
if [ -z "$PROJECT_ID" ] || [ -z "$STATUS_FIELD_ID" ]; then
  echo "ERROR: project-board.config 비어있음. 먼저 실행:"
  echo "  gh auth refresh -s project,read:project"
  echo "  bash .claude/scripts/setup-project-board.sh"
  exit 1
fi

gh issue create --repo bradyoo12/buildee \
  --title "${TYPE}: ${SHORT_GOAL}" \
  --body-file /tmp/ticket-body.md \
  --label "status" \
  --label "${TYPE_LOWER}"   # 존재하는 type 라벨만. 없으면 두 번째 --label 생략

ISSUE_NUM=$(gh issue list --repo bradyoo12/buildee --limit 1 --state open --json number --jq '.[0].number')
ISSUE_URL=$(gh issue view $ISSUE_NUM --repo bradyoo12/buildee --json url --jq .url)

# Project board 추가 + Ready로 이동
ITEM_ID=$(gh project item-add $PROJECT_NUMBER --owner $PROJECT_OWNER --url "$ISSUE_URL" --format json --jq '.id')
if [[ "$ITEM_ID" == PVTI_* ]]; then
  gh project item-edit --project-id $PROJECT_ID --id "$ITEM_ID" \
    --field-id $STATUS_FIELD_ID --single-select-option-id $OPT_READY
  bash .claude/scripts/gh-project-cache.sh save-item-id "$ISSUE_NUM" "$ITEM_ID"
fi

echo "Created: $ISSUE_URL (Ready 보드 등록)"
```

---

## Step 6 — Ticket 브랜치 + 실패 테스트 작성 (TDD red)

> 🔴 **목적**: b-start가 작업 시작할 때 "이 테스트가 통과하면 끝"이라는 객관적 기준이 이미 브랜치에 박혀있도록 한다. 현재는 fail해야 정상.

### 6-1. 브랜치 생성

브랜치는 항상 `<number>-<slug>` 형식 — type prefix 없이 티켓 번호로 시작. b-start가 같은 이름으로 검색해서 재사용한다:

```bash
SLUG=$(echo "$ISSUE_TITLE" | tr '[:upper:]' '[:lower:]' | tr -cs '[:alnum:]' '-' | cut -c1-30 | sed 's/-$//')
BRANCH="${ISSUE_NUM}-${SLUG}"   # 예: 4-grace-period-cleanup

git checkout main && git pull --rebase
git checkout -b "$BRANCH"
```

### 6-2. 테스트 파일 작성

Acceptance criteria의 각 항목 + Done conditions의 Given/When/Then 시나리오를 보고 **vitest 테스트**로 옮긴다.

**위치 결정 규칙**:
- Scope에 `apps/server` 포함 → `apps/server/test/ticket-${ISSUE_NUM}.test.ts`
- Scope에 `packages/db`만 → `packages/db/test/ticket-${ISSUE_NUM}.test.ts` (없으면 폴더 + `vitest` devDep + `"test": "vitest run"` 스크립트도 추가)
- 둘 다면 각각 작성

**테스트 작성 원칙**:
1. 파일 상단에 `// ticket: #N` 주석
2. Acceptance criteria 한 줄 = `it(...)` 한 개 (가능하면 1:1)
3. Done conditions의 Given/When/Then = `describe('시나리오 N', ...)` 안에 `it`들
4. **현재 코드로는 fail해야 정상** — 아직 미구현 함수/엔드포인트/컬럼을 직접 import/호출. import 자체가 실패하면 `it.skip` 대신 `it`으로 두고 fail 유도 OK
5. **mock 금지** — 실제 라우트/DB/모듈을 hit. b-start가 끝나면 진짜로 통과해야 하니까
6. 외부 의존(서버, DB) 필요한 항목은 `beforeAll`에서 셋업 — `.env` 부재 시 fail은 정상 (b-start가 셋업하면서 통과시킬 것)

예시 (Project 삭제 grace period):

```ts
// ticket: #N
import { describe, it, expect } from 'vitest';
import { hardDeleteExpiredProjects } from '../src/services/project-cleanup';

describe('ticket #N — Project 30일 hard delete', () => {
  it('AC1: hardDeleteExpiredProjects export 존재', () => {
    expect(typeof hardDeleteExpiredProjects).toBe('function');
  });

  describe('시나리오 1: 31일 경과한 soft-deleted Project', () => {
    it('Then: DB에서 영구 삭제된다', async () => {
      // Given: deletedAt = 31일 전
      // When: hardDeleteExpiredProjects() 호출
      // Then: SELECT count = 0
      const removed = await hardDeleteExpiredProjects();
      expect(removed).toBeGreaterThan(0);
    });
  });
});
```

### 6-3. 현재 fail 상태 확인 (RED)

```bash
# scope에 따라 해당 패키지 테스트만
pnpm --filter @buildee/server test -- ticket-${ISSUE_NUM} 2>&1 | tee /tmp/red-output.txt || true
```

**체크**:
- 최소 1개 이상 fail / build error 나야 정상
- 전부 PASS면 → 테스트가 너무 약하다. 더 엄격한 단언으로 다시 작성
- 전부 PASS인데도 정말 이미 구현돼있는 거라면 → ticket 자체가 불필요. issue에 `[STATUS:ALREADY_DONE]` 코멘트 후 close

```bash
# 결과 한 줄로 요약
RED_SUMMARY=$(grep -E '(Tests|Failed|passed|failed)' /tmp/red-output.txt | tail -3 | tr '\n' ' ')
```

### 6-4. 커밋 + 푸시

```bash
git add apps/server/test/ticket-${ISSUE_NUM}.test.ts \
        packages/db/test/ticket-${ISSUE_NUM}.test.ts 2>/dev/null || true
git add .  # vitest 설정 추가된 경우 대비

git commit -m "[ticket-${ISSUE_NUM}] add failing tests (RED)

Refs #${ISSUE_NUM}"

git push -u origin "$BRANCH"
```

### 6-5. Issue에 RED 상태 코멘트

```bash
gh issue comment $ISSUE_NUM --repo bradyoo12/buildee \
  --body "[STATUS:RED_TESTS_READY] branch: \`$BRANCH\`

현재 fail 중인 테스트 (b-start가 통과시킬 대상):
\`\`\`
$RED_SUMMARY
\`\`\`

다음: \`/b-start ${ISSUE_NUM}\`"
```

---

## Step 7 — Output

생성된 issue URL + 브랜치 + 다음 단계:

```
Created: https://github.com/bradyoo12/buildee/issues/N
Branch:  N-<slug>  (RED tests pushed)

다음:
  /b-start N    # 브랜치 checkout → 구현 → tests GREEN → PR
```

---

## 비고

- 본체 레포 전용. 사용자 사이트 repo의 ChangeRequest는 자체 시스템(`services/issue-builder.ts`)이 만들고 그 흐름은 분리
- Type 라벨이 부족하면 추가하지 말고 기본 `status` + 본문 Type 명시로 충분
- 위험도(Risk) HIGH인 경우 — Brad가 직접 검토 권장. b-start로 자동 처리 비추
- **Refs #N 컨벤션** — Step 6의 RED 커밋 + Step 7의 b-start 안내 모두 `Refs #N` 사용. `Closes/Fixes/Resolves` 금지 (b-start의 Step 5 검증 통과 후에만 명시적으로 close)
