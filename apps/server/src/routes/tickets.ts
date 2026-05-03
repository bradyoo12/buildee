/**
 * Tickets routes.
 *
 * 워커는 직접 DB(SKIP LOCKED)로 픽업하므로 server route 불필요.
 * 여기는 사용자 앱이 티켓 상태 조회용으로만 사용.
 */

import { FastifyPluginAsync } from 'fastify';
import { appPrisma } from '@buildee/db';

export const ticketRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', async (req) => {
    await req.requireAuth();
  });

  app.get<{ Params: { id: string } }>('/:id', async (req) => {
    const ticket = await appPrisma().ticket.findFirst({
      where: { id: req.params.id, project: { userId: req.user.id } },
      include: { results: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    if (!ticket) throw app.httpErrors.notFound();
    return { ticket };
  });

  // Project별 티켓 목록 (변경 트레이용)
  app.get<{ Querystring: { projectId?: string; status?: string } }>('/', async (req) => {
    const projectId = req.query.projectId;
    if (!projectId) throw app.httpErrors.badRequest('projectId required');

    const project = await appPrisma().project.findFirst({
      where: { id: projectId, userId: req.user.id },
    });
    if (!project) throw app.httpErrors.notFound();

    const tickets = await appPrisma().ticket.findMany({
      where: {
        projectId,
        ...(req.query.status ? { status: req.query.status as any } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return { tickets };
  });
};
