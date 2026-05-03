/**
 * Repo Manager.
 *
 * Project당 GitHub private repo 자동 생성/관리.
 *
 * - createForProject(): 새 Project 생성 시 호출 → org에 private repo + 초기 commit
 * - archiveForProject(): Project 삭제 시 호출 → repo archive (즉시 삭제하지 않음, GA 후 정책 결정)
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Buffer } from 'node:buffer';
import { getOctokit } from '../lib/github-app.js';
import { config } from '../lib/config.js';
import { logger } from '../lib/logger.js';
import { projectShortId } from '@buildee/db';

const TEMPLATES_DIR = fileURLToPath(new URL('../../templates', import.meta.url));

interface CreateForProjectInput {
  projectId: string;
  projectName: string;
  /** 사용자가 자연어로 입력한 사이트 설명 (CLAUDE.md에 들어감) */
  description?: string;
  /** Project 타입 (LANDING, CONTENT, FORM 등) */
  projectType: string;
}

interface CreateForProjectResult {
  repoName: string;
  repoUrl: string;
  defaultBranch: string;
}

/**
 * Project당 private repo 생성 + 초기 commit (README, CLAUDE.md).
 */
export async function createRepoForProject(
  input: CreateForProjectInput,
): Promise<CreateForProjectResult> {
  const repoName = `proj-${projectShortId(input.projectId)}`;
  const octokit = await getOctokit();

  // 1. Repo 생성
  await octokit.rest.repos.createInOrg({
    org: config.GITHUB_ORG,
    name: repoName,
    description: `Buildee project: ${input.projectName}`,
    private: true,
    auto_init: true, // 빈 main branch + 빈 README
    has_issues: true,
    has_projects: false,
    has_wiki: false,
  });

  logger.info({ repoName, projectId: input.projectId }, 'GitHub repo created');

  // 2. main branch SHA 조회
  const { data: ref } = await octokit.rest.git.getRef({
    owner: config.GITHUB_ORG,
    repo: repoName,
    ref: 'heads/main',
  });
  const baseSha = ref.object.sha;

  // 3. 초기 파일 commit (README + CLAUDE.md)
  const readmeContent = renderReadme(input);
  const claudeMdContent = await renderClaudeMd(input);

  // 한 번의 트리 commit으로 두 파일 추가
  const { data: baseCommit } = await octokit.rest.git.getCommit({
    owner: config.GITHUB_ORG,
    repo: repoName,
    commit_sha: baseSha,
  });

  const { data: tree } = await octokit.rest.git.createTree({
    owner: config.GITHUB_ORG,
    repo: repoName,
    base_tree: baseCommit.tree.sha,
    tree: [
      {
        path: 'README.md',
        mode: '100644',
        type: 'blob',
        content: readmeContent,
      },
      {
        path: 'CLAUDE.md',
        mode: '100644',
        type: 'blob',
        content: claudeMdContent,
      },
    ],
  });

  const { data: newCommit } = await octokit.rest.git.createCommit({
    owner: config.GITHUB_ORG,
    repo: repoName,
    message: 'Initial scaffold (Buildee)',
    tree: tree.sha,
    parents: [baseSha],
  });

  await octokit.rest.git.updateRef({
    owner: config.GITHUB_ORG,
    repo: repoName,
    ref: 'heads/main',
    sha: newCommit.sha,
  });

  logger.info({ repoName, commitSha: newCommit.sha }, 'Initial commit pushed');

  return {
    repoName,
    repoUrl: `https://github.com/${config.GITHUB_ORG}/${repoName}`,
    defaultBranch: 'main',
  };
}

/**
 * Project 삭제 시 repo archive (영구 삭제 X — 복원 가능성 위해).
 * 30일 grace period 후 영구 삭제는 워커가 별도 처리.
 */
export async function archiveRepoForProject(projectId: string): Promise<void> {
  const repoName = `proj-${projectShortId(projectId)}`;
  const octokit = await getOctokit();

  await octokit.rest.repos.update({
    owner: config.GITHUB_ORG,
    repo: repoName,
    archived: true,
  });

  logger.info({ repoName, projectId }, 'GitHub repo archived');
}

/**
 * Project 영구 삭제 (30일 grace 후 백그라운드 워커가 호출).
 */
export async function deleteRepoForProject(projectId: string): Promise<void> {
  const repoName = `proj-${projectShortId(projectId)}`;
  const octokit = await getOctokit();

  await octokit.rest.repos.delete({
    owner: config.GITHUB_ORG,
    repo: repoName,
  });

  logger.info({ repoName, projectId }, 'GitHub repo permanently deleted');
}

// =================================================================
// 템플릿 렌더링
// =================================================================

function renderReadme(input: CreateForProjectInput): string {
  return `# ${input.projectName}

This site is managed by [Buildee](https://buildee.app).

> ⚠️ Do not edit this repository directly. All changes go through the Buildee editor.
> Direct commits will not be reflected in the live site and may be overwritten.

## How changes work

1. User makes a request via Buildee chat or inline editor
2. Buildee creates a GitHub Issue with the structured task spec
3. The PC worker (or fallback API worker) picks up the Issue, runs Claude Code,
   and creates a Pull Request
4. Guardrails (build, lint, domain rules) run automatically
5. User reviews the preview and approves; the PR is merged
6. The site is redeployed from \`main\`

## Project metadata

- Project type: \`${input.projectType}\`
- Generated: ${new Date().toISOString()}
`;
}

async function renderClaudeMd(input: CreateForProjectInput): Promise<string> {
  const templatePath = join(TEMPLATES_DIR, 'CLAUDE.md.template');
  let template = await readFile(templatePath, 'utf-8');
  return template
    .replace(/\{\{PROJECT_NAME\}\}/g, input.projectName)
    .replace(/\{\{PROJECT_TYPE\}\}/g, input.projectType)
    .replace(/\{\{DESCRIPTION\}\}/g, input.description ?? '(no description)');
}
