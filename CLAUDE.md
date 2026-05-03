# CLAUDE.md — Buildee 본체 컨텍스트

> 이 파일은 Claude Code가 매 세션 자동으로 읽는다. 새 chat을 열 때마다 처음부터 설명할 필요 없음.

## 1줄 정의

**Buildee** — 비개발자를 위한 AI 웹사이트 빌더. 자연어로 사이트 생성·편집·유지보수.

이 레포(`bradyoo12/buildee`)는 **MVP 인프라 + 오케스트레이션 서버 본체**. 사용자 사이트 코드는 별도 GitHub org(`buildee-projects`)의 private repo에 자동 생성된다.

## 폴더 구조

```
buildee/
├── packages/db/              # @buildee/db — Prisma + Project DB 매니저
├── apps/server/              # Fastify 오케스트레이션 서버
├── infra/main.bicep          # Azure 한 방 프로비저닝
├── docs/
│   ├── decisions/            # ADR (왜 이렇게 결정했는가)
│   ├── deployment-runbook.md # 처음부터 끝까지 배포 절차
│   └── github-app-setup.md   # GitHub App 등록 가이드
├── .claude/commands/         # Custom slash commands (b-start, create-ticket, ...)
├── .github/workflows/        # CI/CD (Azure App Service 배포)
└── CLAUDE.md                 # 이 파일
```

## 핵심 결정 요약

자세한 이유는 `docs/decisions/`. 여기는 결과만:

| 항목 | 결정 | 참고 |
|---|---|---|
| DB 레이아웃 | 단일 Postgres + Project별 분리 DB (option E) | [0001](docs/decisions/0001-data-layout.md) |
| 워커 라우팅 | PC (Claude Code Max) → API (Anthropic) → Tier 3 (사용자 opt-in) | [0002](docs/decisions/0002-worker-tiers.md) |
| 변경 카테고리 | CONTENT/CONFIG → fast-path; 나머지 → ticket/worker/PR | [0003](docs/decisions/0003-change-categories.md) |
| 가드레일 | 8 layer skeleton; **Layer 1·2·5 활성** | [0004](docs/decisions/0004-guardrails.md) |
| 버전 관리 | 불변 버전 + Project의 `current_*` 포인터로 라이브 상태 | [0005](docs/decisions/0005-immutable-versions.md) |
| 호스팅 | Azure App Service B1 + Postgres Flexible B1ms + Static Web Apps | — |
| 인증 (MVP) | 자체 placeholder; Closed Beta 전 Auth0/Clerk 또는 magic link | — |
| 모바일 | PWA (MVP); native iOS/Android는 GA 후 demand 보고 | — |

## 도메인 모델 (16 모델)

`packages/db/prisma/schema.prisma`에 전체. 핵심 엔티티:

```
User → Project → {SpecVersion, DesignSystem, PageComposition, CodebaseVersion, Deployment}
                ↓
              Ticket → TicketResult
                ↓
              ChangeRequest → DecisionLog
              FormDefinition → (Project DB의) FormSubmission
              Asset, ProviderHealth, WorkerHeartbeat
```

**중요**: 모든 버전은 불변 + parent 포인터. 라이브 상태는 `Project.current_*` 포인터 한 군데만 본다 = rollback이 포인터 이동만으로 가능.

## API 흐름 (전체 그림)

```
[사용자] 자연어 → POST /change-requests
   ↓
classification → 카테고리 판정
   ↓
 ┌── CONTENT/CONFIG (fast-path)
 │     ↓
 │   서버에서 직접 적용 → broadcastToUser(WS)
 │
 └── 나머지 (slow-path)
       ↓
     Ticket 생성 → GitHub Issue 자동 생성
       ↓
     [PC 워커] Issue 픽업 → 작업 → status 코멘트 → PR 생성
       ↓
     [GitHub] webhook → 사용자 앱 알림 (검토 요청)
       ↓
     [사용자] 승인 → POST /change-requests/:id/decision
       ↓
     PR squash merge → webhook → 새 CodebaseVersion → currentCodebaseVersionId 업데이트
       ↓
     Azure 자동 배포 → 라이브 반영
```

## 작업 규칙 (Claude Code가 따를 것)

### 코드 변경 시
1. **레이어 분리** — Spec → Design → Code. 가장 높은 적용 가능 레이어부터
2. **시크릿 inline 금지** — Key Vault 또는 env로 분리. `lib/key-vault.ts` 패턴 따라
3. **public API 변경 시 테스트 동행** — `routes/*.ts` 변경 → `test/*.test.ts` 함께
4. **Prisma schema 변경 시 마이그레이션 동행** — `pnpm --filter @buildee/db prisma migrate dev`
5. **트레이서빌리티** — 변경 파일 상단에 `// ticket: #N` 주석

### 의존성
- `pnpm` 사용 (npm/yarn 금지)
- 새 패키지 추가 시 단단한 이유 명시 (의존성 allowlist 정신)
- workspace 패키지(`@buildee/db`)는 source 직접 참조 (build dist 필요 없음)

### 가드레일 자체 실행
PR 만들기 전 로컬에서:
```bash
pnpm install --frozen-lockfile
pnpm --filter @buildee/db prisma:generate
pnpm typecheck
pnpm -r build
```

### Slash commands
- `/b-start <issue#>` — 이슈 픽업해서 자동 작업
- `/create-ticket "<자연어>"` — 자연어 → 표준 템플릿 issue
- `/create-ticket-log :env` — 운영 로그에서 자동 이슈 생성

자세한 건 `.claude/README.md`.

## 환경 변수

`.env.example` 참고. 핵심:
- `DATABASE_URL_APP_MAIN` — Postgres connection (또는 `PG_HOST` + `PG_ADMIN_USER` + `PG_ADMIN_PASSWORD`로 자동 합성)
- `JWT_SECRET` — 32자 이상
- `GITHUB_APP_ID`, `GITHUB_PRIVATE_KEY`, `GITHUB_WEBHOOK_SECRET`, `GITHUB_INSTALLATION_ID`, `GITHUB_ORG`
- `AZURE_KEY_VAULT_URL` (production)

production은 Key Vault references로 (`@Microsoft.KeyVault(SecretUri=...)`)

## 진행 단계

- [x] Issue #1 — Postgres + Prisma 데이터 레이어
- [x] Issue #2 — Fastify 오케스트레이션 서버
- [x] Issue #3 — GitHub App 통합
- [ ] Alpha 환경 배포 (Azure 인프라 + 검증) — `docs/deployment-runbook.md`
- [ ] PC 워커 데몬 구현 (사용자 사이트 repo 안에서 동작)
- [ ] Editor 앱 (React + Vite + iframe + postMessage)
- [ ] Closed Beta 진입 전: 인증 강화, Stripe, 이메일, E2E 테스트

## 검증되지 않은 가정 (리스크)

- **Anthropic Max plan 자동화 ToS** — Open Beta 진입 전 약관 재검토 필요
- **Claude Code 출력 일관성** — 가드레일 Layer 5(도메인 룰)가 흡수
- **PC 워커 가용성** — Tier 2 (API) 폴백으로 mitigate
- **분류 정확도** — 사용자 만족도 직결. system prompt 별도 파일로 분리 + iteration

## 다음 작업할 때

새 chat 또는 새 세션 시작 시:
1. 이 CLAUDE.md 자동으로 읽힘
2. 추가 컨텍스트 필요하면 `docs/decisions/` 참고
3. 진행 중 issue: `gh issue list --label claude-process --state open`
4. 작업 시작: `/b-start <issue#>`
