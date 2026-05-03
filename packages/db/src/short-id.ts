/**
 * Project UUID → 짧은 식별자 변환.
 * Postgres DB 이름은 영숫자 + underscore. UUID 그대로 쓰면 너무 김.
 *
 * 예: "a3f2c4e8-1234-5678-9abc-def012345678" → "a3xk7m2"
 */

import { createHash } from 'node:crypto';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';

/**
 * UUID에서 결정론적 short ID 생성. 충돌 가능성 매우 낮음 (8자 = 36^8 ≈ 2.8조).
 * 같은 UUID는 항상 같은 short ID로 변환됨.
 */
export function projectShortId(projectUuid: string): string {
  const hash = createHash('sha256').update(projectUuid).digest();
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += ALPHABET[hash[i]! % ALPHABET.length];
  }
  return result;
}

/**
 * Project DB 이름 ("proj_xxxxxxxx" 형식).
 * Postgres identifier 규칙 (소문자, _, 영숫자) 준수.
 */
export function projectDbName(projectUuid: string): string {
  return `proj_${projectShortId(projectUuid)}`;
}

/**
 * Project별 Postgres role 이름.
 */
export function projectDbRole(projectUuid: string): string {
  return `proj_${projectShortId(projectUuid)}_writer`;
}
