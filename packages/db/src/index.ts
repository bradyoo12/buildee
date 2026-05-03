/**
 * Buildee DB 패키지 entry point.
 *
 * 두 종류의 Prisma 클라이언트:
 * - appPrisma: app_main DB (singleton)
 * - getProjectPrisma(projectUuid): Project별 DB (LRU 캐시)
 *
 * Project DB는 connection이 동적이므로, Prisma client 인스턴스를 Project별로 생성/캐싱.
 */

import { PrismaClient as AppPrismaClient } from './generated/app-client/index.js';
import { PrismaClient as ProjectPrismaClient } from './generated/project-client/index.js';
import { LRUCache } from 'lru-cache';
import { projectDbName } from './short-id.js';

// =================================================================
// app_main 싱글톤
// =================================================================

let _appPrisma: AppPrismaClient | null = null;

export function appPrisma(): AppPrismaClient {
  if (_appPrisma) return _appPrisma;

  if (!process.env.DATABASE_URL_APP_MAIN) {
    throw new Error('DATABASE_URL_APP_MAIN env not set');
  }

  _appPrisma = new AppPrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL_APP_MAIN } },
  });
  return _appPrisma;
}

// =================================================================
// Project DB 클라이언트 팩토리 (LRU 캐시)
// =================================================================

interface ProjectDbCredentials {
  host: string;
  port: number;
  /** Project별 role + password (Key Vault에서 로드) */
  user: string;
  password: string;
  ssl?: boolean;
}

const projectClientCache = new LRUCache<string, ProjectPrismaClient>({
  max: 200, // 동시에 200 Project까지 활성 유지
  dispose: (client) => {
    void client.$disconnect();
  },
  ttl: 1000 * 60 * 30, // 30분 미사용 시 정리
});

/**
 * Project DB Prisma 클라이언트 가져옴 (캐시).
 *
 * 호출자가 credentials를 제공해야 함 (Key Vault에서 조회 후).
 */
export function getProjectPrisma(
  projectUuid: string,
  creds: ProjectDbCredentials,
): ProjectPrismaClient {
  const cached = projectClientCache.get(projectUuid);
  if (cached) return cached;

  const dbName = projectDbName(projectUuid);
  const sslSuffix = creds.ssl ? '?sslmode=require' : '';
  const url = `postgresql://${encodeURIComponent(creds.user)}:${encodeURIComponent(creds.password)}@${creds.host}:${creds.port}/${dbName}${sslSuffix}`;

  const client = new ProjectPrismaClient({
    datasources: { db: { url } },
  });

  projectClientCache.set(projectUuid, client);
  return client;
}

/**
 * Project DB 캐시 비우기 (Project 삭제 시).
 */
export async function evictProjectPrisma(projectUuid: string): Promise<void> {
  const client = projectClientCache.get(projectUuid);
  if (client) {
    await client.$disconnect();
    projectClientCache.delete(projectUuid);
  }
}

// =================================================================
// 다른 모듈 export
// =================================================================

export * from './short-id.js';
export * from './project-db-manager.js';
export * from './queue.js';

// =================================================================
// 도메인 타입 + enum re-export (apps/server에서 @buildee/db로 import)
// =================================================================

export type {
  User,
  Project,
  SpecVersion,
  DesignSystem,
  DesignSystemTemplate,
  PageComposition,
  CodebaseVersion,
  Deployment,
  Ticket,
  TicketResult,
  ChangeRequest,
  DecisionLog,
  FormDefinition,
  Asset,
  ProviderHealth,
  WorkerHeartbeat,
} from './generated/app-client/index.js';

export {
  PlanTier,
  Tier3Provider,
  Platform,
  ProjectType,
  ProjectStatus,
  DesignSystemOrigin,
  TemplateStatus,
  DeploymentEnvironment,
  DeploymentStatus,
  TicketType,
  TicketStatus,
  Provider,
  TicketResultStatus,
  ChangeCategory,
  ChangeRequestStatus,
  FormDefinitionStatus,
  AssetStatus,
  WorkerType,
  WorkerStatus,
} from './generated/app-client/index.js';

export type {
  FormSubmission,
  SubmissionStatus,
} from './generated/project-client/index.js';
