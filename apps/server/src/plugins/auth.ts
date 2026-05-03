/**
 * JWT 인증 plugin.
 *
 * - req.requireAuth() — 인증 필수 라우트에서 호출. 실패 시 401
 * - req.user — 인증 후 user payload (id, email)
 *
 * 발급은 routes/auth.ts에서.
 */

import fp from 'fastify-plugin';
import { FastifyPluginAsync, FastifyRequest } from 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    requireAuth(): Promise<void>;
  }
  interface FastifyInstance {
    requireAuth: (req: FastifyRequest) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: string; email: string };
    user: { id: string; email: string };
  }
}

const plugin: FastifyPluginAsync = async (app) => {
  app.decorateRequest('requireAuth', async function (this: FastifyRequest) {
    try {
      await this.jwtVerify();
    } catch {
      throw app.httpErrors.unauthorized('Authentication required');
    }
  });
};

export const authPlugin = fp(plugin, { name: 'auth' });
