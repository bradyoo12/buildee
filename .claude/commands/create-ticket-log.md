# /create-ticket-log

운영 환경 로그(Azure App Insights / 로컬 / staging)에서 에러를 찾아 자동으로 GitHub Issue 생성.

ai-dev-request의 `create-ticket-log` 패턴을 Buildee 본체 환경으로 이식.

---

## 인자

```
/create-ticket-log :env [--minutes N] ["situation"]
```

| 인자 | 설명 | 예시 |
|---|---|---|
| `:env` | 환경 토큰 (필수) | `:local`, `:staging`, `:prod` |
| `--minutes N` | 최근 N분 (기본 30분) | `--minutes 60` |
| `"situation"` | 따옴표 안 자연어 (있으면 investigate 모드) | `"Project 생성하면 500 에러"` |

**Mode**:
- `$SITUATION` 없음 → **scan mode**: 최근 N분 ERROR 로그 → 5건까지 티켓
- `$SITUATION` 있음 → **investigate mode**: 그 상황과 매칭되는 로그 1건 → 단일 티켓 + (옵션) 로깅 보강 PR

---

## Step 0 — 인자 파싱

```bash
ENV_TOKEN=""
MINUTES=30
SITUATION=""

for arg in $ARGUMENTS; do
  case $arg in
    :*) ENV_TOKEN="${arg#:}" ;;
    --minutes) shift; MINUTES=$1 ;;
    \"*\") SITUATION="${arg//\"/}" ;;
  esac
done

if [ -z "$ENV_TOKEN" ]; then
  echo "환경 지정 필요: :local | :staging | :prod"; exit 1
fi
```

---

## Step 1 — 환경 config

```bash
case $ENV_TOKEN in
  local)
    API_BASE="http://localhost:3000"
    AZURE_APP_NAME=""               # Azure 로그 없음
    DB_URL_VAR="DATABASE_URL_APP_MAIN"
    ;;
  staging)
    API_BASE="https://buildee-server-staging.azurewebsites.net"
    AZURE_APP_NAME="buildee-server-staging"
    DB_URL_VAR="DATABASE_URL_APP_MAIN_STAGING"
    ;;
  prod)
    API_BASE="https://buildee-server-prod.azurewebsites.net"
    AZURE_APP_NAME="buildee-server-prod"
    DB_URL_VAR="DATABASE_URL_APP_MAIN_PROD"
    ;;
  *)
    echo "Unknown env: $ENV_TOKEN"; exit 1
    ;;
esac
```

> 📌 **TODO** (Brad 확인): 실제 Azure Web App 이름이 위와 다르면 수정. MVP는 `buildee-server-dev` 하나만 있을 가능성 높음 — 그 경우 `staging`을 그걸로 매핑.

---

## Step 2 — 로그 수집

### Azure (staging/prod)

```bash
if [ -n "$AZURE_APP_NAME" ]; then
  az webapp log download \
    --resource-group buildee-rg \
    --name $AZURE_APP_NAME \
    --log-file /tmp/azure-logs.zip
  unzip -o /tmp/azure-logs.zip -d /tmp/azure-logs
  
  # 최근 N분 ERROR + WARN 추출 (pino 형식 가정)
  find /tmp/azure-logs -name "*.log" -mmin -$MINUTES -exec cat {} \; | \
    grep -E '"level":(40|50|60)' > /tmp/recent-errors.jsonl
fi
```

또는 App Insights KQL (App Insights connection 있으면 더 좋음):

```bash
# 향후 강화: az monitor app-insights query
```

### Local

```bash
if [ "$ENV_TOKEN" = "local" ]; then
  # dev 서버가 stdout 로그를 /tmp/buildee-dev.log로 redirect 한다고 가정
  if [ ! -f /tmp/buildee-dev.log ]; then
    echo "로컬 로그 파일 없음. 'pnpm dev:server > /tmp/buildee-dev.log 2>&1 &' 로 시작"
    exit 1
  fi
  tail -n 5000 /tmp/buildee-dev.log | \
    grep -E '"level":(40|50|60)' > /tmp/recent-errors.jsonl
fi
```

### DB unified logs (모든 환경)

```bash
# decision_logs 테이블의 최근 에러 동반 항목 (있으면)
psql "${!DB_URL_VAR}" -c "
  SELECT id, entity_type, entity_id, reasoning, created_at
  FROM decision_logs
  WHERE created_at > NOW() - INTERVAL '$MINUTES minutes'
    AND reasoning ILIKE '%error%'
  ORDER BY created_at DESC
  LIMIT 50
" -A -t -F $'\t' >> /tmp/recent-errors.jsonl 2>/dev/null || true
```

---

## Step 3 — 클러스터링 (scan mode 한정)

같은 에러가 여러 번 발생하면 1개 티켓으로 묶음. **fingerprint** = (error type) + (route) + (top stack frame).

```bash
# 단순 우선: error message + route URL을 키로 group
jq -s '[
  group_by(.msg + (.req.url // ""))[]
  | {
      count: length,
      sample: .[0],
      first_seen: (map(.time) | min),
      last_seen: (map(.time) | max)
    }
] | sort_by(-.count) | .[0:5]
' /tmp/recent-errors.jsonl > /tmp/clusters.json
```

---

## Step 4 — Issue 생성 (각 cluster 또는 situation)

### Investigate mode (`$SITUATION` 있음)

1. `/tmp/recent-errors.jsonl`에서 `$SITUATION`과 매칭되는 항목 찾기 (Claude가 LLM 매칭)
2. 매칭 0건이면 → **로깅 보강 PR 모드** (Step 5)
3. 매칭 있으면 → 표준 템플릿으로 issue 생성

### Scan mode

각 cluster를 issue 1개로:

```markdown
## Goal

${env}에서 발생하는 에러 수정: "${error_msg}"

## Context

- **환경**: ${env}
- **첫 발생**: ${first_seen}
- **마지막 발생**: ${last_seen}
- **발생 횟수**: ${count}회 (최근 ${MINUTES}분)
- **영향받는 endpoint**: ${route}
- **fingerprint**: ${error_type}@${route}

### 샘플 로그
\`\`\`json
${sample_log_pretty}
\`\`\`

## Proposed changes

(추정 — b-start가 조정)
- 영향 파일: `apps/server/src/routes/${route}.ts` (추정)
- ...

## Acceptance criteria

- [ ] 동일 fingerprint 에러가 ${env}에서 30분 이상 미발생 (모니터링 후 재확인)
- [ ] 단위 테스트 추가: 이 케이스 재현 시 이전엔 fail, 수정 후 pass
- [ ] (가능하면) 같은 에러가 dev에서 재현되는 단위 테스트가 main에 들어감

## Done conditions

### 시나리오 1: 에러 재현 검증
- **Given**: 위 샘플 로그의 입력 조건 동일하게 재현
- **When**: ${route}에 동일 요청
- **Then**: 200 OK (또는 4xx 의도된 응답)
```

```bash
gh issue create --repo bradyoo12/buildee \
  --title "[BUG/${env}] ${short_msg}" \
  --body-file /tmp/issue-body.md \
  --label "claude-process,type:bug,env:${env}"
```

---

## Step 5 — NO_MATCH 케이스 (investigate mode 한정)

`$SITUATION` 매칭되는 로그 0건 = **로깅 부족**. 자동 보강:

1. **코드 검색**: `$SITUATION`과 관련된 코드 위치 grep (route handler, service 등)
2. **로깅 코드 삽입**: 적절한 지점에 `req.log.info({...})` 추가
3. **브랜치 + commit + push**:
   ```bash
   git checkout -b "logging/${slug}"
   git commit -m "Add logging for: ${short_situation}"
   git push -u origin "logging/${slug}"
   ```
4. **Draft PR**:
   ```bash
   gh pr create --draft \
     --title "Add logging: ${short_situation}" \
     --body "관련 상황 발생 시 추적 위해 로깅 추가. 본 PR 머지 후 ${env}에서 재발 시 다시 /create-ticket-log."
   ```
5. **Issue 생성**: "로깅 부족 — 관찰 후 재시도" 티켓 + PR 링크

---

## Important Notes

- **Max 5 tickets per run** in scan mode (cluster 상위 5개)
- **Investigate mode**은 상황당 1개 티켓 (+옵션 PR) 만
- **`:local`**에서는 Azure 로그 스킵
- **Auto PR은 draft 상태**로 열림 — Brad가 리뷰 후 ready-for-review로 전환
- **비밀정보 로깅 금지** — 로그 추가 시 토큰/비밀번호/full request body 포함 안 함. PII redaction (lib/logger.ts pino redact 패턴 참고)

---

## TODO (Brad 확인 필요)

1. **Azure Web App 이름**: 위 `:staging` / `:prod` 매핑 정확히 확인
2. **DB connection string env 변수명**: `DATABASE_URL_APP_MAIN_STAGING` / `_PROD` 사용할지, 아니면 단일 `DATABASE_URL_APP_MAIN`을 환경별로 다르게 할지 컨벤션 결정
3. **App Insights 통합**: 현재는 `az webapp log download` 기반. App Insights KQL이 더 강력하니 시간 되면 전환

---

## 비고

ai-dev-request의 원본은 buildee.io 도메인 + xbert/buildee 비즈니스 컨텍스트라서 일부 fingerprint 룰이 다를 수 있음. 본체 레포는 backend라 frontend-style 에러 (UI 깨짐 등)는 거의 없을 것 — DB connection / GitHub API / Postgres pool / webhook signature 류가 대부분.
