/**
 * Notification 서비스.
 *
 * 두 채널:
 * 1. 실시간: WebSocket broadcast (사용자 앱이 열려 있을 때)
 * 2. 이메일: 양식 응답, 처리 완료 등 (외부 서비스 — Resend 추천)
 *
 * MVP는 stub. Closed Beta 진입 전 Resend 통합.
 */

import type { FormDefinition } from '@buildee/db';
import { logger } from '../lib/logger.js';
import { config } from '../lib/config.js';

interface SubmissionPreview {
  id: string;
  submittedData: any;
  submittedAt: Date;
}

/**
 * 양식 응답 도착 시 사이트 운영자에게 이메일 알림.
 *
 * MVP stub. Closed Beta 전 실제 이메일 발송 통합.
 */
export async function sendFormNotification(
  form: FormDefinition,
  submission: SubmissionPreview,
): Promise<void> {
  const cfg = form.notificationConfig as any;
  const targetEmail = cfg?.targetEmail;

  if (!targetEmail) {
    logger.debug({ formId: form.id }, 'No notification target configured');
    return;
  }

  // TODO: Resend or SendGrid API 호출
  // await resend.emails.send({
  //   from: config.EMAIL_FROM_ADDRESS,
  //   to: targetEmail,
  //   subject: `[${form.name}] 새 응답 도착`,
  //   html: renderFormEmailTemplate(form, submission),
  // });

  logger.info(
    { formId: form.id, submissionId: submission.id, target: targetEmail },
    '[stub] Form notification email',
  );
}
