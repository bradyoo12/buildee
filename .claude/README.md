# Buildee `.claude/`

Claude Code custom slash commands. ai-dev-request의 패턴을 Buildee 본체 컨텍스트로 이식.

## 커맨드

| 커맨드 | 용도 |
|---|---|
| `/create-ticket <자연어>` | 자연어 → 표준 템플릿 GitHub Issue (b-start 호환) |
| `/create-ticket-log :env [opts]` | 운영 로그 → 자동 이슈 (scan / investigate 모드) |
| `/b-start [issue_num]` | 이슈 픽업 → 작업 → 가드레일 → E2E 검증 → PR |

## 핵심 원칙

> 티켓 Done ≠ 목적 달성

`b-start`의 Phase 5 (Acceptance criteria 실제 실행)가 가장 중요. 모호한 acceptance는 거부.

## 워크플로

```
[Brad: "X 기능 추가해줘"]
        ↓
   /create-ticket "X 기능 추가"
        ↓
   GitHub Issue #N (표준 템플릿)
        ↓
   /b-start N
        ↓
   브랜치 → 작업 → 가드레일 → E2E 검증 → PR
        ↓
   [Brad: 리뷰 → 머지]
        ↓
   GitHub Actions → Azure 배포
```

## 운영 모니터링

```
[에러 발생]
   ↓
 /create-ticket-log :prod --minutes 60
   ↓
 cluster 상위 5개 → Issue 자동 생성
   ↓
 /b-start <num>  ← 이슈별로 처리
```

## settings.local.json

명시적 allowlist (Bash 와일드카드 X). 새 명령 prefix 필요해지면 추가:

- `node`, `pnpm`, `npm`, `npx`, `tsx` — Node 생태계
- `git`, `gh` — Git/GitHub
- `az` — Azure CLI
- `prisma`, `psql` — DB
- `curl`, `jq` — API + JSON
- 일반: `ls`, `cat`, `echo`, `mkdir`, `rm`, `cp`, `mv`, `cd`, `grep`, `find`, `sleep`, `test`, `date`, `head`, `tail`, `wc`, `sort`, `diff`, `tar`

## ai-dev-request 원본과의 차이

| 항목 | ai-dev-request | Buildee 본체 |
|---|---|---|
| 언어 | C#/.NET (추정) | Node.js + TypeScript |
| 명령 prefix | `dotnet`, `python`, `cross-env` | `pnpm`, `prisma`, `tsx` |
| 환경 도메인 | `staging.buildee.io`, `www.buildee.io` | `buildee-server-*.azurewebsites.net` |
| Azure App | `ai-dev-request-api`, `-staging` | `buildee-server-dev` (현재) |
| 가드레일 | 비즈니스 규칙 + UI | DB schema 마이그레이션 동행, 시크릿 검사, public API 변경 시 테스트 동행 |
| Frontend 가드레일 | 있음 | **제거됨** (본체는 backend 단독) |

원본의 진화된 로직 — 특히 `b-start`의 Phase 5 E2E 검증, `create-ticket-log`의 NO_MATCH → 로깅 보강 PR — 그대로 가져왔다.

## 마이그레이션 체크리스트

ai-dev-request 원본을 가져와서 검토할 때 확인할 것:

- [ ] `b-start.md`에 추가 Phase가 있는지 (e.g. Brad가 별도 단계 추가했을 수 있음)
- [ ] `create-ticket.md`의 분류 로직 (Type 카테고리)
- [ ] `create-ticket-log.md`의 fingerprint 추출 룰
- [ ] `settings.local.json`에 추가 권한이 있는지
- [ ] `.claude/agents/*.md` (sub-agent 파일들 — 있을 수 있음)
- [ ] `.claude/hooks/*` (있을 수 있음)

원본과 diff 후 필요한 부분만 머지.

## 향후 추가 후보

- **사용자 사이트 repo용 슬래시 커맨드** — Buildee가 자동 생성하는 `proj-*` repo 안에 PC 워커가 사용할 별도 `b-start`. 본체 시스템(`apps/server/templates/CLAUDE.md.template` 참고)이 자동 배치
- **`/b-deploy`** — 머지 후 Azure 배포 상태 확인 + 헬스체크 자동화
- **`/b-rollback`** — 잘못 머지된 commit revert + redeploy
