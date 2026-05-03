/**
 * Buildee 오케스트레이션 서버 entry point.
 *
 * 책임:
 * 1. 사용자 요청 수신 (REST + WebSocket)
 * 2. 티켓 생애주기 관리 (Postgres 큐)
 * 3. 워커 디스패치 (PC → API → Tier 3 폴백)
 * 4. GitHub webhook 수신 + 상태 broadcast
 * 5. 사용자 알림 (WebSocket → 사용자 앱)
 *
 * 비책임 (워커가 함):
 * - 코드 생성, Git 작업, 가드레일 실행, 빌드
 */

// Key Vault에서 password 등을 분리 reference로 받는 경우, 여기서 DATABASE_URL을 합성.
// Azure App Service에선 Key Vault reference 안에 다른 reference를 못 씀.
if (!process.env.DATABASE_URL_APP_MAIN && process.env.PG_HOST && process.env.PG_ADMIN_PASSWORD) {
  process.env.DATABASE_URL_APP_MAIN =
    `postgresql://${process.env.PG_ADMIN_USER}:` +
    `${encodeURIComponent(process.env.PG_ADMIN_PASSWORD)}` +
    `@${process.env.PG_HOST}:${process.env.PG_PORT ?? 5432}/app_main` +
    `?sslmode=${process.env.PG_SSL === 'true' ? 'require' : 'prefer'}`;
}

import { config } from './lib/config.js';
import { createApp } from './app.js';
import { logger } from './lib/logger.js';
import { startBackgroundWorkers } from './workers-internal/start.js';

async function main() {
  const app = await createApp();

  await app.listen({ port: config.PORT, host: '0.0.0.0' });
  logger.info(`Buildee server listening on :${config.PORT}`);

  // 백그라운드 작업 (큐 모니터링, 워커 헬스체크 등)
  startBackgroundWorkers();
}

main().catch((err) => {
  logger.error({ err }, 'Server failed to start');
  process.exit(1);
});
