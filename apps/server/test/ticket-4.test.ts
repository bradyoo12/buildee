// ticket: #4
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const README_PATH = resolve(__dirname, '../../../README.md');
const README = readFileSync(README_PATH, 'utf8');

const mermaidBlocks = README.match(/```mermaid([\s\S]*?)```/g) ?? [];
const mermaidContent = mermaidBlocks.join('\n');

describe('ticket #4 — README monorepo 아키텍처 다이어그램', () => {
  it('AC: README.md에 mermaid 코드 블록이 최소 1개 존재한다', () => {
    expect(mermaidBlocks.length).toBeGreaterThanOrEqual(1);
  });

  describe('시나리오 2: 핵심 노드 모두 포함', () => {
    it('Then: mermaid 블록에 apps/server 노드가 있다', () => {
      expect(mermaidContent).toContain('apps/server');
    });

    it('Then: mermaid 블록에 packages/db 노드가 있다', () => {
      expect(mermaidContent).toContain('packages/db');
    });

    it('Then: mermaid 블록에 GitHub App 노드가 있다', () => {
      expect(mermaidContent).toMatch(/GitHub\s*App/i);
    });

    it('Then: mermaid 블록에 Editor 노드가 있다', () => {
      expect(mermaidContent).toMatch(/Editor/i);
    });
  });

  describe('시나리오 1: 다이어그램 섹션 헤딩', () => {
    it('Then: README에 "아키텍처 다이어그램" 섹션이 있다', () => {
      expect(README).toMatch(/##\s+아키텍처\s*다이어그램/);
    });
  });
});
