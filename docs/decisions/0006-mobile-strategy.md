# ADR-0006: 모바일 전략 — PWA MVP, native는 GA 후 결정

**상태**: Accepted (MVP)
**날짜**: 2026-05-03
**관련 Issue**: 추후 Editor 앱 issue에서 분기

## 배경

Buildee에는 두 가지 다른 "모바일" 질문이 있다.

1. **사용자가 만든 사이트의 모바일 대응** — 당연히 반응형. 별도 결정 사항 아님 (디자인 시스템에서 처리)
2. **Buildee 자체 앱 (Editor / 사용자 대시보드)의 모바일 지원** — 이게 결정 대상

대상 사용자가 비개발자 / 자영업자 / 1인 사업자 = **데스크톱 앞에 앉아있는 시간보다 폰 들고 있는 시간이 김**. "예약 알림 왔는데 답장만 빨리" "헤더 문구 오타 봤는데 폰에서 바로 고치고 싶음" 같은 시나리오가 실제 핵심 사용 패턴일 가능성 높음.

한편 모바일 앱 개발은 비용이 크다. MVP 단계에서 native까지 가면 출시가 분기 단위로 밀린다.

## 검토한 옵션

### A) PWA (Progressive Web App)만
- 장:
  - 코드 1개 (Editor 웹앱) → 데스크톱 + 모바일 양쪽
  - 앱스토어 심사 / 등록 비용 / 업데이트 지연 없음
  - iOS/Android 양쪽 동시 지원
- 단:
  - iOS Safari의 PWA 제약 (push 알림 늦게 지원, 설치 UX 빈약)
  - 네이티브 기능 일부 (카메라 정밀 제어, 백그라운드 sync 등) 제한
  - "앱이 없네" 라는 인식적 평가절하 가능

### B) Native iOS + Android (각자 또는 React Native)
- 장:
  - 앱스토어 존재감 = 신뢰 시그널
  - push 알림 / 배지 / 백그라운드 처리 강력
  - OS 통합 자연스러움
- 단:
  - 개발 / 유지보수 비용 2~3배
  - 앱스토어 심사 = 배포 lead time 며칠
  - 우리 출시 일정 분기 단위 지연 = MVP 의미 없어짐

### C) PWA MVP, 사용 데이터 보고 native 후속 결정 ← **선택**
- 장:
  - MVP 일정 보호
  - 실 사용 데이터 (모바일 비중, retention 차이, 어떤 기능을 모바일에서 쓰는지)로 native 투자 정당화
  - native 가더라도 PWA는 백업으로 유지 (데스크톱 / 비주류 OS 커버)
- 단:
  - 결정 미루는 셈. 후속 결정 트리거를 명확히 안 두면 영원히 PWA만 됨

### D) 모바일 미지원 (데스크톱 전용)
- 장: 가장 단순
- 단: 타깃 사용자 핵심 use case 포기. 검토 가치 거의 없음

## 결정

**C 선택**. MVP는 PWA로:

1. Editor 앱은 처음부터 반응형 + PWA manifest + service worker
2. iOS/Android 사용자 모두 "홈 화면에 추가" 안내
3. push 알림은 PWA의 Web Push API로 (iOS는 16.4+ 지원, 모자란 부분은 이메일 폴백)
4. Native 앱은 GA (Closed Beta 종료 후 Public 출시) 시점까지 보류

## 구현 세부

- **PWA 요건**: manifest.json + service worker (offline shell) + HTTPS (Azure Static Web Apps 기본 제공)
- **Push 알림**: VAPID 키. push 미지원 환경은 이메일 폴백 (사용자 설정에서 선택 가능)
- **모바일 전용 UX 고려**: 변경 승인 / 알림 확인 / 텍스트 빠른 수정은 폰에서 자주, 디자인 큰 변경은 데스크톱이 자연스러움 — 양쪽 navigation 분리 검토
- **데이터 수집**: device class / 세션 지속시간 / 기능별 사용 비중 분석. native 결정 트리거 데이터로

## 트레이드오프

- **iOS PWA의 한계 인정** — 설치 동선이 어색하고, push가 OS 알림센터와 native만큼 매끄럽지 않음. iOS 사용자 비중이 큰 시장 (한국 등)에서 약점
- **앱스토어 부재의 마케팅 손실** — "앱 다운로드" 광고 카피 / 앱스토어 검색 유입 못 씀. 초기 acquisition 채널 좁음
- **Native 결정을 미루는 비용** — native로 가기로 결정한 시점에 PWA에 쌓인 UX / 라우팅 / 상태 관리 가정이 React Native로 옮길 때 충돌 가능. 이를 줄이려면 처음부터 비즈니스 로직 / 네트워크 / 상태를 UI에서 분리한 구조로 작성 (= 좋은 관행이라 어차피 해야 함)

## 재검토 트리거

- Closed Beta → GA 시점에 사용 데이터 정식 검토
- 모바일 세션 비중이 60% 초과 + iOS PWA push 누락으로 인한 사용자 불만 누적 → native iOS 우선 검토
- 앱스토어 부재가 acquisition 병목으로 측정되면 → 마케팅 채널과 별개로 native 결정 가속
- iOS의 PWA 제약이 의미 있게 풀리면 (Apple 정책 변화) → native 필요성 자체 재평가
- 경쟁 제품이 native로 차별화 + 우리 retention이 그쪽으로 빠지면 → 즉시 우선순위 상향
