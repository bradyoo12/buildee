/**
 * 환경 변수 + 시크릿 로드.
 * 로컬: .env에서. 프로덕션: Azure Key Vault 통해 주입.
 *
 * 모든 시크릿은 zod로 검증해서 type-safe하게 사용.
 */

import { z } from 'zod';

const Env = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),

  // DB
  DATABASE_URL_APP_MAIN: z.string().url(),
  PG_HOST: z.string(),
  PG_PORT: z.coerce.number().default(5432),
  PG_ADMIN_USER: z.string(),
  PG_ADMIN_PASSWORD: z.string(),
  PG_SSL: z.coerce.boolean().default(true),

  // JWT
  JWT_SECRET: z.string().min(32),

  // CORS — 콤마로 구분된 origin 리스트
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173')
    .transform((v) => v.split(',').map((s) => s.trim())),

  // GitHub App
  GITHUB_APP_ID: z.string(),
  GITHUB_PRIVATE_KEY: z.string(),
  GITHUB_WEBHOOK_SECRET: z.string(),
  GITHUB_ORG: z.string().default('buildee-projects'),

  // 프로바이더 (Tier 2 폴백)
  ANTHROPIC_API_KEY: z.string(),
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),

  // Azure
  AZURE_BLOB_CONNECTION_STRING: z.string(),
  AZURE_KEY_VAULT_URL: z.string().url().optional(),
  APPLICATIONINSIGHTS_CONNECTION_STRING: z.string().optional(),

  // Email
  EMAIL_PROVIDER_API_KEY: z.string().optional(),
  EMAIL_FROM_ADDRESS: z.string().email().default('noreply@buildee.app'),
});

export const config = Env.parse(process.env);
export type Config = z.infer<typeof Env>;
