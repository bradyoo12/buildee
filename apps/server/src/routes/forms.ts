/**
 * Forms routes.
 *
 * - GET  /forms/:id          — 공개 (양식 정의 조회, 사용자 사이트가 호출)
 * - POST /forms/:id/submit   — 공개 (응답 제출, 사용자 사이트의 방문자가 호출)
 * - GET  /forms/:id/submissions — 인증 필수 (운영자가 응답 조회)
 *
 * 양식 정의는 app_main, 응답은 Project DB.
 */

import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { appPrisma, getProjectPrisma, projectDbName } from '@buildee/db';
import { config } from '../lib/config.js';
import { getSecret } from '../lib/key-vault.js';
import { sendFormNotification } from '../services/notification.js';

const SubmitBody = z.object({
  data: z.record(z.string(), z.any()),
});

export const formRoutes: FastifyPluginAsync = async (app) => {
  // 공개: 양식 정의 조회 (사용자 사이트 렌더용)
  app.get<{ Params: { id: string } }>('/:id', async (req) => {
    const form = await appPrisma().formDefinition.findFirst({
      where: { id: req.params.id, status: 'ACTIVE' },
      select: { id: true, name: true, fields: true, submitButtonText: true, successMessage: true },
    });
    if (!form) throw app.httpErrors.notFound();
    return { form };
  });

  // 공개: 응답 제출
  app.post<{ Params: { id: string } }>('/:id/submit', async (req) => {
    const body = SubmitBody.parse(req.body);

    const form = await appPrisma().formDefinition.findFirst({
      where: { id: req.params.id, status: 'ACTIVE' },
      include: { project: true },
    });
    if (!form) throw app.httpErrors.notFound();
    if (!form.project.dataDbName) {
      throw app.httpErrors.serviceUnavailable('Project DB not provisioned');
    }

    // TODO: form.fields와 body.data 검증 (필수 필드, 타입, 개인정보 동의 등)
    // TODO: 가드레일 Layer 5 적용 (이메일 형식, 한국 전화번호 등)

    // Project DB에 응답 저장
    const dbName = projectDbName(form.project.id);
    const password = await getSecret(`db-${dbName}-password`);
    const projectPrisma = getProjectPrisma(form.project.id, {
      host: config.PG_HOST,
      port: config.PG_PORT,
      user: `${dbName}_writer`,
      password,
      ssl: config.PG_SSL,
    });

    const submission = await projectPrisma.formSubmission.create({
      data: {
        formDefinitionId: form.id,
        formVersionId: form.id, // TODO: 별도 form_versions 테이블 도입 시 분리
        submittedData: body.data,
        submitterIp: req.ip,
      },
    });

    // 알림 (이메일)
    await sendFormNotification(form, submission).catch((err) => {
      req.log.error({ err }, 'Failed to send form notification');
    });

    return { ok: true, message: form.successMessage ?? 'Thank you!' };
  });

  // 인증 필수: 운영자가 받은 응답 조회
  app.get<{ Params: { id: string }; Querystring: { limit?: string; offset?: string } }>(
    '/:id/submissions',
    async (req) => {
      await req.requireAuth();

      const form = await appPrisma().formDefinition.findFirst({
        where: { id: req.params.id, project: { userId: req.user.id } },
        include: { project: true },
      });
      if (!form) throw app.httpErrors.notFound();
      if (!form.project.dataDbName) throw app.httpErrors.notFound();

      const dbName = form.project.dataDbName;
      const password = await getSecret(`db-${dbName}-password`);
      const projectPrisma = getProjectPrisma(form.project.id, {
        host: config.PG_HOST,
        port: config.PG_PORT,
        user: `${dbName}_writer`,
        password,
        ssl: config.PG_SSL,
      });

      const limit = Math.min(parseInt(req.query.limit ?? '50'), 200);
      const offset = parseInt(req.query.offset ?? '0');

      const submissions = await projectPrisma.formSubmission.findMany({
        where: { formDefinitionId: form.id },
        orderBy: { submittedAt: 'desc' },
        take: limit,
        skip: offset,
      });

      return { submissions };
    },
  );
};
