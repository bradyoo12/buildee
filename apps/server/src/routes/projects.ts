/**
 * Project CRUD.
 *
 * Project 생성 시 흐름:
 * 1. app_main.projects 레코드 생성
 * 2. createProjectDatabase() 호출 → 새 Project DB + role
 * 3. role password를 Key Vault에 저장
 * 4. (Issue #3에서 추가) GitHub repo 자동 생성
 *
 * 삭제는 30일 grace period (status=PENDING_DELETION). 백그라운드 워커가 영구 삭제.
 */

import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  appPrisma,
  createProjectDatabase,
  evictProjectPrisma,
} from '@buildee/db';
import { config } from '../lib/config.js';
import { setSecret } from '../lib/key-vault.js';
import { createRepoForProject } from '../services/repo-manager.js';

const CreateProjectBody = z.object({
  name: z.string().min(1).max(100),
  platform: z.enum(['WEB', 'PWA']).default('WEB'),
  type: z.enum(['LANDING', 'CONTENT', 'FORM', 'OTHER']).default('LANDING'),
});

const PROJ_MIGRATIONS_DIR = join(
  fileURLToPath(new URL('../../', import.meta.url)),
  '../../packages/db/prisma/proj-migrations',
);

export const projectRoutes: FastifyPluginAsync = async (app) => {
  // 인증 필수: 모든 project 라우트에 적용
  app.addHook('preHandler', async (req) => {
    await req.requireAuth();
  });

  app.get('/', async (req) => {
    const projects = await appPrisma().project.findMany({
      where: { userId: req.user.id, status: 'ACTIVE' },
      orderBy: { updatedAt: 'desc' },
    });
    return { projects };
  });

  app.post('/', async (req) => {
    const body = CreateProjectBody.parse(req.body);

    // 1. Project 레코드
    const project = await appPrisma().project.create({
      data: {
        userId: req.user.id,
        name: body.name,
        platform: body.platform,
        type: body.type,
      },
    });

    // 2. Project DB 생성
    try {
      const dbResult = await createProjectDatabase(project.id, {
        host: config.PG_HOST,
        port: config.PG_PORT,
        adminUser: config.PG_ADMIN_USER,
        adminPassword: config.PG_ADMIN_PASSWORD,
        ssl: config.PG_SSL,
        migrationsDir: PROJ_MIGRATIONS_DIR,
      });

      // 3. Project DB role password를 Key Vault에 저장
      await setSecret(`db-${dbResult.dbName}-password`, dbResult.password);

      // 4. Project 레코드 업데이트 (DB 정보)
      const updated = await appPrisma().project.update({
        where: { id: project.id },
        data: {
          dataDbName: dbResult.dbName,
          schemaVersion: dbResult.schemaVersion,
        },
      });

      // 5. GitHub repo 자동 생성 (Issue #3)
      const repo = await createRepoForProject({
        projectId: updated.id,
        projectName: updated.name,
        projectType: updated.type,
      });

      // 6. repo URL 저장
      const finalProject = await appPrisma().project.update({
        where: { id: updated.id },
        data: { repoUrl: repo.repoUrl },
      });

      return { project: finalProject };
    } catch (err) {
      // DB 생성 실패 시 Project 레코드 롤백
      req.log.error({ err, projectId: project.id }, 'Project DB creation failed, rolling back');
      await appPrisma().project.delete({ where: { id: project.id } });
      throw app.httpErrors.internalServerError('Failed to provision project');
    }
  });

  app.get<{ Params: { id: string } }>('/:id', async (req) => {
    const project = await appPrisma().project.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!project) throw app.httpErrors.notFound();
    return { project };
  });

  app.delete<{ Params: { id: string } }>('/:id', async (req) => {
    const project = await appPrisma().project.findFirst({
      where: { id: req.params.id, userId: req.user.id, status: 'ACTIVE' },
    });
    if (!project) throw app.httpErrors.notFound();

    // 30일 grace period (백그라운드 워커가 영구 삭제)
    await appPrisma().project.update({
      where: { id: project.id },
      data: { status: 'PENDING_DELETION', pendingDeletionAt: new Date() },
    });

    await evictProjectPrisma(project.id);

    return { ok: true, message: 'Project marked for deletion (30 day grace period)' };
  });
};
