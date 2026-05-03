/**
 * Health check.
 *
 * - GET /health      — 단순 200. App Service liveness probe용
 * - GET /health/deep — DB·Key Vault·외부 의존성 확인. 모니터링용
 */

import { FastifyPluginAsync } from 'fastify';
import { appPrisma } from '@buildee/db';
import { getSecret } from '../lib/key-vault.js';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async () => ({ status: 'ok' }));

  app.get('/health/deep', async () => {
    const checks: Record<string, { ok: boolean; latencyMs?: number; error?: string }> = {};

    // DB
    const tDb = Date.now();
    try {
      await appPrisma().$queryRaw`SELECT 1`;
      checks.db = { ok: true, latencyMs: Date.now() - tDb };
    } catch (err) {
      checks.db = { ok: false, error: (err as Error).message };
    }

    // Key Vault (선택, URL 설정된 경우만)
    if (process.env.AZURE_KEY_VAULT_URL) {
      const tKv = Date.now();
      try {
        await getSecret('health-check-probe').catch(() => null); // 없어도 OK
        checks.keyVault = { ok: true, latencyMs: Date.now() - tKv };
      } catch (err) {
        checks.keyVault = { ok: false, error: (err as Error).message };
      }
    }

    const allOk = Object.values(checks).every((c) => c.ok);
    return { status: allOk ? 'ok' : 'degraded', checks };
  });
};
