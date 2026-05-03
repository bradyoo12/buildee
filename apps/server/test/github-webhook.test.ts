import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { createHmac } from 'node:crypto';
import rawBody from 'fastify-raw-body';

// 테스트용 환경변수 사전 설정 (config import 전)
process.env.GITHUB_WEBHOOK_SECRET = 'test-secret';
process.env.GITHUB_ORG = 'buildee-projects';

// 모킹: appPrisma 등 외부 의존
vi.mock('@buildee/db', () => ({
  appPrisma: () => ({
    ticket: { findFirst: () => Promise.resolve(null) },
    changeRequest: { findFirst: () => Promise.resolve(null), update: () => Promise.resolve() },
    project: { findFirst: () => Promise.resolve(null) },
  }),
}));

vi.mock('../src/routes/ws.js', () => ({
  broadcastToUser: vi.fn(),
}));

import { githubWebhookRoutes } from '../src/routes/webhook/github.js';

describe('GitHub webhook handler', () => {
  let app: FastifyInstance;
  const SECRET = 'test-secret';

  beforeAll(async () => {
    app = Fastify();
    await app.register(rawBody, {
      field: 'rawBody',
      global: false,
      encoding: false,
      runFirst: true,
    });
    await app.register(githubWebhookRoutes);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  function sign(body: string, secret: string): string {
    return 'sha256=' + createHmac('sha256', secret).update(body).digest('hex');
  }

  it('rejects requests without signature', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/',
      payload: { action: 'opened', repository: { owner: { login: 'buildee-projects' } } },
      headers: { 'x-github-event': 'pull_request', 'x-github-delivery': 'd1' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('rejects requests with invalid signature', async () => {
    const body = JSON.stringify({
      action: 'opened',
      repository: { owner: { login: 'buildee-projects' } },
    });
    const res = await app.inject({
      method: 'POST',
      url: '/',
      payload: body,
      headers: {
        'content-type': 'application/json',
        'x-hub-signature-256': 'sha256=invalid',
        'x-github-event': 'pull_request',
        'x-github-delivery': 'd2',
      },
    });
    expect(res.statusCode).toBe(401);
  });

  it('rejects requests from unexpected org', async () => {
    const body = JSON.stringify({
      action: 'opened',
      repository: { owner: { login: 'malicious-org' } },
    });
    const res = await app.inject({
      method: 'POST',
      url: '/',
      payload: body,
      headers: {
        'content-type': 'application/json',
        'x-hub-signature-256': sign(body, SECRET),
        'x-github-event': 'pull_request',
        'x-github-delivery': 'd3',
      },
    });
    expect(res.statusCode).toBe(403);
  });

  it('accepts valid signed webhook from buildee-projects', async () => {
    const body = JSON.stringify({
      action: 'opened',
      repository: { owner: { login: 'buildee-projects' }, name: 'proj-test' },
      pull_request: { number: 1, body: 'Closes #1', html_url: '#' },
    });
    const res = await app.inject({
      method: 'POST',
      url: '/',
      payload: body,
      headers: {
        'content-type': 'application/json',
        'x-hub-signature-256': sign(body, SECRET),
        'x-github-event': 'pull_request',
        'x-github-delivery': 'd4',
      },
    });
    expect(res.statusCode).toBe(202);
  });

  it('ignores replayed delivery', async () => {
    const body = JSON.stringify({
      action: 'opened',
      repository: { owner: { login: 'buildee-projects' }, name: 'proj-test' },
    });
    const headers = {
      'content-type': 'application/json',
      'x-hub-signature-256': sign(body, SECRET),
      'x-github-event': 'pull_request',
      'x-github-delivery': 'd5',
    };
    const first = await app.inject({ method: 'POST', url: '/', payload: body, headers });
    const second = await app.inject({ method: 'POST', url: '/', payload: body, headers });
    expect(first.statusCode).toBe(202);
    expect(second.statusCode).toBe(204);
  });
});
