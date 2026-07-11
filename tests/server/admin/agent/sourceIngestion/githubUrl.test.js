import { describe, expect, it } from 'vitest';

import {
  cleanGitHubRepoUrlInput,
  parseGitHubRepoUrl,
} from '../../../../../server/admin/agent/sourceIngestion/github/githubUrl.js';

describe('GitHub source URL parsing', () => {
  it('normalizes supported repository root and tree URLs', () => {
    expect(parseGitHubRepoUrl(' https://github.com/openai/codex.git ')).toEqual({
      ok: true,
      owner: 'openai',
      repo: 'codex',
      repoLabel: 'openai/codex',
      ref: '',
      normalizedUrl: 'https://github.com/openai/codex',
    });

    expect(parseGitHubRepoUrl('https://github.com/openai/codex/tree/feature/source-ingestion')).toEqual({
      ok: true,
      owner: 'openai',
      repo: 'codex',
      repoLabel: 'openai/codex',
      ref: 'feature/source-ingestion',
      normalizedUrl: 'https://github.com/openai/codex/tree/feature/source-ingestion',
    });
  });

  it('rejects unsupported hosts, routes, owners, and refs with stable warnings', () => {
    expect(parseGitHubRepoUrl('git@github.com:openai/codex.git')).toEqual({
      ok: false,
      warning: 'GitHub repository URL must be a valid https://github.com/{owner}/{repo} URL.',
    });
    expect(parseGitHubRepoUrl('https://gist.github.com/openai/codex')).toEqual({
      ok: false,
      warning: 'GitHub repository URL must use the github.com host.',
    });
    expect(parseGitHubRepoUrl('https://github.com/-bad/codex')).toEqual({
      ok: false,
      warning: 'GitHub repository URL must include a valid owner and repository name.',
    });
    expect(parseGitHubRepoUrl('https://github.com/openai/codex/pull/1')).toEqual({
      ok: false,
      warning: 'GitHub repository URL must point to a repository root or /tree/{branch-or-ref}.',
    });
    expect(parseGitHubRepoUrl('https://github.com/openai/codex/tree/%2Fmain')).toEqual({
      ok: false,
      warning: 'GitHub repository tree URL must include a valid branch or ref.',
    });
  });

  it('exposes the same input trimming used by the public facade', () => {
    expect(cleanGitHubRepoUrlInput('\nhttps://github.com/openai/codex\t')).toBe(
      'https://github.com/openai/codex',
    );
    expect(cleanGitHubRepoUrlInput(null)).toBe('');
  });
});
