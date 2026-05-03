/**
 * Fastify 앱 빌더. 모든 plugin·route 등록.
 * server.ts에서 호출, 테스트에서도 동일하게 호출 가능.
 */

import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import websocket from '@fastify/websocket';
import sensible from '@fastify/sensible';
import rawBody from 'fastify-raw-body';

import { config } from './lib/config.js';
import { logger } from './lib/logger.js';
import { authPlugin } from './plugins/auth.js';
import { errorHandler } from './plugins/error-handler.js';

import { authRoutes } from './routes/auth.js';
import { projectRoutes } from './routes/projects.js';
import { changeRequestRoutes } from './routes/change-requests.js';
import { ticketRoutes } from './routes/tickets.js';
import { formRoutes } from './routes/forms.js';
import { healthRoutes } from './routes/health.js';
import { githubWebhookRoutes } from './routes/webhook/github.js';
import { wsRoutes } from './routes/ws.js';

export async function createApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger,
    trustProxy: true,
    bodyLimit: 10 * 1024 * 1024, // 10MB (양식 응답 첨부 등)
  });

  // 1. core plugins
  await app.register(sensible);
  await app.register(cors, {
    origin: config.CORS_ORIGINS,
    credentials: true,
  });
  await app.register(jwt, { secret: config.JWT_SECRET });
  await app.register(websocket);

  // raw body 보존 (GitHub webhook 서명 검증용). global: false → routes에서 opt-in
  await app.register(rawBody, {
    field: 'rawBody',
    global: false,
    encoding: false,
    runFirst: true,
  });

  // 2. 인증 데코레이터 (req.requireAuth() 등)
  await app.register(authPlugin);

  // 3. error handler
  app.setErrorHandler(errorHandler);

  // 4. routes
  await app.register(healthRoutes);                          // /health, /health/deep
  await app.register(authRoutes,          { prefix: '/auth' });
  await app.register(projectRoutes,       { prefix: '/projects' });
  await app.register(changeRequestRoutes, { prefix: '/change-requests' });
  await app.register(ticketRoutes,        { prefix: '/tickets' });
  await app.register(formRoutes,          { prefix: '/forms' });
  await app.register(githubWebhookRoutes, { prefix: '/webhook/github' });
  await app.register(wsRoutes,            { prefix: '/ws' });

  return app;
}
