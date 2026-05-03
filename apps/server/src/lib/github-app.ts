/**
 * GitHub App 인증 wrapper.
 *
 * App-level token은 짧은 수명. installation token은 1시간 수명.
 * Octokit App이 자동 갱신해 줌.
 *
 * 사용:
 *   const octokit = await getOctokit();
 *   await octokit.rest.issues.create({ ... });
 */

import { App } from '@octokit/app';
import { Octokit } from '@octokit/rest';
import { config } from './config.js';
import { getSecret } from './key-vault.js';
import { logger } from './logger.js';

let _app: App | null = null;
let _installationOctokit: Octokit | null = null;
let _installationOctokitExpiresAt: number = 0;

async function loadApp(): Promise<App> {
  if (_app) return _app;

  // private key가 환경변수에 직접 있을 수도, Key Vault에서 로드해야 할 수도
  let privateKey = config.GITHUB_PRIVATE_KEY;
  if (!privateKey || privateKey === '@KeyVault') {
    privateKey = await getSecret('github-app-private-key');
  }
  // PEM의 \n이 escape돼 있을 수 있음
  privateKey = privateKey.replace(/\\n/g, '\n');

  _app = new App({
    appId: config.GITHUB_APP_ID,
    privateKey,
  });
  return _app;
}

/**
 * Buildee org installation에 인증된 Octokit 인스턴스 반환.
 * 50분마다 갱신 (token TTL 60분 — 10분 safety margin).
 */
export async function getOctokit(): Promise<Octokit> {
  if (_installationOctokit && Date.now() < _installationOctokitExpiresAt) {
    return _installationOctokit;
  }

  const app = await loadApp();
  const installationId = await getInstallationId(app);

  _installationOctokit = (await app.getInstallationOctokit(installationId)) as unknown as Octokit;
  _installationOctokitExpiresAt = Date.now() + 50 * 60 * 1000;

  logger.debug({ installationId }, 'GitHub App installation Octokit refreshed');
  return _installationOctokit;
}

async function getInstallationId(app: App): Promise<number> {
  // 1) 환경변수 또는 Key Vault에서 직접 (production 권장)
  const fromEnv = process.env.GITHUB_INSTALLATION_ID;
  if (fromEnv) return parseInt(fromEnv, 10);

  try {
    const fromVault = await getSecret('github-app-installation-id');
    return parseInt(fromVault, 10);
  } catch {
    // 없으면 API로 조회 (org 단위 단일 installation 가정)
  }

  // 2) Fallback: API로 조회
  for await (const { installation } of app.eachInstallation.iterator()) {
    if (installation.account && 'login' in installation.account &&
        installation.account.login === config.GITHUB_ORG) {
      return installation.id;
    }
  }
  throw new Error(`No installation found for org: ${config.GITHUB_ORG}`);
}
