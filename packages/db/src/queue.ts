/**
 * Buildee 큐 (Postgres SKIP LOCKED 패턴).
 *
 * 별도 큐 시스템 없이 tickets 테이블을 큐로 사용.
 * - PC 워커: 즉시 픽업 (PENDING 또는 락 만료된 IN_PROGRESS)
 * - API 워커: PC가 2분 내 안 가져간 티켓만 픽업 (폴백)
 *
 * 재할당 안전성: visibility timeout (locked_until). 워커 죽으면 자동 재할당.
 * 작업 중 워커는 keepalive로 락 갱신 (1분마다 5분 연장 권장).
 */

import { Pool, PoolClient } from 'pg';

// Local alias to avoid clashing with the Prisma `WorkerType` enum re-exported
// from index.ts. Same string union, kept internal to this module.
type WorkerType = 'PC' | 'API';

export type TicketRow = {
  id: string;
  project_id: string;
  type: string;
  spec: any;
  status: string;
  preferred_provider: string | null;
  actual_provider: string | null;
  provider_history: any;
  locked_by: string | null;
  locked_until: Date | null;
  attempt_count: number;
  parent_ticket_ids: string[];
  github_issue_number: number | null;
  created_at: Date;
  started_at: Date | null;
  completed_at: Date | null;
};

interface ClaimOptions {
  /** 워커 식별자 (예: "pc-1", "api-azure-1") */
  workerId: string;
  workerType: WorkerType;
  /** 락 시간 (분). 워커 작업 시간 + 여유. */
  lockMinutes?: number;
  /** API 워커가 PC 워커 우선 정책 적용 시 픽업 지연 (분). 기본 2분. */
  pcPickupGraceMinutes?: number;
}

// =================================================================
// 픽업: 큐에서 티켓 1개 받기
// =================================================================

/**
 * 큐에서 처리할 티켓 1개 받음. 없으면 null.
 *
 * SKIP LOCKED로 동시성 안전. 같은 티켓을 두 워커가 동시 픽업하지 못함.
 */
export async function claimTicket(
  pool: Pool,
  opts: ClaimOptions,
): Promise<TicketRow | null> {
  const lockMinutes = opts.lockMinutes ?? 15;
  const graceMinutes = opts.pcPickupGraceMinutes ?? 2;

  // PC 워커: 모든 사용 가능 티켓 (PENDING + 락 만료된 IN_PROGRESS)
  // API 워커: PC가 2분 내 안 가져간 티켓만
  const eligibilityClause =
    opts.workerType === 'PC'
      ? `(status = 'PENDING' OR (status = 'IN_PROGRESS' AND locked_until < NOW()))`
      : `(
          (status = 'PENDING' AND created_at < NOW() - INTERVAL '${graceMinutes} minutes')
          OR (status = 'IN_PROGRESS' AND locked_until < NOW())
        )`;

  const query = `
    UPDATE tickets
    SET
      status = 'IN_PROGRESS',
      locked_by = $1,
      locked_until = NOW() + INTERVAL '${lockMinutes} minutes',
      started_at = COALESCE(started_at, NOW()),
      attempt_count = attempt_count + 1
    WHERE id = (
      SELECT id FROM tickets
      WHERE ${eligibilityClause}
      ORDER BY created_at
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    RETURNING *
  `;

  const result = await pool.query<TicketRow>(query, [opts.workerId]);
  return result.rows[0] ?? null;
}

// =================================================================
// 락 갱신 (keepalive)
// =================================================================

/**
 * 작업 중인 워커가 주기적으로 호출. 락 만료 방지.
 * 1분마다 호출 권장 (5분 갱신).
 *
 * @returns 갱신 성공 여부 (워커가 이미 락을 잃었으면 false)
 */
export async function renewTicketLock(
  pool: Pool,
  ticketId: string,
  workerId: string,
  extendMinutes: number = 5,
): Promise<boolean> {
  const result = await pool.query(
    `
    UPDATE tickets
    SET locked_until = NOW() + INTERVAL '${extendMinutes} minutes'
    WHERE id = $1 AND locked_by = $2 AND status = 'IN_PROGRESS'
    `,
    [ticketId, workerId],
  );
  return (result.rowCount ?? 0) > 0;
}

// =================================================================
// 완료/실패 보고
// =================================================================

export async function completeTicket(
  pool: Pool,
  ticketId: string,
  workerId: string,
): Promise<void> {
  await pool.query(
    `
    UPDATE tickets
    SET status = 'COMPLETED', completed_at = NOW(), locked_until = NULL
    WHERE id = $1 AND locked_by = $2
    `,
    [ticketId, workerId],
  );
}

export async function failTicket(
  pool: Pool,
  ticketId: string,
  workerId: string,
  status: 'FAILED' | 'GUARDRAIL_FAILED' = 'FAILED',
): Promise<void> {
  await pool.query(
    `
    UPDATE tickets
    SET status = $3, completed_at = NOW(), locked_until = NULL
    WHERE id = $1 AND locked_by = $2
    `,
    [ticketId, workerId, status],
  );
}

// =================================================================
// 워커 하트비트
// =================================================================

export async function reportHeartbeat(
  pool: Pool,
  workerId: string,
  workerType: WorkerType,
  currentTicketId?: string,
): Promise<void> {
  await pool.query(
    `
    INSERT INTO worker_heartbeats (worker_id, worker_type, status, last_heartbeat_at, current_ticket_id)
    VALUES ($1, $2, 'ACTIVE', NOW(), $3)
    ON CONFLICT (worker_id) DO UPDATE
    SET status = 'ACTIVE',
        last_heartbeat_at = NOW(),
        current_ticket_id = EXCLUDED.current_ticket_id
    `,
    [workerId, workerType, currentTicketId ?? null],
  );
}

/**
 * 디스패처가 주기적으로 호출. 하트비트 N분 이상 끊긴 워커를 INACTIVE 표시.
 * 라우팅 결정에 사용.
 */
export async function markStaleWorkersInactive(
  pool: Pool,
  staleMinutes: number = 2,
): Promise<number> {
  const result = await pool.query(
    `
    UPDATE worker_heartbeats
    SET status = 'INACTIVE'
    WHERE status = 'ACTIVE' AND last_heartbeat_at < NOW() - INTERVAL '${staleMinutes} minutes'
    `,
  );
  return result.rowCount ?? 0;
}

// =================================================================
// 큐 통계 (모니터링용)
// =================================================================

export async function queueStats(pool: Pool): Promise<{
  pending: number;
  inProgress: number;
  completedLast24h: number;
  failedLast24h: number;
  oldestPendingAgeSec: number | null;
}> {
  const result = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'PENDING') AS pending,
      COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') AS in_progress,
      COUNT(*) FILTER (WHERE status = 'COMPLETED' AND completed_at > NOW() - INTERVAL '24 hours') AS completed_24h,
      COUNT(*) FILTER (WHERE status IN ('FAILED', 'GUARDRAIL_FAILED') AND completed_at > NOW() - INTERVAL '24 hours') AS failed_24h,
      EXTRACT(EPOCH FROM (NOW() - MIN(created_at) FILTER (WHERE status = 'PENDING'))) AS oldest_pending_sec
    FROM tickets
  `);
  const row = result.rows[0];
  return {
    pending: parseInt(row.pending, 10),
    inProgress: parseInt(row.in_progress, 10),
    completedLast24h: parseInt(row.completed_24h, 10),
    failedLast24h: parseInt(row.failed_24h, 10),
    oldestPendingAgeSec: row.oldest_pending_sec ? parseFloat(row.oldest_pending_sec) : null,
  };
}
