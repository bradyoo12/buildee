/**
 * Classification 서비스.
 *
 * 사용자 자연어 메시지를 분류:
 * - 카테고리 (CONTENT/CONFIG/COMPOSITION/DESIGN_SYSTEM/CODE/FULL_STACK/FORM)
 * - 영향받는 레이어
 * - 구조화된 변경 명세 (proposedChanges)
 * - 대안들 (alternatives) — 사용자가 다르게 해석할 여지가 있을 때
 *
 * MVP: Anthropic API 직접 호출 (Tier 2). 결과 일관성 위해 같은 모델 사용.
 *
 * 향후: 분류 정확도가 핵심 리스크. 데이터 쌓이면 fine-tuning 또는 자체 분류기 검토.
 */

import type { Project } from '@buildee/db';
import type { ChangeCategory } from '@buildee/db';

export interface ClassificationInput {
  project: Project;
  userMessage: string;
}

export interface ClassificationResult {
  category: ChangeCategory;
  affectedLayers: string[];
  proposedChanges: Record<string, unknown>;
  alternatives: Array<{ description: string; category: ChangeCategory }>;
  confidence: number;
}

/**
 * MVP placeholder.
 *
 * 실제 구현은 Anthropic API에 system prompt + 사용자 메시지 + Project 컨텍스트
 * 보내서 JSON 응답 받음.
 *
 * Buildee의 가장 중요한 LLM 호출 지점. system prompt는 별도 파일로 분리하고
 * 변경 카테고리 정의·예시·rule을 잘 짜야 함 (분류 정확도 = 사용자 만족도).
 */
export async function classifyChangeRequest(
  input: ClassificationInput,
): Promise<ClassificationResult> {
  // TODO: Anthropic API 호출
  // const response = await anthropic.messages.create({
  //   model: 'claude-opus-4-7',
  //   system: CLASSIFICATION_SYSTEM_PROMPT,
  //   messages: [{ role: 'user', content: buildPrompt(input) }],
  //   response_format: { type: 'json_object' },
  // });
  // const parsed = JSON.parse(response.content[0].text);
  // return parsed as ClassificationResult;

  // 임시 stub: 키워드 기반 단순 분류 (개발용)
  const msg = input.userMessage.toLowerCase();

  if (msg.includes('양식') || msg.includes('폼') || msg.includes('예약')) {
    return stubResult('FORM', ['form'], { intent: input.userMessage });
  }
  if (msg.includes('색') || msg.includes('폰트') || msg.includes('크기')) {
    return stubResult('CONFIG', ['design_system_tokens'], { intent: input.userMessage });
  }
  if (msg.includes('텍스트') || msg.includes('문구') || msg.includes('이미지')) {
    return stubResult('CONTENT', ['content'], { intent: input.userMessage });
  }
  if (msg.includes('페이지') || msg.includes('새')) {
    return stubResult('COMPOSITION', ['composition'], { intent: input.userMessage });
  }

  return stubResult('CODE', ['composition', 'code'], { intent: input.userMessage });
}

function stubResult(
  category: ChangeCategory,
  layers: string[],
  proposed: Record<string, unknown>,
): ClassificationResult {
  return {
    category,
    affectedLayers: layers,
    proposedChanges: proposed,
    alternatives: [],
    confidence: 0.6, // stub: 낮은 확신도
  };
}
