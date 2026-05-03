/**
 * Azure Key Vault 통합.
 *
 * 로컬: 환경변수 fallback.
 * 프로덕션: DefaultAzureCredential (App Service의 Managed Identity 사용).
 *
 * 사용 시점:
 * - Project DB role 비밀번호 저장/조회
 * - GitHub Private Key 등 회전 가능한 시크릿
 */

import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';
import { config } from './config.js';
import { logger } from './logger.js';

let _client: SecretClient | null = null;

function client(): SecretClient | null {
  if (_client) return _client;
  if (!config.AZURE_KEY_VAULT_URL) return null;

  _client = new SecretClient(
    config.AZURE_KEY_VAULT_URL,
    new DefaultAzureCredential(),
  );
  return _client;
}

/**
 * 시크릿 가져옴. 로컬에서 Key Vault URL 없으면 process.env에서 fallback.
 */
export async function getSecret(name: string): Promise<string> {
  const c = client();
  if (!c) {
    const fromEnv = process.env[name.replace(/-/g, '_').toUpperCase()];
    if (fromEnv) return fromEnv;
    throw new Error(`Secret '${name}' not found (no Key Vault, no env fallback)`);
  }

  try {
    const secret = await c.getSecret(name);
    if (!secret.value) throw new Error(`Secret '${name}' has no value`);
    return secret.value;
  } catch (err) {
    logger.error({ err, secretName: name }, 'Failed to fetch secret from Key Vault');
    throw err;
  }
}

/**
 * 시크릿 저장. 주로 Project DB password 등 새로 생성된 시크릿 저장 시 사용.
 */
export async function setSecret(name: string, value: string): Promise<void> {
  const c = client();
  if (!c) {
    logger.warn({ secretName: name }, 'No Key Vault configured, secret not persisted');
    return;
  }
  await c.setSecret(name, value);
}
