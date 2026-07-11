import { describe, expect, it, vi } from 'vitest';

import {
  fetchGitHubJson,
  getGitHubBlobUrl,
  getGitHubRepositoryMetadataUrl,
  getGitHubRepositoryTreeUrl,
  getWarningFromGitHubFetchResult,
} from '../../../../../server/admin/agent/sourceIngestion/github/githubApiClient.js';

function createHeaders(values = {}) {
  const normalized = new Map(
    Object.entries(values).map(([key, value]) => [key.toLowerCase(), value]),
  );

  return {
    get(name) {
      return normalized.get(String(name).toLowerCase()) ?? null;
    },
  };
}

function createJsonResponse(data, { status = 200, headers } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: createHeaders(headers),
    json: async () => data,
  };
}

describe('GitHub API client helpers', () => {
  it('builds stable GitHub API URLs with encoded refs and blob SHAs', () => {
    expect(getGitHubRepositoryMetadataUrl({ owner: 'owner', repo: 'repo' })).toBe(
      'https://api.github.com/repos/owner/repo',
    );
    expect(getGitHubRepositoryTreeUrl({
      owner: 'owner',
      repo: 'repo',
      ref: 'feature/source ingestion',
    })).toBe(
      'https://api.github.com/repos/owner/repo/git/trees/feature%2Fsource%20ingestion?recursive=1',
    );
    expect(getGitHubBlobUrl({ owner: 'owner', repo: 'repo', sha: 'abcdef' })).toBe(
      'https://api.github.com/repos/owner/repo/git/blobs/abcdef',
    );
  });

  it('fetches JSON with GitHub headers and maps parse failures', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      status: 200,
      headers: createHeaders(),
      json: async () => {
        throw new Error('bad json');
      },
    }));

    await expect(fetchGitHubJson('https://api.github.com/repos/owner/repo', {
      fetchImpl,
      timeoutMs: 1000,
    })).resolves.toEqual({
      ok: false,
      warning: 'GitHub source response could not be parsed as JSON.',
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://api.github.com/repos/owner/repo',
      expect.objectContaining({
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'local-codex-project-agent',
        },
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it('returns factual fetch failures without throwing', async () => {
    await expect(fetchGitHubJson('https://api.github.com/repos/owner/repo', {
      fetchImpl: null,
      timeoutMs: 1000,
    })).resolves.toEqual({
      ok: false,
      warning: 'GitHub source fetch is unavailable in this runtime.',
    });

    await expect(fetchGitHubJson('https://api.github.com/repos/owner/repo', {
      fetchImpl: vi.fn(async () => {
        throw new Error('network down');
      }),
      timeoutMs: 1000,
    })).resolves.toEqual({
      ok: false,
      warning: 'GitHub source fetch failed because the network request could not be completed.',
    });
  });

  it('maps HTTP and rate-limit responses to stable source warnings', () => {
    expect(getWarningFromGitHubFetchResult({
      response: createJsonResponse({ message: 'Not Found' }, { status: 404 }),
    }, 'repository metadata')).toBe('GitHub source repository metadata was not found.');

    expect(getWarningFromGitHubFetchResult({
      response: createJsonResponse({ message: 'Forbidden' }, { status: 403 }),
    }, 'repository tree')).toBe('GitHub source repository tree was forbidden by GitHub.');

    expect(getWarningFromGitHubFetchResult({
      response: createJsonResponse(
        { message: 'API rate limit exceeded' },
        {
          status: 403,
          headers: { 'x-ratelimit-remaining': '0' },
        },
      ),
    }, 'repository metadata')).toBe(
      'GitHub source fetch failed because the unauthenticated GitHub API rate limit appears to be exhausted.',
    );
  });
});
