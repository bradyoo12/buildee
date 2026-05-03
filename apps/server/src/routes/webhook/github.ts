/**
 * GitHub webhook handler — Issue #3 본격 구현.
 *
 * Issue #2의 stub을 이걸로 대체.
 *
 * 이벤트 처리:
 * - issue_comment: STATUS prefix 파싱 → WebSocket으로 사용자 앱에 알림
 * - pull_request opened: ChangeRequest 상태 USER_REVIEWING로
 * - pull_request merged: 새 CodebaseVersion 생성, Project current 포인터 업데이트
 * - push: deploy 트리거 (별도 워크플로우가 처리)
 *
 * 보안:
 * - HMAC-SHA256 서명 검증 (timing-safe)
 * - Replay 방지 (delivery ID 1시간 캐시)
 * - 송신자 검증 (org 일치)
 */

import { FastifyPluginAsync } from 'fastify';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { LRUCache } from 'lru-cache';
import { appPrisma } from '@buildee/db';
import { config } from '../../lib/config.js';
import { broadcastToUser } from '../ws.js';
import { logger } from '../../lib/logger.js';

// Replay 방지: delivery ID 캐시 (1시간)
const seenDeliveries = new LRUCache<string, true>({
  max: 10_000,
  ttl: 60 * 60 * 1000,
});

// 워커 status comment prefix
const STATUS_PREFIX_RE = /^\[STATUS:([A-Z_]+)\]\s*(.*)/;

export const githubWebhookRoutes: FastifyPluginAsync = async (app) => {
  app.post('/', { config: { rawBody: true } as any }, async (req, reply) => {
    const signature = req.headers['x-hub-signature-256'] as string | undefined;
    const eventType = req.headers['x-github-event'] as string | undefined;
    const deliveryId = req.headers['x-github-delivery'] as string | undefined;

    if (!signature || !eventType || !deliveryId) {
      throw app.httpErrors.badRequest('Missing GitHub webhook headers');
    }

    // Replay 방지
    if (seenDeliveries.has(deliveryId)) {
      logger.warn({ deliveryId }, 'Replayed webhook delivery ignored');
      reply.code(204).send();
      return;
    }
    seenDeliveries.set(deliveryId, true);

    // 서명 검증
    const rawBody = (req as any).rawBody as Buffer | undefined;
    if (!rawBody) throw app.httpErrors.badRequest('Raw body unavailable');

    const expected =
      'sha256=' +
      createHmac('sha256', config.GITHUB_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);

    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      logger.warn({ deliveryId, eventType }, 'Webhook signature mismatch');
      throw app.httpErrors.unauthorized('Signature mismatch');
    }

    const payload = req.body as any;

    // 송신자 검증 (org 일치)
    const senderOrg = payload?.repository?.owner?.login;
    if (senderOrg !== config.GITHUB_ORG) {
      logger.warn({ deliveryId, senderOrg, expected: config.GITHUB_ORG }, 'Webhook from unexpected org');
      throw app.httpErrors.forbidden('Repository org mismatch');
    }

    // 빠르게 200 반환 후 비동기 처리 (GitHub의 10초 타임아웃 회피)
    reply.code(202).send();

    setImmediate(() => {
      handleEvent(eventType, payload, deliveryId).catch((err) => {
        logger.error({ err, eventType, deliveryId }, 'Webhook processing failed');
      });
    });
  });
};

// =================================================================
// 이벤트 라우팅
// =================================================================

async function handleEvent(eventType: string, payload: any, deliveryId: string): Promise<void> {
  logger.info(
    { eventType, deliveryId, action: payload?.action, repo: payload?.repository?.name },
    'GitHub webhook event',
  );

  switch (eventType) {
    case 'issue_comment':
      if (payload.action === 'created') {
        await handleIssueComment(payload);
      }
      break;

    case 'pull_request':
      switch (payload.action) {
        case 'opened':
        case 'ready_for_review':
        case 'reopened':
          await handlePullRequestOpened(payload);
          break;
        case 'closed':
          if (payload.pull_request.merged) {
            await handlePullRequestMerged(payload);
          } else {
            await handlePullRequestClosed(payload);
          }
          break;
      }
      break;

    case 'push':
      await handlePush(payload);
      break;

    case 'issues':
      // Issue 자체 이벤트는 현재 시스템이 만든 Issue라 따로 처리 없음
      break;

    default:
      logger.debug({ eventType }, 'Unhandled webhook event type');
  }
}

// =================================================================
// issue_comment: 워커 status comment 처리
// =================================================================

async function handleIssueComment(payload: any): Promise<void> {
  const issueNumber: number = payload.issue.number;
  const commentBody: string = payload.comment.body;
  const commenterLogin: string = payload.comment.user.login;
  const commenterType: string = payload.comment.user.type; // "User" or "Bot"

  // 사람이 단 코멘트는 무시 (운영자 디버그용 등)
  if (commenterType !== 'Bot' && !commentBody.startsWith('[STATUS:')) {
    return;
  }

  // STATUS prefix 파싱
  const match = commentBody.match(STATUS_PREFIX_RE);
  if (!match || !match[1]) return;

  const status = match[1]; // STARTED, WORKING, ...
  const detail = match[2]?.trim() ?? '';

  // 어느 ticket인지 조회 (issue_number → ticket)
  const ticket = await appPrisma().ticket.findFirst({
    where: { githubIssueNumber: issueNumber },
    include: { project: true },
  });

  if (!ticket) {
    logger.warn({ issueNumber }, 'Ticket not found for issue comment');
    return;
  }

  // 사용자 알림 (실시간)
  broadcastToUser(ticket.project.userId, {
    type: 'ticket.status',
    ticketId: ticket.id,
    projectId: ticket.projectId,
    status,
    detail,
    userMessage: humanizeStatus(status, detail),
  });

  // 일부 status는 DB 업데이트
  if (status === 'READY_FOR_REVIEW') {
    await appPrisma().ticket.update({
      where: { id: ticket.id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
  } else if (status === 'GUARDRAIL_FAILED') {
    await appPrisma().ticket.update({
      where: { id: ticket.id },
      data: { status: 'GUARDRAIL_FAILED', completedAt: new Date() },
    });
  } else if (status === 'ERROR') {
    await appPrisma().ticket.update({
      where: { id: ticket.id },
      data: { status: 'FAILED', completedAt: new Date() },
    });
  }
}

/**
 * 워커 status를 비개발자 친화적 한국어 메시지로 변환.
 */
function humanizeStatus(status: string, detail: string): string {
  switch (status) {
    case 'STARTED':
      return '작업을 시작했어요';
    case 'WORKING':
      return detail || '변경을 적용하는 중이에요';
    case 'GUARDRAIL_RUNNING':
      return '결과를 검증하는 중이에요';
    case 'GUARDRAIL_FAILED':
      return `검증이 통과되지 않았어요. ${detail}`;
    case 'READY_FOR_REVIEW':
      return '변경이 준비됐어요. 미리보기에서 확인해 주세요';
    case 'CLARIFICATION_NEEDED':
      return `좀 더 자세한 설명이 필요해요. ${detail}`;
    case 'ERROR':
      return `처리 중 문제가 생겼어요. ${detail}`;
    default:
      return detail || status;
  }
}

// =================================================================
// pull_request opened
// =================================================================

async function handlePullRequestOpened(payload: any): Promise<void> {
  const pr = payload.pull_request;
  const prBody: string = pr.body ?? '';

  // PR body에서 "Closes #N" 또는 "Fixes #N" 매칭으로 issue 찾기
  const closesMatch = prBody.match(/(?:Closes|Fixes|Resolves)\s+#(\d+)/i);
  if (!closesMatch || !closesMatch[1]) {
    logger.debug({ prNumber: pr.number }, 'PR has no closing reference, skipping');
    return;
  }

  const issueNumber = parseInt(closesMatch[1], 10);
  const ticket = await appPrisma().ticket.findFirst({
    where: { githubIssueNumber: issueNumber },
    include: { project: true },
  });
  if (!ticket) return;

  // ChangeRequest를 USER_REVIEWING으로 (있으면)
  const changeRequest = await appPrisma().changeRequest.findFirst({
    where: {
      projectId: ticket.projectId,
      status: 'PROPOSED',
    },
    orderBy: { createdAt: 'desc' },
  });

  if (changeRequest) {
    await appPrisma().changeRequest.update({
      where: { id: changeRequest.id },
      data: { status: 'USER_REVIEWING' },
    });
  }

  // TicketResult 기록 (PR 정보)
  await appPrisma().ticketResult.create({
    data: {
      ticketId: ticket.id,
      prNumber: pr.number,
      commits: [],
      filesChanged: [],
      guardrailResults: {} as any,
      status: 'NEEDS_REVIEW',
    },
  });

  broadcastToUser(ticket.project.userId, {
    type: 'pr.opened',
    ticketId: ticket.id,
    prNumber: pr.number,
    prUrl: pr.html_url,
    userMessage: '변경 미리보기가 준비됐어요. 검토해 주세요',
  });
}

// =================================================================
// pull_request merged
// =================================================================

async function handlePullRequestMerged(payload: any): Promise<void> {
  const pr = payload.pull_request;
  const repoName: string = payload.repository.name;
  const mergeCommitSha: string = pr.merge_commit_sha;

  // repo 이름에서 projectId 역산 (proj-{shortId}). 단축 ID이므로 lookup 필요
  const project = await appPrisma().project.findFirst({
    where: { repoUrl: { endsWith: `/${repoName}` } },
  });
  if (!project) {
    logger.warn({ repoName }, 'Project not found for merged PR');
    return;
  }

  // 새 CodebaseVersion 생성
  const newVersion = await appPrisma().codebaseVersion.create({
    data: {
      projectId: project.id,
      parentVersionId: project.currentCodebaseVersionId,
      commitSha: mergeCommitSha,
      branch: 'main',
      prNumber: pr.number,
    },
  });

  // Project current 포인터 업데이트 (라이브 적용)
  await appPrisma().project.update({
    where: { id: project.id },
    data: { currentCodebaseVersionId: newVersion.id },
  });

  // 관련 ChangeRequest를 APPLIED로
  await appPrisma().changeRequest.updateMany({
    where: {
      projectId: project.id,
      status: 'APPROVED',
    },
    data: { status: 'APPLIED', resolvedAt: new Date() },
  });

  broadcastToUser(project.userId, {
    type: 'deployment.starting',
    projectId: project.id,
    codebaseVersionId: newVersion.id,
    userMessage: '변경이 라이브에 반영되고 있어요',
  });

  logger.info(
    { projectId: project.id, codebaseVersionId: newVersion.id, sha: mergeCommitSha },
    'New codebase version after merge',
  );
}

// =================================================================
// pull_request closed (without merge)
// =================================================================

async function handlePullRequestClosed(payload: any): Promise<void> {
  const pr = payload.pull_request;
  const prBody: string = pr.body ?? '';
  const closesMatch = prBody.match(/(?:Closes|Fixes|Resolves)\s+#(\d+)/i);
  if (!closesMatch || !closesMatch[1]) return;

  const issueNumber = parseInt(closesMatch[1], 10);
  const ticket = await appPrisma().ticket.findFirst({
    where: { githubIssueNumber: issueNumber },
    include: { project: true },
  });
  if (!ticket) return;

  broadcastToUser(ticket.project.userId, {
    type: 'pr.closed',
    ticketId: ticket.id,
    prNumber: pr.number,
    userMessage: '변경 요청이 취소됐어요',
  });
}

// =================================================================
// push: deploy 트리거 (별도 처리)
// =================================================================

async function handlePush(payload: any): Promise<void> {
  // main 브랜치 push만 처리
  if (payload.ref !== 'refs/heads/main') return;

  // 실제 빌드/배포는 별도 GitHub Actions 워크플로우가 처리.
  // 여기서는 로깅만.
  logger.info(
    {
      repo: payload.repository.name,
      sha: payload.head_commit?.id,
      pusher: payload.pusher?.name,
    },
    'Push to main detected',
  );
}
