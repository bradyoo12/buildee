# ADR-0001: DB 레이아웃 — 단일 Postgres 서버 + Project별 분리 DB

**상태**: Accepted (MVP)
**날짜**: 2026-05-03
**관련 Issue**: #1

## 배경

Buildee는 사용자 사이트의 **운영 데이터** (양식 응답, 예약 정보 등)를 어딘가에 저장해야 한다. 동시에 시스템 자체의 메타데이터 (User, Project, Ticket, ChangeRequest, DecisionLog 등)도 관리한다.

이 두 종류의 데이터를 어떻게 분리·격리할지 4개 옵션을 검토했다.

## 검토한 옵션

### A) 단일 DB, 단일 schema, `project_id` 컬럼으로 격리
- 장: 가장 단순. 마이그레이션 1회
- 단: 데이터 격리 약함 (RLS 의존). Project 삭제 시 모든 테이블 cascade delete (느림). Project별 schema 진화 불가능

### B) 단일 DB, Project별 schema (`proj_xxx.form_submissions`)
- 장: schema 단위 격리. Project별 다른 컬럼 가능
- 단: schema 100개 넘으면 Postgres 성능 저하. 마이그레이션 적용 복잡

### C) Project별 별도 DB 서버
- 장: 완벽 격리 + 백업/복원 독립
- 단: 비용 폭발 (사용자 100명 = 서버 100개). MVP 비현실적

### D) 외부 BaaS (Supabase, Firebase 등) per Project
- 장: 인프라 책임 위임
- 단: vendor lock-in. 데이터 이동 어려움. 비용 예측 불가

### E) 단일 Postgres 서버 + Project별 분리 DB ← **선택**
- 장:
  - DB 단위 격리 (Postgres role + 권한 분리)
  - 단일 서버라 비용 통제 (Flexible Server B1ms 1개로 시작)
  - Project별 schema 진화 가능 (template + 마이그레이션)
  - 삭제 = `DROP DATABASE` (cascade 0개, 즉시)
  - 백업: 서버 단위 자동 백업으로 충분 (MVP)
- 단:
  - Prisma 멀티 클라이언트 셋업 필요
  - 동시 활성 connection pool 관리 (LRU 캐시로 mitigate)

## 결정

**E 선택**. 이유:

1. **격리 요구 vs 비용** 균형 가장 좋음. C는 비용 못 감당, A는 격리 약함
2. **Project 삭제 단순** = `DROP DATABASE` 한 줄. cascade delete 시간 폭증 없음
3. **권한 분리** = Project별 role + 비밀번호. 양식 처리 시 admin 권한 사용 안 함
4. **Prisma 멀티 클라이언트** 비용은 일회성. LRU 캐시로 동시 연결 200개 한도

## 구현 세부

- **app_main**: Prisma schema (16 모델). 시스템 전체 메타데이터
- **proj_xxxxxxxx**: Project당 1개 (UUID short ID 8자). 현재는 `form_submissions`만, 향후 확장
- **role**: `proj_xxxxxxxx_writer` (Project별). password는 Key Vault에 `db-proj_xxxxxxxx-password` 키로 저장
- **마이그레이션**: Project DB는 raw SQL 파일 (`packages/db/prisma/proj-migrations/V001__init.sql`). 시스템 업데이트 시 `migrateAllProjectDbs()` 백그라운드 실행
- **Prisma 멀티 클라이언트**: 두 schema → 두 generated client (`packages/db/src/generated/{app,project}-client/`). `@buildee/db` index.ts에서 모두 re-export

## 트레이드오프

- **단점 인정**: 마이그레이션 fan-out 비용. 사용자 1만 명 시 마이그레이션 1만 회 → Open Beta 전 모니터링 + 배치 적용 전략 필요
- **마이그레이션이 Project별로 비동기 적용** = 일시적으로 schemaVersion이 다른 Project들 공존. 코드는 schemaVersion 호환성 가정 (= forward-compatible 마이그레이션만 허용)

## 결과

- `packages/db/src/project-db-manager.ts`의 `createProjectDatabase()` / `dropProjectDatabase()` / `applyMigrations()` / `migrateAllProjectDbs()`
- LRU 캐시 (`packages/db/src/index.ts`의 `getProjectPrisma()`) — 200개 한도, 30분 미사용 정리

## 검증 시나리오

1. Project 생성 → 새 DB + role + 마이그레이션 적용 확인
2. Project 삭제 (30일 grace) → `DROP DATABASE` 후 `\l`로 사라진 것 확인
3. Project A의 role로 Project B의 DB 접근 시도 → 거부 (격리 검증)
4. 양식 응답 1만 건 저장 후 다른 Project 영향 없음 확인 (성능)

## 재검토 트리거

- 사용자 1000명 도달 시 동시 활성 connection 모니터링
- 마이그레이션 fan-out 시간이 30분 초과 시
- 데이터 백업 요구 강화 시 (개인정보보호법 보강)
