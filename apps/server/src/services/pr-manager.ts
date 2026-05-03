/**
 * PR 머지 + 폐기 헬퍼.
 *
 * 사용자가 변경 트레이에서 "라이브 발행" 클릭하면 호출.
 * 변경 거부 시엔 PR을 close (브랜치 보존, 복구 가능성 위해).
 */

import type { Project } from '@buildee/db';
import { getOctokit } from '../lib/github-app.js';
import { config } from '../lib/config.js';
import { projectShortId } from '@buildee/db';
import { logger } from '../lib/logger.js';

export async function mergePullRequest(
  project: Project,
  prNumber: number,
): Promise<{ mergedSha: string }> {
  const octokit = await getOctokit();
  const repoName = `proj-${projectShortId(project.id)}`;

  // squash merge (커밋 히스토리 깔끔하게)
  const { data } = await octokit.rest.pulls.merge({
    owner: config.GITHUB_ORG,
    repo: repoName,
    pull_number: prNumber,
    merge_method: 'squash',
    commit_title: `Apply ticket changes (PR #${prNumber})`,
  });

  if (!data.merged) {
    throw new Error(`PR #${prNumber} merge failed: ${data.message}`);
  }

  logger.info(
    { repo: repoName, prNumber, sha: data.sha },
    'PR merged (squash)',
  );

  // 머지된 브랜치 자동 삭제 (cleanup)
  try {
    const { data: pr } = await octokit.rest.pulls.get({
      owner: config.GITHUB_ORG,
      repo: repoName,
      pull_number: prNumber,
    });
    if (pr.head.ref !== 'main') {
      await octokit.rest.git.deleteRef({
        owner: config.GITHUB_ORG,
        repo: repoName,
        ref: `heads/${pr.head.ref}`,
      });
    }
  } catch (err) {
    logger.warn({ err, prNumber }, 'Branch cleanup failed (non-fatal)');
  }

  return { mergedSha: data.sha };
}

export async function closePullRequest(
  project: Project,
  prNumber: number,
  reason: string,
): Promise<void> {
  const octokit = await getOctokit();
  const repoName = `proj-${projectShortId(project.id)}`;

  await octokit.rest.issues.createComment({
    owner: config.GITHUB_ORG,
    repo: repoName,
    issue_number: prNumber,
    body: `Closed by user: ${reason}`,
  });

  await octokit.rest.pulls.update({
    owner: config.GITHUB_ORG,
    repo: repoName,
    pull_number: prNumber,
    state: 'closed',
  });

  logger.info({ repo: repoName, prNumber, reason }, 'PR closed by user');
}
