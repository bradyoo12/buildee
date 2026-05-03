# GitHub App 등록 가이드 (한 번만)

Issue #3의 외부 작업. 코드 작성 전에 한 번 진행.

## 1. Organization 생성

GitHub.com → 우상단 + → New organization → **Free 플랜**

- 이름: `buildee-projects` (또는 `buildee-prod`, `buildee-dev` 환경별)
- 사용자 사이트의 코드 저장소 역할. 사용자에게 노출 안 됨

## 2. GitHub App 생성

`buildee-projects` org의 settings → Developer settings → GitHub Apps → **New GitHub App**

### 기본 정보

| 항목 | 값 |
|---|---|
| GitHub App name | `Buildee` (전역 unique) |
| Homepage URL | `https://buildee.app` (도메인 미구매면 임시 GitHub URL) |
| Description | "Buildee — AI website builder for non-developers" |
| Webhook Active | ✅ 체크 |
| Webhook URL | `https://<server-domain>/webhook/github` (App Service URL) |
| Webhook secret | 강력한 랜덤 문자열 (`openssl rand -hex 32`) |

### Repository permissions

| 권한 | Access |
|---|---|
| Contents | Read & write |
| Issues | Read & write |
| Pull requests | Read & write |
| Metadata | Read-only |
| Actions | Read & write (PR CI 트리거용, 나중에) |
| Workflows | Read & write |

### Subscribe to events

- ✅ Issues
- ✅ Issue comment
- ✅ Pull request
- ✅ Pull request review
- ✅ Push

### Where can this GitHub App be installed?

`Only on this account` — `buildee-projects` org 안에만 설치

### 생성 후

1. **App ID** 기록 (예: `1234567`)
2. **Generate a private key** → `.pem` 파일 다운로드 (Key Vault에 저장)
3. **Install App** → `buildee-projects` org에 설치, **All repositories** 선택 (org 안 모든 repo에 자동 적용)
4. 설치 후 URL의 `installation_id` 기록 (`https://github.com/organizations/buildee-projects/settings/installations/<ID>`)

## 3. Key Vault에 시크릿 저장

```bash
# .pem 파일을 한 줄 문자열로 (개행 → \n)
PRIVATE_KEY=$(cat buildee.private-key.pem)

az keyvault secret set --vault-name buildee-kv-dev-xxx \
  --name github-app-private-key --value "$PRIVATE_KEY"

az keyvault secret set --vault-name buildee-kv-dev-xxx \
  --name github-app-id --value "1234567"

az keyvault secret set --vault-name buildee-kv-dev-xxx \
  --name github-app-installation-id --value "<설치 ID>"

az keyvault secret set --vault-name buildee-kv-dev-xxx \
  --name github-webhook-secret --value "<위에서 만든 랜덤 문자열>"
```

## 4. App Service 환경 변수 (Key Vault 참조)

```
GITHUB_APP_ID=@Microsoft.KeyVault(SecretUri=.../github-app-id/)
GITHUB_PRIVATE_KEY=@Microsoft.KeyVault(SecretUri=.../github-app-private-key/)
GITHUB_INSTALLATION_ID=@Microsoft.KeyVault(SecretUri=.../github-app-installation-id/)
GITHUB_WEBHOOK_SECRET=@Microsoft.KeyVault(SecretUri=.../github-webhook-secret/)
GITHUB_ORG=buildee-projects
```

## 5. 검증

서버 기동 후:

```bash
# GitHub App 인증 확인
curl -s https://<server>/health/deep
# → checks.github.ok = true

# 수동으로 issue 만들고 webhook 도달 확인
gh issue create --repo buildee-projects/test-repo --title "test" --body "test"
# 서버 로그에 "GitHub webhook received" 출력 확인
```

## Acceptance criteria

- [ ] App ID, Private Key, Webhook Secret이 Key Vault에 저장됨
- [ ] App이 buildee-projects org에 설치됨
- [ ] 수동 issue 생성 → webhook 200 반환 → 서버 로그에 출력
- [ ] 잘못된 서명으로 webhook 호출 → 401 거부
