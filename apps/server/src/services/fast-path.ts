/**
 * Fast-path 서비스.
 *
 * CONTENT/CONFIG 카테고리는 워커 안 거치고 서버에서 직접 처리:
 * - DB 직접 수정 (불변 버전 패턴)
 * - 미리보기 환경에 즉시 반영
 * - 사용자에게 알림
 *
 * 사용자 자동 승인 레벨에 따라:
 * - Off: 미리보기만, 사용자 승인 후 라이브
 * - Medium (기본): 빠른 경로는 자동 라이브, 코드는 명시적 승인
 */

import type { ChangeRequest, Project } from '@buildee/db';
import { appPrisma } from '@buildee/db';
import { broadcastToUser } from '../routes/ws.js';

export async function applyFastPath(
  changeRequest: ChangeRequest,
  project: Project,
): Promise<{ changeRequest: ChangeRequest }> {
  // 카테고리별 처리 분기
  switch (changeRequest.changeCategory) {
    case 'CONTENT':
      // TODO: Content 테이블 update + 새 ContentVersion 생성
      // 실제 구현: app_main에 contents 테이블 추가 또는 별도 content 서비스
      break;
    case 'CONFIG':
      // TODO: Config 테이블 update + 새 ConfigVersion
      break;
    default:
      throw new Error(`Fast-path called for non-fast category: ${changeRequest.changeCategory}`);
  }

  // ChangeRequest 상태 업데이트 (자동 승인 가정 시)
  const applied = await appPrisma().changeRequest.update({
    where: { id: changeRequest.id },
    data: { status: 'APPLIED', resolvedAt: new Date() },
  });

  // 사용자 알림 (실시간)
  broadcastToUser(changeRequest.userId, {
    type: 'change.applied',
    changeRequestId: applied.id,
    category: applied.changeCategory,
  });

  return { changeRequest: applied };
}
