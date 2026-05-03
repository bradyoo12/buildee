/**
 * ChangeRequest routes.
 *
 * 사용자의 자연어 메시지가 들어오는 진입점.
 *
 * 흐름:
 * 1. 사용자 메시지 + projectId 수신
 * 2. classification 서비스가 카테고리 분류 + Spec 구조화
 * 3. 카테고리에 따라:
 *    - CONTENT/CONFIG → fast-path 서비스가 직접 처리 (워커 우회)
 *    - 그 외          → ticket 생성 → 큐로 (워커가 픽업)
 * 4. ChangeRequest 레코드 반환 (사용자 앱이 polling 또는 WebSocket으로 추적)
 */

import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { appPrisma } from '@buildee/db';
import { classifyChangeRequest } from '../services/classification.js';
import { applyFastPath } from '../services/fast-path.js';
import { dispatchTicket } from '../services/ticket-dispatcher.js';
import { mergePullRequest, closePullRequest } from '../services/pr-manager.js';

const CreateChangeRequestBody = z.object({
  projectId: z.string().uuid(),
  message: z.string().min(1).max(5000),
});

export const changeRequestRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', async (req) => {
    await req.requireAuth();
  });

  app.post('/', async (req) => {
    const body = CreateChangeRequestBody.parse(req.body);

    // Project 권한 확인
    const project = await appPrisma().project.findFirst({
      where: { id: body.projectId, userId: req.user.id, status: 'ACTIVE' },
    });
    if (!project) throw app.httpErrors.notFound('Project not found');

    // 분류 + 구조화
    const classification = await classifyChangeRequest({
      project,
      userMessage: body.message,
    });

    // ChangeRequest 레코드
    const changeRequest = await appPrisma().changeRequest.create({
      data: {
        projectId: project.id,
        userId: req.user.id,
        userMessage: body.message,
        proposedChanges: classification.proposedChanges as any,
        changeCategory: classification.category,
        affectedLayers: classification.affectedLayers,
        confidence: classification.confidence,
        alternatives: classification.alternatives,
        status: 'PROPOSED',
      },
    });

    // 빠른 경로 vs 워커 경로 분기
    const isFastPath =
      classification.category === 'CONTENT' || classification.category === 'CONFIG';

    if (isFastPath) {
      // 빠른 경로: 즉시 처리, 미리보기 반영
      const result = await applyFastPath(changeRequest, project);
      return { changeRequest: result.changeRequest, applied: true };
    } else {
      // 느린 경로: 티켓 생성, 큐에
      const ticket = await dispatchTicket(changeRequest, project);
      return { changeRequest, ticket, applied: false };
    }
  });

  app.get<{ Params: { id: string } }>('/:id', async (req) => {
    const cr = await appPrisma().changeRequest.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { /* 향후 ticket join 등 */ },
    });
    if (!cr) throw app.httpErrors.notFound();
    return { changeRequest: cr };
  });

  app.post<{ Params: { id: string }; Body: { decision: 'approve' | 'reject' } }>(
    '/:id/decision',
    async (req) => {
      const decision = z.object({ decision: z.enum(['approve', 'reject']) }).parse(req.body);

      const cr = await appPrisma().changeRequest.findFirst({
        where: { id: req.params.id, userId: req.user.id, status: 'USER_REVIEWING' },
      });
      if (!cr) throw app.httpErrors.notFound('No pending change request');

      const newStatus = decision.decision === 'approve' ? 'APPROVED' : 'REJECTED';
      const updated = await appPrisma().changeRequest.update({
        where: { id: cr.id },
        data: { status: newStatus, resolvedAt: new Date() },
      });

      // 관련 PR 찾기 (가장 최근 NEEDS_REVIEW TicketResult)
      const ticketResult = await appPrisma().ticketResult.findFirst({
        where: {
          ticket: { project: { id: cr.projectId } },
          status: 'NEEDS_REVIEW',
          prNumber: { not: null },
        },
        include: { ticket: { include: { project: true } } },
        orderBy: { createdAt: 'desc' },
      });

      if (ticketResult?.prNumber && ticketResult.ticket.project) {
        if (decision.decision === 'approve') {
          // 머지 — webhook이 곧 도착해서 새 CodebaseVersion 생성 + Project current 포인터 업데이트
          await mergePullRequest(ticketResult.ticket.project, ticketResult.prNumber);
        } else {
          await closePullRequest(
            ticketResult.ticket.project,
            ticketResult.prNumber,
            'Rejected by user',
          );
        }
      }

      return { changeRequest: updated };
    },
  );
};
