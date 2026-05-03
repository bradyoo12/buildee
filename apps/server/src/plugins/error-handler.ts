/**
 * 중앙 에러 핸들러.
 *
 * - zod 검증 실패 → 400 + 필드 에러
 * - HTTP 에러 (httpErrors.*) → 그대로
 * - 그 외 → 500, 로깅
 */

import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

export function errorHandler(
  error: FastifyError,
  req: FastifyRequest,
  reply: FastifyReply,
): void {
  if (error instanceof ZodError) {
    reply.status(400).send({
      error: 'ValidationError',
      message: 'Request validation failed',
      issues: error.flatten(),
    });
    return;
  }

  if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
    reply.status(error.statusCode).send({
      error: error.name,
      message: error.message,
    });
    return;
  }

  // 5xx — 서버 에러
  req.log.error({ err: error }, 'Unhandled server error');
  reply.status(500).send({
    error: 'InternalServerError',
    message: 'Something went wrong',
  });
}
