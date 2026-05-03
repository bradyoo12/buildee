# ADR-0005: 불변 버전 + Project의 `current_*` 포인터로 라이브 상태

**상태**: Accepted (MVP)
**날짜**: 2026-05-03
**관련 Issue**: #1

## 배경

사이트 빌더의 본질적 사용 패턴 — **사용자가 실험적으로 변경 → 마음에 안 들면 되돌림**. 비개발자에게 "rollback"은 도구의 핵심 안전망. "되돌릴 수 없다"는 인식이 한 번이라도 박히면 자유롭게 변경하지 못함 = 제품 가치 붕괴.

데이터 모델 옵션 4개를 검토했다. 핵심 질문: **"라이브 상태"를 어떻게 표현하는가**.

## 검토한 옵션

### A) 단일 mutable record + 별도 history 테이블
- 장: 친숙. 대부분 CRUD 앱이 이렇게
- 단:
  - history는 부수 효과 → 까먹기 쉬움 (트리거 / 코드 곳곳에서 INSERT)
  - rollback = mutable record를 history 값으로 덮어쓰기 = 또 다른 history row 발생. 의미 모호
  - 동시 수정 충돌 처리 어려움

### B) 매 변경 시 전체 스냅샷 복사
- 장: 시점 복원 단순
- 단: 저장 비용 폭증. 작은 변경 1000번 = 전체 사이트 데이터 1000개 사본

### C) 불변 버전 + parent 포인터 + Project의 `current_*` 포인터 ← **선택**
- 장:
  - **라이브 상태 = `Project.current_*`가 가리키는 row** 한 군데만 본다 → rollback = 포인터 이동 한 번
  - 모든 변경이 자연스럽게 이력화 (INSERT-only)
  - Git mental model과 일치 (commit DAG + HEAD)
  - 동시성: INSERT는 충돌 없음, 충돌 가능 지점은 포인터 갱신 한 곳만 (CAS)
- 단:
  - 모델 늘어남 (SpecVersion, DesignSystem, PageComposition, CodebaseVersion 각각)
  - "현재 라이브 상태"를 보려면 join 1단계 더

### D) Git만 사용 (DB는 메타데이터만)
- 장: 이력은 Git이 잘함
- 단: fast-path CONTENT/CONFIG 변경마다 commit = noisy. 분류 / 사용자별 라이브 상태 / decision log 등 메타와 결합 어려움

## 결정

**C 선택**. 규칙:

1. **버전 모델은 INSERT-only** — `SpecVersion`, `DesignSystem`, `PageComposition`, `CodebaseVersion` 모두. UPDATE 금지 (스키마/PR 리뷰로 강제)
2. **각 버전은 `parentId`** — 어떤 버전에서 파생됐는지. DAG 형성 (분기/머지 가능)
3. **라이브 상태는 `Project.current_<X>_id`** — 예: `currentPageCompositionId`, `currentCodebaseVersionId`
4. **Rollback = 포인터 이동** — 새 row INSERT 없이 `current_*`를 과거 버전 id로 변경. (감사용으로는 어떤 시점에 어떤 포인터가 어디로 움직였는지 별도 로그)
5. **변경 적용 흐름** — 새 버전 INSERT (parent = 현재 current) → 검증 통과 → `current_*` 갱신을 한 트랜잭션에서

## 구현 세부

- **schema 위치**: `packages/db/prisma/schema.prisma` — 16 모델 중 5개가 버전 모델
- **`DecisionLog`**: 누가 / 언제 / 왜 어느 포인터를 어디로 옮겼는지. rollback 사후 분석용
- **CodebaseVersion만 Git과 1:1** — `commit_sha` 필드 보유. PR squash merge webhook에서 새 row INSERT + Project.currentCodebaseVersionId 갱신
- **Spec / Design / PageComposition은 DB-only** — Git에 안 가는 추상 모델. fast-path가 직접 INSERT
- **Cleanup 정책**: orphan 버전 (어떤 current도 가리키지 않고 N일 경과)은 정리 가능. MVP는 정리 안 함 (저장 비용 미미, 실수 복원 안전망 우선)

## 트레이드오프

- **모델 수 / join 비용 증가** — 모든 "현재" 조회가 `Project → current_*_id → 버전 row` 한 단계. 핫패스에는 캐시 (Redis 또는 in-memory) 검토 필요. MVP는 그냥 join
- **분기 / 머지 복잡성** — DAG는 표현 가능하지만 UI / 충돌 해결 정책은 정의 안 함 (MVP는 단일 trunk만 사용). 다중 사용자 동시 편집 도입 시 재설계 필요
- **저장 비용 누적** — INSERT-only라 row 수가 단조 증가. 대형 PageComposition row가 자주 변경되면 무시 못 할 수도. 모니터링 후 cleanup 정책 도입
- **rollback의 "재실행" 의미 모호** — 포인터를 과거로 옮기면 그 사이의 변경들은 살아있는 row지만 라이브 아님. 사용자에게는 "되돌렸음"으로만 보여줌 (= 단순 mental model 유지)

## 재검토 트리거
- 단일 Project의 PageComposition 누적 row가 10000 초과 시 → cleanup 정책 또는 압축 필요
- 라이브 조회 latency가 p95 > 200ms → 캐시 레이어 도입
- 다중 사용자 동시 편집 요구 발생 시 → DAG 머지 / 충돌 정책 신규 ADR 작성
- Git과 DB 버전 사이 drift (commit_sha 불일치) 사고 발생 시 → 단일 source of truth 재선언
