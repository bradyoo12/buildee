# ADR-0002: 워커 라우팅 — PC → API → Tier 3 (사용자 opt-in)

**상태**: Accepted (MVP)
**날짜**: 2026-05-03
**관련 Issue**: 추후 워커 데몬 issue 발행 예정

## 배경

자연어 요청이 slow-path로 분기되면 (자세한 분기 기준은 [0003](0003-change-categories.md)) Ticket → 워커 → PR 흐름을 탄다. 이 "워커"가 실제로 코드를 작성하는 주체. 누가 / 어떤 백엔드로 돌리느냐에 따라 비용 구조 / latency / ToS 리스크가 완전히 달라진다.

옵션 4개를 검토했다.

## 검토한 옵션

### A) Anthropic API 단독 (종량제)
- 장: 가장 단순. 서버에서 직접 호출. 폴백 불필요
- 단: **비용 예측 불가**. 사용자 1명이 큰 변경 100개 던지면 그 달 마진 증발. 무료 체험 단계에서 burn rate 통제 불가능

### B) PC 워커 단독 (Claude Code Max 정액)
- 장: 정액제라 비용 캡 명확. CLI Claude Code의 도메인 지식 (codebase 탐색, 멀티턴 자가수정) 그대로 활용
- 단:
  - PC 한 대 다운 = 전체 큐 정지
  - 동시 처리량 제한 (Max plan rate limit)
  - **Anthropic ToS 회색지대** — 자동화 사용에 대한 명시적 허가 없음 (CLAUDE.md "검증되지 않은 가정" 참고)

### C) 외부 코딩 SaaS (Replit Agents, Cursor BG 등)
- 장: 인프라 책임 위임
- 단: vendor lock-in. 우리 codebase 컨벤션 / 가드레일 ([0004](0004-guardrails.md)) 적용 불가

### D) PC → API → Tier 3 (사용자 opt-in 자체 키) ← **선택**
- 장:
  - 평소: PC 워커 (정액제, 마진 보호)
  - PC 다운 / rate limit 도달: API 자동 폴백 (가용성 보장)
  - 헤비 유저: 자체 Anthropic 키 등록 → 그 사용자 요청은 본인 키로 (우리 비용 0, 사용자는 무제한)
- 단: 라우팅 로직 / 키 격리 / 사용량 측정 3중 복잡

## 결정

**D 선택**. 3단계 fallback 라우팅:

1. **Tier 1 (PC)** — `WorkerHeartbeat`이 살아있는 PC 워커가 있고, 큐 깊이 < 임계치면 PC로
2. **Tier 2 (API)** — PC 큐 적체 / 모든 PC heartbeat 끊김 / Tier 1 작업 N분 무응답 시 Anthropic API로 폴백
3. **Tier 3 (사용자 키)** — 사용자가 settings에서 본인 Anthropic 키 등록 시, 해당 사용자 요청은 무조건 그 키로 (Tier 1/2 미사용)

## 구현 세부

- **`WorkerHeartbeat` 모델** — PC 워커가 30초마다 ping. 90초 이상 누락 시 dead 처리
- **`ProviderHealth` 모델** — Tier 2 폴백 시 호출 메타 (latency, error rate) 기록. circuit breaker 입력
- **사용자 키** — `User.anthropic_api_key_encrypted` (Key Vault 데이터 키로 envelope encrypt). 평문은 메모리에만, 워커 호출 시점에만 복호화
- **사용량 측정** — Tier별 토큰 / 비용 분리 집계. 월 청구서에 "본인 키 사용분 X개 (비용 0)" 표시 → [0007](0007-billing-recommendation.md)와 연동

## 트레이드오프

- **PC 워커 ToS 리스크 잔존** — D는 Tier 1을 PC로 둠으로써 비용 모델은 살리지만 ToS 회색지대는 그대로. Open Beta 진입 전 약관 재검토 + 필요 시 Tier 1 → API 강등 시나리오 준비
- **Tier 3 운영 부담** — 사용자 키 보관 = 사고 시 책임. envelope encryption + 정기 rotation + 접근 감사 로그 필수
- **라우팅 결정 latency** — heartbeat 조회 / 큐 깊이 측정에 매 요청 ~50ms 추가. fast-path는 영향 없음 (slow-path만)

## 재검토 트리거

- PC 워커 다운타임이 월 1% 초과 시 → Tier 1을 API로 영구 강등 검토
- Anthropic이 Max plan 자동화 정책을 명문화하면 (어느 방향이든) 즉시 재평가
- Tier 3 등록 사용자가 활성 사용자의 30% 초과 시 → 가격 정책 재설계 (현재 Tier 3는 power user 안전판이지만, 다수가 되면 우리 매출 모델 흔들림)
- API 비용이 PC 정액 비용을 정기적으로 초과하면 → 라우팅 임계치 조정
