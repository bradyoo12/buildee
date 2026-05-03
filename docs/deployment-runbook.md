# Buildee — Deployment runbook

처음부터 끝까지 순서대로 따라가면 Alpha 환경이 동작합니다. 예상 시간 90~120분.

---

## 0. 사전 준비 (10분)

### 필요한 것

| 도구 | 버전 | 확인 |
|---|---|---|
| Node.js | ≥ 20 | `node --version` |
| pnpm | ≥ 9 | `pnpm --version` |
| Azure CLI | latest | `az --version` |
| GitHub CLI | latest | `gh --version` |
| Git | latest | `git --version` |

### Azure 로그인

```bash
az login
az account show               # 구독 확인
az account set --subscription <id>   # 필요 시
```

### 시크릿 미리 생성 (한 번만)

`apps/server/.env`에 채워 넣을 시크릿들:

```bash
# JWT secret (32자)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Postgres admin password (강력하게)
node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"

# GitHub webhook secret (32자)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

각각 안전한 곳(1Password, Bitwarden 등)에 임시 저장.

---

## 1. 레포 통합 (15분)

### 1-1. 레포 클론

```bash
gh repo clone bradyoo12/buildee
cd buildee
```

### 1-2. 통합 archive 풀기

`buildee.tar.gz` (이 챗에서 받은 파일) 안에 모든 코드. 풀고 commit.

```bash
# tar.gz를 leveling 한 단계 아래에 풀기
tar -xzf ~/Downloads/buildee.tar.gz --strip-components=1

# 확인
ls -la
# packages/  apps/  infra/  docs/  .github/  package.json  pnpm-workspace.yaml  ...
```

### 1-3. 의존성 설치 + 타입 체크

```bash
pnpm install

# Prisma client 생성 (양쪽 schema)
pnpm --filter @buildee/db prisma:generate

# 전체 타입 체크
pnpm typecheck
```

❗ 타입 에러 0건이어야 함. 에러 나면 stop, fix 후 진행.

### 1-4. 첫 commit + push

```bash
git add .
git commit -m "Initial scaffold: Issue #1 + #2 + #3 (DB + server + GitHub App)"
git push origin main
```

`bradyoo12/buildee` 레포에서 코드 보이면 1단계 끝.

---

## 2. Azure 인프라 프로비저닝 (20분)

### 2-1. Resource group

```bash
az group create --name buildee-rg --location koreacentral
```

### 2-2. 본인 IP 확인 (Postgres firewall용)

```bash
curl -s ifconfig.me
# 예: 121.140.123.45
```

### 2-3. Bicep 배포

```bash
az deployment group create \
  --resource-group buildee-rg \
  --template-file infra/main.bicep \
  --parameters env=dev \
               pgAdminUser=buildee_admin \
               pgAdminPassword='<위에서 생성한 강력한 비밀번호>' \
               adminIp='<본인 IP>'
```

10~15분 걸림. 끝나면 outputs 출력:

```
serverUrl                 https://buildee-server-dev.azurewebsites.net
postgresHost              buildee-pg-dev.postgres.database.azure.com
keyVaultUrl               https://buildee-kv-dev-xxxxxx.vault.azure.net/
blobAccountName           buildeestdevxxxxx
appInsightsConnectionString InstrumentationKey=...
```

이 4개 값 메모해두기.

### 2-4. Key Vault에 본인 권한 부여 (시크릿 저장 가능하도록)

```bash
USER_OBJECT_ID=$(az ad signed-in-user show --query id -o tsv)
KV_NAME=$(az keyvault list --resource-group buildee-rg --query "[0].name" -o tsv)

az role assignment create \
  --role "Key Vault Secrets Officer" \
  --assignee $USER_OBJECT_ID \
  --scope $(az keyvault show --name $KV_NAME --query id -o tsv)
```

### 2-5. app_main DB 생성

Bicep이 만든 게 아니라 빠진 부분:

```bash
az postgres flexible-server db create \
  --resource-group buildee-rg \
  --server-name buildee-pg-dev \
  --database-name app_main
```

### 2-6. 로컬에서 마이그레이션 적용

```bash
# .env 임시 셋팅 (마이그레이션 한 번만 위해)
export DATABASE_URL_APP_MAIN="postgresql://buildee_admin:<password>@buildee-pg-dev.postgres.database.azure.com:5432/app_main?sslmode=require"

cd packages/db
pnpm prisma:migrate:deploy
# 또는 첫 마이그레이션 만들 때:
pnpm prisma migrate dev --name init
```

스키마가 적용됐는지 확인:

```bash
pnpm prisma studio
# → http://localhost:5555 에서 모든 테이블 비어있는 상태로 보여야 함
```

---

## 3. GitHub App 등록 (15분)

`docs/github-app-setup.md` 따라 진행. 핵심만 다시:

### 3-1. Org 생성

[GitHub.com](https://github.com) → 우상단 + → New organization (Free) → 이름: **`buildee-projects`**

### 3-2. App 등록

`buildee-projects` org → Settings → Developer settings → GitHub Apps → New GitHub App

| 필드 | 값 |
|---|---|
| Name | `Buildee` (전역 unique이라 안 되면 `Buildee-Dev` 등) |
| Homepage URL | `https://buildee-server-dev.azurewebsites.net` (위 outputs의 serverUrl) |
| Webhook URL | `https://buildee-server-dev.azurewebsites.net/webhook/github` |
| Webhook secret | 위에서 생성한 GitHub webhook secret |

**Repository permissions**: Contents (R/W), Issues (R/W), Pull requests (R/W), Metadata (R), Actions (R/W), Workflows (R/W)

**Subscribe to events**: Issues, Issue comment, Pull request, Pull request review, Push

**Where can this be installed**: Only on this account

### 3-3. App 정보 기록

App 생성 후:
- **App ID**: 위쪽 표시 (예: `1234567`) → 메모
- **Generate a private key** → `.pem` 파일 다운로드 → 안전한 곳에 (이 파일 잃어버리면 새로 발급)
- **Install App** → `buildee-projects` org에 → All repositories → 설치 후 URL의 `installations/<숫자>` 메모 (Installation ID)

### 3-4. Key Vault에 시크릿 저장

```bash
KV_NAME=$(az keyvault list --resource-group buildee-rg --query "[0].name" -o tsv)

# Postgres admin password
az keyvault secret set --vault-name $KV_NAME \
  --name pg-admin-password --value '<위에서 생성한 password>'

# JWT secret
az keyvault secret set --vault-name $KV_NAME \
  --name jwt-secret --value '<위에서 생성한 jwt secret>'

# GitHub App
az keyvault secret set --vault-name $KV_NAME \
  --name github-app-id --value '<App ID>'

az keyvault secret set --vault-name $KV_NAME \
  --name github-app-installation-id --value '<Installation ID>'

# Private key (.pem 파일 내용)
az keyvault secret set --vault-name $KV_NAME \
  --name github-app-private-key --file ~/Downloads/buildee.private-key.pem

# Webhook secret
az keyvault secret set --vault-name $KV_NAME \
  --name github-webhook-secret --value '<위에서 생성한 webhook secret>'

# Anthropic API key (Tier 2 폴백)
az keyvault secret set --vault-name $KV_NAME \
  --name anthropic-api-key --value '<sk-ant-...>'
```

확인:

```bash
az keyvault secret list --vault-name $KV_NAME --query "[].name" -o tsv
# 7~8개 시크릿 보여야 함
```

---

## 4. App Service 환경 변수 (10분)

App Service의 App Settings에 Key Vault 참조 형식으로 넣으면 자동 fetch.

```bash
RG=buildee-rg
APP=buildee-server-dev
KV_NAME=$(az keyvault list --resource-group $RG --query "[0].name" -o tsv)

# Helper: secret URI 만들기
SECRET_URI() { echo "@Microsoft.KeyVault(SecretUri=https://$KV_NAME.vault.azure.net/secrets/$1/)"; }

# 시크릿 값들 (Key Vault reference)
az webapp config appsettings set --resource-group $RG --name $APP --settings \
  "PG_ADMIN_PASSWORD=$(SECRET_URI pg-admin-password)" \
  "JWT_SECRET=$(SECRET_URI jwt-secret)" \
  "GITHUB_APP_ID=$(SECRET_URI github-app-id)" \
  "GITHUB_INSTALLATION_ID=$(SECRET_URI github-app-installation-id)" \
  "GITHUB_PRIVATE_KEY=$(SECRET_URI github-app-private-key)" \
  "GITHUB_WEBHOOK_SECRET=$(SECRET_URI github-webhook-secret)" \
  "ANTHROPIC_API_KEY=$(SECRET_URI anthropic-api-key)"

# 일반 값
PG_HOST=buildee-pg-dev.postgres.database.azure.com
az webapp config appsettings set --resource-group $RG --name $APP --settings \
  "DATABASE_URL_APP_MAIN=postgresql://buildee_admin:@PG_PASSWORD_PLACEHOLDER@$PG_HOST:5432/app_main?sslmode=require" \
  "PG_HOST=$PG_HOST" \
  "PG_PORT=5432" \
  "PG_ADMIN_USER=buildee_admin" \
  "PG_SSL=true" \
  "DATABASE_URL_PROJ_TEMPLATE=postgresql://placeholder@localhost:5432/placeholder" \
  "GITHUB_ORG=buildee-projects" \
  "CORS_ORIGINS=http://localhost:5173"
```

⚠️ `DATABASE_URL_APP_MAIN`은 password를 inline 못 넣음 (Key Vault reference 안에 다른 reference 못 씀). 해결 방법 두 가지:
- **방법 A (권장)**: 서버 코드가 `PG_HOST + PG_ADMIN_USER + PG_ADMIN_PASSWORD`에서 URL을 직접 만들도록 수정 (이미 그렇게 돼 있음 — `lib/config.ts`에서 두 곳 다 사용)
- **방법 B**: 전체 connection string을 통째로 한 시크릿에 저장

방법 A로 가면 `DATABASE_URL_APP_MAIN`은 startup에서 빌드. 위 명령에서 빼고, 대신 server 코드에 한 줄만 추가하면 됨. 다만 Prisma는 `DATABASE_URL` env가 필요하므로, server 시작 시 직접 set:

```typescript
// apps/server/src/server.ts 맨 위에 추가
if (!process.env.DATABASE_URL_APP_MAIN && process.env.PG_HOST) {
  process.env.DATABASE_URL_APP_MAIN =
    `postgresql://${process.env.PG_ADMIN_USER}:` +
    `${encodeURIComponent(process.env.PG_ADMIN_PASSWORD!)}` +
    `@${process.env.PG_HOST}:${process.env.PG_PORT}/app_main?sslmode=require`;
}
```

이 코드 추가 후 commit/push.

---

## 5. CI/CD 활성화 (10분)

### 5-1. App Service publish profile 다운로드

```bash
az webapp deployment list-publishing-profiles \
  --resource-group buildee-rg \
  --name buildee-server-dev \
  --xml > publish-profile.xml
cat publish-profile.xml | pbcopy   # macOS
# Windows: cat publish-profile.xml | clip
```

### 5-2. GitHub repo에 secrets 추가

```bash
gh secret set AZURE_WEBAPP_PUBLISH_PROFILE --repo bradyoo12/buildee < publish-profile.xml

# DB URL (마이그레이션 단계용)
gh secret set DATABASE_URL_APP_MAIN --repo bradyoo12/buildee \
  --body "postgresql://buildee_admin:<password>@buildee-pg-dev.postgres.database.azure.com:5432/app_main?sslmode=require"

rm publish-profile.xml
```

### 5-3. 첫 배포 트리거

이미 main에 push했으면 Actions 탭에서 워크플로 동작 확인. 안 됐으면 빈 commit:

```bash
git commit --allow-empty -m "Trigger first deploy"
git push
```

GitHub Actions에서 `Deploy server to Azure` 워크플로 → test → deploy 단계 통과 확인. 5~10분 걸림.

---

## 6. End-to-end 검증 (15분)

### 6-1. Health check

```bash
curl https://buildee-server-dev.azurewebsites.net/health
# {"status":"ok"}

curl https://buildee-server-dev.azurewebsites.net/health/deep
# {"status":"ok","checks":{"db":{"ok":true,"latencyMs":42},"keyVault":{"ok":true,"latencyMs":120}}}
```

❗ `db.ok=false`면 PG_HOST/password 문제. App Service 로그 확인:

```bash
az webapp log tail --resource-group buildee-rg --name buildee-server-dev
```

### 6-2. 사용자 가입 + JWT 발급

```bash
SERVER=https://buildee-server-dev.azurewebsites.net

# 가입
curl -X POST $SERVER/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"brad@example.com","name":"Brad"}'
# {"token":"eyJ...", "user":{"id":"...","email":"brad@example.com"}}

JWT="eyJ..."   # 받은 토큰 저장
```

### 6-3. Project 생성 (가장 복잡한 흐름)

이게 동작하면 **DB 생성 + Key Vault 저장 + GitHub repo 생성**이 모두 OK라는 뜻.

```bash
curl -X POST $SERVER/projects \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"name":"테스트 사이트","platform":"WEB","type":"LANDING"}'
# {"project":{"id":"...","name":"테스트 사이트","dataDbName":"proj_xxxxxxxx","repoUrl":"https://github.com/buildee-projects/proj-xxxxxxxx",...}}
```

확인 항목:
- ✅ `dataDbName` 있음 → Project DB 생성됨
- ✅ `repoUrl` 있음 → GitHub repo 생성됨
- GitHub.com에서 `buildee-projects/proj-xxxxxxxx` repo 보이는지 확인 → README + CLAUDE.md 있어야 함
- Postgres에서 `\l` 실행하면 새 DB 보여야 함:
  ```bash
  PGPASSWORD='<pw>' psql -h $PG_HOST -U buildee_admin -d postgres -c "\l proj_*"
  ```

### 6-4. Webhook 통합 검증

수동으로 issue 만들어서 webhook 트리거:

```bash
gh issue create --repo buildee-projects/proj-xxxxxxxx \
  --title "test ticket" --body "test"

# App Service 로그 보면 "GitHub webhook event" 한 줄 떠야 함
az webapp log tail --resource-group buildee-rg --name buildee-server-dev | grep "webhook"
```

### 6-5. WebSocket 검증

브라우저 개발자 도구 또는 wscat:

```bash
npm i -g wscat
wscat -c "wss://buildee-server-dev.azurewebsites.net/ws?token=$JWT"
# < {"type":"connected","userId":"..."}
```

---

## 7. 흔한 함정들

| 증상 | 원인 | 해결 |
|---|---|---|
| `health/deep` db.ok=false | Postgres firewall에 App Service IP 미등록 | Bicep이 `allow-azure-services` 룰 추가했어야. 안 됐으면 수동 추가 |
| `Failed to provision GitHub repo` | App ID/Installation ID/Private key 미스매치 | Key Vault 시크릿 다시 확인, Private key는 `.pem` 통째로 (`-----BEGIN ... END-----` 포함) |
| Webhook 401 (서명 mismatch) | Webhook secret이 GitHub App과 Key Vault에서 다름 | 둘 다 같은 값으로 통일 |
| `prisma migrate deploy` connect 실패 | password 안에 특수문자 URL encode 필요 | `encodeURIComponent` 처리 또는 영숫자만 사용 |
| App Service에서 module not found | pnpm workspace 의존성 빌드 시 누락 | `.github/workflows/deploy-server.yml`의 `pnpm install --prod` 단계 확인 |
| Key Vault reference 빈 값 | App Service에 Managed Identity 권한 없음 | Bicep이 부여했어야. 안 됐으면 `Key Vault Secrets User` 룰 수동 |

---

## 검증 체크리스트

배포 끝났을 때 다음이 모두 통과:

- [ ] `GET /health` → 200
- [ ] `GET /health/deep` → 모든 check ok
- [ ] `POST /auth/signup` → JWT 받음
- [ ] `POST /projects` → DB + repo 모두 생성
- [ ] GitHub.com에서 새 repo 확인 (README + CLAUDE.md)
- [ ] Postgres에서 `proj_*` DB 보임
- [ ] Key Vault에 `db-proj_*-password` 시크릿 저장됨
- [ ] 수동 issue → webhook 200, 서버 로그 출력
- [ ] WebSocket 연결 성공

이거 다 통과되면 **Alpha 환경 동작**. 다음은 PC 워커 데몬 + Editor 앱 만들 차례.

---

## 비용 예상

Alpha 환경 월 비용 (Azure):
- Postgres Flexible B1ms: ~$15/월
- App Service B1: ~$13/월
- Key Vault: ~$0.03/월 (시크릿 수에 따라)
- Storage Account: ~$0.50/월
- App Insights + Log Analytics: ~$2/월 (트래픽 적음)

**합계: 약 $30~35/월** (₩45,000)

PC 워커는 Brad 본인 PC + Claude Code Max plan이라 변동비 0. API 폴백 호출되면 그때 Anthropic API 과금.
