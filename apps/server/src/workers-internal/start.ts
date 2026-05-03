/**
 * 백그라운드 internal 워커들.
 *
 * 별도 프로세스 아니라 server 안에서 setInterval로 도는 작은 작업.
 *
 * - markStaleWorkers: 하트비트 끊긴 워커 INACTIVE 표시
 * - cleanupDeletedProjects: 30일 grace 지난 Project DB 영구 삭제
 * - migrateProjectDbsOnStartup: 부팅 시 schemaVersion 낮은 Project DB 자동 마이그레이션
 *
 * 부하 늘면 별도 worker process로 분리 (apps/worker-orchestration 등).
 */

import { Pool } from 'pg';
import {
  appPrisma,
  markStaleWorkersInactive,
  dropProjectDatabase,
  evictProjectPrisma,
} from '@buildee/db';
import { config } from '../lib/config.js';
import { logger } from '../lib/logger.js';
import { deleteRepoForProject } from '../services/repo-manager.js';

let started = false;

export function startBackgroundWorkers(): void {
  if (started) return;
  started = true;

  // 1. 워커 헬스 모니터 (30초마다)
  const pool = new Pool({ connectionString: config.DATABASE_URL_APP_MAIN });
  setInterval(async () => {
    try {
      const n = await markStaleWorkersInactive(pool, 2);
      if (n > 0) logger.info({ markedInactive: n }, 'Stale workers marked inactive');
    } catch (err) {
      logger.error({ err }, 'Worker health monitor failed');
    }
  }, 30_000);

  // 2. Project 영구 삭제 (1시간마다)
  setInterval(async () => {
    try {
      const expired = await appPrisma().project.findMany({
        where: {
          status: 'PENDING_DELETION',
          pendingDeletionAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        select: { id: true, dataDbName: true },
        take: 10,
      });

      for (const p of expired) {
        try {
          // 1. GitHub repo 삭제 (Issue #3) — 실패해도 DB 삭제는 진행
          try {
            await deleteRepoForProject(p.id);
          } catch (err) {
            logger.error({ err, projectId: p.id }, 'GitHub repo deletion failed (continuing)');
          }

          // 2. Project DB 삭제
          if (p.dataDbName) {
            await dropProjectDatabase(p.id, {
              host: config.PG_HOST,
              port: config.PG_PORT,
              adminUser: config.PG_ADMIN_USER,
              adminPassword: config.PG_ADMIN_PASSWORD,
              ssl: config.PG_SSL,
              migrationsDir: '', // drop엔 안 씀
            });
          }
          await evictProjectPrisma(p.id);
          await appPrisma().project.update({
            where: { id: p.id },
            data: { status: 'DELETED', deletedAt: new Date() },
          });
          logger.info({ projectId: p.id }, 'Project permanently deleted');
        } catch (err) {
          logger.error({ err, projectId: p.id }, 'Failed to permanently delete project');
        }
      }
    } catch (err) {
      logger.error({ err }, 'Project cleanup worker failed');
    }
  }, 60 * 60 * 1000);

  logger.info('Background workers started');
}
