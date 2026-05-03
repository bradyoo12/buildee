/**
 * Ticket dispatcher.
 *
 * ChangeRequest의 비-fast 카테고리 → Ticket 생성 → 큐에.
 *
 * 워커가 SKIP LOCKED로 픽업. 라우팅 정책:
 * - PC 워커: 즉시 모든 PENDING 픽업
 * - API 워커: PC가 2분 내 안 가져간 티켓만
 * - Tier 3: 사용자 옵트인 + 사용자 명시적 선택 시
 *
 * 실제 라우팅 결정은 워커 측 (queue.ts의 claimTicket이 워커 타입에 따라 분기)
 *
 * 여기서는 단순히 Ticket 레코드 생성 + GitHub Issue 생성 트리거 (Issue #3).
 */

import type { ChangeRequest, Project, Ticket, TicketType } from '@buildee/db';
import { appPrisma } from '@buildee/db';
import { createIssueForTicket } from './issue-builder.js';
import { logger } from '../lib/logger.js';

const CATEGORY_TO_TICKET_TYPE: Record<string, TicketType> = {
  COMPOSITION: 'CODE', // 페이지 재구성도 결국 코드 변경
  DESIGN_SYSTEM: 'DESIGN',
  CODE: 'CODE',
  FULL_STACK: 'CODE',
  FORM: 'FORM',
};

export async function dispatchTicket(
  changeRequest: ChangeRequest,
  project: Project,
): Promise<Ticket> {
  const ticketType = CATEGORY_TO_TICKET_TYPE[changeRequest.changeCategory] ?? 'CODE';

  const ticket = await appPrisma().ticket.create({
    data: {
      projectId: project.id,
      type: ticketType,
      spec: {
        intent: changeRequest.userMessage,
        category: changeRequest.changeCategory,
        proposedChanges: changeRequest.proposedChanges,
        affectedLayers: changeRequest.affectedLayers,
      } as any,
      status: 'PENDING',
      preferredProvider: 'CLAUDE_CODE_PC',
    },
  });

  // GitHub Issue 자동 생성 (Issue #3)
  try {
    await createIssueForTicket(ticket, project);
  } catch (err) {
    logger.error({ err, ticketId: ticket.id }, 'GitHub issue creation failed');
    await appPrisma().ticket.update({
      where: { id: ticket.id },
      data: { status: 'FAILED' },
    });
    throw err;
  }

  return ticket;
}
