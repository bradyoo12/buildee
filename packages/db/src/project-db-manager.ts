/**
 * Project DB 매니저.
 *
 * 옵션 E의 핵심 인프라:
 * - 단일 Postgres 서버 위에 Project별 DB 생성/삭제
 * - DB별 격리된 Postgres role + 권한
 * - 마이그레이션 자동 적용
 *
 * 주의: CREATE DATABASE는 트랜잭션 안에서 못 함 (Postgres 제약).
 * 그래서 Prisma 외 별도 Pool로 처리.
 */

import { Pool, PoolClient } from 'pg';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { projectDbName, projectDbRole } from './short-id.js';

// =================================================================
// 설정
// =================================================================

interface ProjectDbConfig {
  /** Postgres 호스트 (예: my-server.postgres.database.azure.com) */
  host: string;
  port: number;
  /** admin 계정 (CREATE DATABASE 권한 보유) */
  adminUser: string;
  adminPassword: string;
  /** SSL 옵션 (Azure Postgres는 require) */
  ssl?: boolean;
  /** proj_template 마이그레이션 SQL 파일 디렉터리 */
  migrationsDir: string;
}

// =================================================================
// Project DB 생성
// =================================================================

/**
 * Project DB를 생성하고 초기 마이그레이션을 적용한다.
 *
 * 1. CREATE DATABASE proj_xxx
 * 2. 그 DB에 연결해서 마이그레이션 SQL 실행
 * 3. Project별 role 생성 + 권한 부여
 * 4. 생성된 role의 비밀번호 반환 (Key Vault에 저장)
 *
 * @returns 생성된 role 이름과 비밀번호 (호출자가 Key Vault에 저장해야 함)
 */
export async function createProjectDatabase(
  projectUuid: string,
  config: ProjectDbConfig,
): Promise<{ dbName: string; role: string; password: string; schemaVersion: number }> {
  const dbName = projectDbName(projectUuid);
  const role = projectDbRole(projectUuid);
  const password = generatePassword();

  // 1. admin 연결 (postgres DB에 연결, CREATE DATABASE 위해)
  const adminPool = new Pool({
    host: config.host,
    port: config.port,
    user: config.adminUser,
    password: config.adminPassword,
    database: 'postgres',
    ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
  });

  try {
    // CREATE DATABASE (식별자에 변수 못 쓰므로 검증된 이름만 사용)
    if (!isSafeIdentifier(dbName)) throw new Error(`Unsafe DB name: ${dbName}`);
    await adminPool.query(`CREATE DATABASE "${dbName}"`);

    // CREATE ROLE + 비밀번호
    if (!isSafeIdentifier(role)) throw new Error(`Unsafe role: ${role}`);
    await adminPool.query(
      `CREATE ROLE "${role}" WITH LOGIN PASSWORD $1`,
      [password],
    );
  } finally {
    await adminPool.end();
  }

  // 2. 새 DB에 연결해서 마이그레이션 + 권한 부여
  const projectPool = new Pool({
    host: config.host,
    port: config.port,
    user: config.adminUser,
    password: config.adminPassword,
    database: dbName,
    ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
  });

  let schemaVersion = 0;
  try {
    schemaVersion = await applyMigrations(projectPool, config.migrationsDir);

    // role에 권한 부여 (모든 테이블 read/write, 미래 테이블도 자동)
    await projectPool.query(`GRANT CONNECT ON DATABASE "${dbName}" TO "${role}"`);
    await projectPool.query(`GRANT USAGE ON SCHEMA public TO "${role}"`);
    await projectPool.query(
      `GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO "${role}"`,
    );
    await projectPool.query(
      `GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO "${role}"`,
    );
    await projectPool.query(
      `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "${role}"`,
    );
    await projectPool.query(
      `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO "${role}"`,
    );
  } finally {
    await projectPool.end();
  }

  return { dbName, role, password, schemaVersion };
}

// =================================================================
// Project DB 삭제 (30일 grace period 후 호출)
// =================================================================

export async function dropProjectDatabase(
  projectUuid: string,
  config: ProjectDbConfig,
): Promise<void> {
  const dbName = projectDbName(projectUuid);
  const role = projectDbRole(projectUuid);

  const adminPool = new Pool({
    host: config.host,
    port: config.port,
    user: config.adminUser,
    password: config.adminPassword,
    database: 'postgres',
    ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
  });

  try {
    if (!isSafeIdentifier(dbName)) throw new Error(`Unsafe DB name: ${dbName}`);
    if (!isSafeIdentifier(role)) throw new Error(`Unsafe role: ${role}`);

    // 활성 연결 종료 강제 (DROP DATABASE는 활성 연결 있으면 실패)
    await adminPool.query(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
      [dbName],
    );

    await adminPool.query(`DROP DATABASE IF EXISTS "${dbName}"`);
    await adminPool.query(`DROP ROLE IF EXISTS "${role}"`);
  } finally {
    await adminPool.end();
  }
}

// =================================================================
// 마이그레이션 적용
// =================================================================

/**
 * proj_template 마이그레이션 SQL 파일들을 순서대로 적용.
 * 파일명 규칙: V001__init.sql, V002__add_xxx.sql ...
 *
 * @returns 적용된 마지막 버전 번호
 */
export async function applyMigrations(
  pool: Pool,
  migrationsDir: string,
): Promise<number> {
  // schema_migrations 테이블 (없으면 생성)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INT PRIMARY KEY,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  // 적용된 버전 조회
  const applied = await pool.query<{ version: number }>(
    `SELECT version FROM schema_migrations ORDER BY version`,
  );
  const appliedSet = new Set(applied.rows.map((r) => r.version));

  // 마이그레이션 파일 목록 (V001__*.sql 형식만)
  const { readdir } = await import('node:fs/promises');
  const files = (await readdir(migrationsDir))
    .filter((f) => /^V\d+__.+\.sql$/.test(f))
    .sort();

  let lastApplied = applied.rows.length > 0
    ? applied.rows[applied.rows.length - 1]!.version
    : 0;

  for (const file of files) {
    const versionMatch = file.match(/^V(\d+)/);
    if (!versionMatch || !versionMatch[1]) continue;
    const version = parseInt(versionMatch[1], 10);
    if (appliedSet.has(version)) continue;

    const sql = await readFile(join(migrationsDir, file), 'utf-8');

    // 트랜잭션으로 마이그레이션 + 버전 기록 묶기
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query(
        `INSERT INTO schema_migrations (version) VALUES ($1)`,
        [version],
      );
      await client.query('COMMIT');
      lastApplied = version;
    } catch (err) {
      await client.query('ROLLBACK');
      throw new Error(`Migration ${file} failed: ${(err as Error).message}`);
    } finally {
      client.release();
    }
  }

  return lastApplied;
}

/**
 * 모든 Project DB에 최신 마이그레이션 적용 (시스템 업데이트 시 백그라운드 작업).
 * @param projectDbNames 적용할 DB 이름 리스트
 */
export async function migrateAllProjectDbs(
  projectDbNames: string[],
  config: ProjectDbConfig,
): Promise<{ dbName: string; schemaVersion: number; error?: string }[]> {
  const results: { dbName: string; schemaVersion: number; error?: string }[] = [];

  for (const dbName of projectDbNames) {
    try {
      const pool = new Pool({
        host: config.host,
        port: config.port,
        user: config.adminUser,
        password: config.adminPassword,
        database: dbName,
        ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
      });

      const version = await applyMigrations(pool, config.migrationsDir);
      await pool.end();

      results.push({ dbName, schemaVersion: version });
    } catch (err) {
      results.push({ dbName, schemaVersion: -1, error: (err as Error).message });
    }
  }

  return results;
}

// =================================================================
// 유틸
// =================================================================

/**
 * Postgres identifier로 안전한지 검증 (SQL injection 방지).
 * 영숫자 + underscore만 허용, 첫 문자는 알파벳.
 */
function isSafeIdentifier(name: string): boolean {
  return /^[a-z][a-z0-9_]{0,62}$/.test(name);
}

/**
 * 강력한 랜덤 비밀번호 생성 (32 bytes → 43자 base64url).
 */
function generatePassword(): string {
  return randomBytes(32).toString('base64url');
}
