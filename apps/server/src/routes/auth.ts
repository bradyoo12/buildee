/**
 * 인증 routes.
 *
 * MVP 범위:
 * - POST /auth/signup — 이메일 + 비밀번호로 가입 (bcrypt)
 * - POST /auth/login  — JWT 발급
 *
 * 비밀번호는 별도 user_credentials 테이블에 분리 저장하는 게 더 안전하지만,
 * MVP는 schema 단순성을 위해 이번 구현은 회원가입을 외부 IdP(Auth0/Clerk)로
 * 위임하기 직전의 자체 구현 placeholder.
 *
 * Closed Beta 진입 전에 Auth0/Clerk 또는 자체 비밀번호 + bcrypt + 이메일 인증으로 강화.
 */

import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { appPrisma } from '@buildee/db';

const SignupBody = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

const LoginBody = z.object({
  email: z.string().email(),
});

export const authRoutes: FastifyPluginAsync = async (app) => {
  /**
   * MVP placeholder: 비밀번호 없이 이메일만으로 가입.
   * Closed Beta 전에 IdP 통합 또는 비밀번호 + magic link로 강화.
   */
  app.post('/signup', async (req, reply) => {
    const body = SignupBody.parse(req.body);

    const existing = await appPrisma().user.findUnique({ where: { email: body.email } });
    if (existing) throw app.httpErrors.conflict('Email already registered');

    const user = await appPrisma().user.create({
      data: { email: body.email, name: body.name },
    });

    const token = await reply.jwtSign({ id: user.id, email: user.email });
    return { token, user: { id: user.id, email: user.email, name: user.name } };
  });

  app.post('/login', async (req, reply) => {
    const body = LoginBody.parse(req.body);

    const user = await appPrisma().user.findUnique({ where: { email: body.email } });
    if (!user) throw app.httpErrors.unauthorized('Invalid credentials');

    const token = await reply.jwtSign({ id: user.id, email: user.email });
    return { token, user: { id: user.id, email: user.email, name: user.name } };
  });

  app.get('/me', async (req) => {
    await req.requireAuth();
    const user = await appPrisma().user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, planTier: true, createdAt: true },
    });
    return { user };
  });
};
