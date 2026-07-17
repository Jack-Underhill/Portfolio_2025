import { Buffer } from 'node:buffer';

import { describe, expect, it, vi } from 'vitest';

import {
  normalizeGitHubRepoSource,
  parseGitHubRepoUrl,
  PROJECT_AGENT_SOURCE_GITHUB_FILE_MAX_BYTES,
  PROJECT_AGENT_SOURCE_GITHUB_TOTAL_TEXT_MAX_LENGTH,
} from '../../../../../server/admin/agent/sourceIngestion/githubSource.js';
import {
  createLargeRepoFetchFixture,
  LARGE_REPO_INCLUDED_TEXT,
  LARGE_REPO_SKIPPED_PATH_COUNT,
  LARGE_REPO_URL,
} from './githubLargeRepoFixture.js';

const encoder = new TextEncoder();

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

function createBlob(text) {
  const bytes = encoder.encode(text);

  return {
    encoding: 'base64',
    content: Buffer.from(bytes).toString('base64'),
    size: bytes.byteLength,
  };
}

function createRouteFetch(routes) {
  return vi.fn(async (url) => {
    const route = routes[url];

    if (route instanceof Error) throw route;
    if (!route) throw new Error(`Unexpected fetch: ${url}`);
    if (typeof route === 'function') return route(url);
    return route;
  });
}

function getFetchedUrls(fetchImpl) {
  return fetchImpl.mock.calls.map(([url]) => url);
}

describe('project agent GitHub source ingestion', () => {
  it('parses only supported public GitHub repository URL shapes', () => {
    expect(parseGitHubRepoUrl('https://github.com/openai/codex')).toEqual({
      ok: true,
      owner: 'openai',
      repo: 'codex',
      repoLabel: 'openai/codex',
      ref: '',
      normalizedUrl: 'https://github.com/openai/codex',
    });
    expect(parseGitHubRepoUrl('http://github.com/openai/codex.git')).toEqual(expect.objectContaining({
      ok: true,
      owner: 'openai',
      repo: 'codex',
      normalizedUrl: 'https://github.com/openai/codex',
    }));
    expect(parseGitHubRepoUrl('https://github.com/openai/codex/tree/feature/source-ingestion')).toEqual(expect.objectContaining({
      ok: true,
      ref: 'feature/source-ingestion',
      normalizedUrl: 'https://github.com/openai/codex/tree/feature/source-ingestion',
    }));

    expect(parseGitHubRepoUrl('https://gist.github.com/openai/codex').ok).toBe(false);
    expect(parseGitHubRepoUrl('https://github.com/openai/codex/pull/1').ok).toBe(false);
    expect(parseGitHubRepoUrl('git@github.com:openai/codex.git').ok).toBe(false);
    expect(parseGitHubRepoUrl('https://raw.githubusercontent.com/openai/codex/main/README.md').ok).toBe(false);
  });

  it('fetches metadata, tree, and supported file blobs while filtering paths before content fetch', async () => {
    const fetchImpl = createRouteFetch({
      'https://api.github.com/repos/owner/repo': createJsonResponse({ default_branch: 'main' }),
      'https://api.github.com/repos/owner/repo/git/trees/main?recursive=1': createJsonResponse({
        tree: [
          { path: 'src/App.jsx', type: 'blob', sha: 'aaaaaa', size: 26 },
          { path: 'README', type: 'blob', sha: 'bbbbbb', size: 19 },
          { path: 'image.png', type: 'blob', sha: 'cccccc', size: 8 },
          { path: 'node_modules/pkg/index.js', type: 'blob', sha: 'dddddd', size: 25 },
          { path: '.env.local', type: 'blob', sha: 'eeeeee', size: 12 },
          { path: 'dist/app.min.js', type: 'blob', sha: 'ffffff', size: 16 },
        ],
      }),
      'https://api.github.com/repos/owner/repo/git/blobs/aaaaaa': createJsonResponse(createBlob('export function App() {}')),
      'https://api.github.com/repos/owner/repo/git/blobs/bbbbbb': createJsonResponse(createBlob('Repo overview')),
    });

    const result = await normalizeGitHubRepoSource('https://github.com/owner/repo', {
      id: 'source-1',
      createId: vi.fn()
        .mockReturnValueOnce('source-1')
        .mockReturnValueOnce('source-2')
        .mockReturnValueOnce('source-3')
        .mockReturnValueOnce('source-4')
        .mockReturnValueOnce('source-5')
        .mockReturnValueOnce('source-6'),
      fetchImpl,
    });

    expect(getFetchedUrls(fetchImpl)).toEqual([
      'https://api.github.com/repos/owner/repo',
      'https://api.github.com/repos/owner/repo/git/trees/main?recursive=1',
      'https://api.github.com/repos/owner/repo/git/blobs/bbbbbb',
      'https://api.github.com/repos/owner/repo/git/blobs/aaaaaa',
    ]);
    expect(result.entries.map((entry) => entry.manifest.label)).toEqual([
      'owner/repo / README',
      'owner/repo / src/App.jsx',
      'owner/repo / .env.local',
      'owner/repo / image.png',
      'owner/repo / dist/app.min.js',
      'owner/repo / node_modules/pkg/index.js',
    ]);
    expect(result.entries.filter((entry) => entry.item).map((entry) => entry.item.label)).toEqual([
      'owner/repo / README',
      'owner/repo / src/App.jsx',
    ]);
    expect(result.entries.find((entry) => entry.manifest.path === 'README').manifest).toEqual(expect.objectContaining({
      id: 'source-1',
      kind: 'github-file',
      repo: 'owner/repo',
      owner: 'owner',
      ref: 'main',
      path: 'README',
      sourceUrl: 'https://github.com/owner/repo/blob/main/README',
      included: true,
      warnings: [],
    }));
    result.entries.forEach((entry) => {
      expect(entry.manifest).not.toHaveProperty('text');
    });
    expect(result.warnings).toEqual(expect.arrayContaining([
      expect.stringContaining('Skipped 1 GitHub source file(s) from "owner/repo" due to disallowed files'),
      expect.stringContaining('Skipped 1 GitHub source file(s) from "owner/repo" due to ignored/generated paths'),
      expect.stringContaining('Skipped 1 GitHub source file(s) from "owner/repo" due to unsupported file types'),
    ]));
    expect(result.warnings).toHaveLength(4);
  });

  it('uses tree URL refs and reports unresolved refs without throwing', async () => {
    const fetchImpl = createRouteFetch({
      'https://api.github.com/repos/owner/repo': createJsonResponse({ default_branch: 'main' }),
      'https://api.github.com/repos/owner/repo/git/trees/feature%2Fbranch?recursive=1': createJsonResponse(
        { message: 'Not Found' },
        { status: 404 },
      ),
    });

    const result = await normalizeGitHubRepoSource('https://github.com/owner/repo/tree/feature/branch', {
      id: 'source-1',
      fetchImpl,
    });

    expect(getFetchedUrls(fetchImpl)).toEqual([
      'https://api.github.com/repos/owner/repo',
      'https://api.github.com/repos/owner/repo/git/trees/feature%2Fbranch?recursive=1',
    ]);
    expect(result.entries).toEqual([
      {
        item: null,
        manifest: expect.objectContaining({
          id: 'source-1',
          kind: 'github-repo',
          label: 'owner/repo',
          included: false,
          ref: 'feature/branch',
          warnings: ['GitHub repository ref "feature/branch" could not be resolved.'],
        }),
      },
    ]);
    expect(result.warnings).toEqual(['GitHub repository ref "feature/branch" could not be resolved.']);
  });

  it('enforces tree, included file, per-file byte, fetched byte, and text handoff limits', async () => {
    const fetchImpl = createRouteFetch({
      'https://api.github.com/repos/owner/repo': createJsonResponse({ default_branch: 'main' }),
      'https://api.github.com/repos/owner/repo/git/trees/main?recursive=1': createJsonResponse({
        tree: [
          { path: 'a.md', type: 'blob', sha: 'aaaaaa', size: 5 },
          { path: 'b.md', type: 'blob', sha: 'bbbbbb', size: 5 },
          { path: 'c.md', type: 'blob', sha: 'cccccc', size: 99 },
          { path: 'd.md', type: 'blob', sha: 'dddddd', size: 5 },
        ],
      }),
      'https://api.github.com/repos/owner/repo/git/blobs/aaaaaa': createJsonResponse(createBlob('123456789')),
    });

    const result = await normalizeGitHubRepoSource('https://github.com/owner/repo', {
      id: 'source-1',
      createId: vi.fn()
        .mockReturnValueOnce('source-1')
        .mockReturnValueOnce('source-2')
        .mockReturnValueOnce('source-3'),
      fetchImpl,
      maxTreeEntries: 3,
      maxIncludedFiles: 1,
      maxFileBytes: 10,
      maxTotalFetchedBytes: 20,
      maxTotalSourceTextLength: 5,
    });

    expect(getFetchedUrls(fetchImpl)).toEqual([
      'https://api.github.com/repos/owner/repo',
      'https://api.github.com/repos/owner/repo/git/trees/main?recursive=1',
      'https://api.github.com/repos/owner/repo/git/blobs/aaaaaa',
    ]);
    expect(result.entries[0].item.text).toBe('12345');
    expect(result.entries[0].manifest.warnings).toEqual([
      'Truncated GitHub source file "owner/repo / a.md" to fit the 5 character GitHub source text limit.',
    ]);
    expect(result.entries[1].manifest.warnings).toEqual([
      'Skipped GitHub source file "owner/repo / b.md" because the 1 included file limit was reached.',
    ]);
    expect(result.entries[2].manifest.warnings).toEqual([
      'Skipped oversized GitHub source file "owner/repo / c.md" because it exceeds the 10 byte limit.',
    ]);
    expect(result.warnings).toEqual(expect.arrayContaining([
      'GitHub repository "owner/repo" has 4 file entries; only the first 3 entries were inspected.',
      'Truncated GitHub source file "owner/repo / a.md" to fit the 5 character GitHub source text limit.',
      'Skipped 1 GitHub source file(s) from "owner/repo" due to included file limit. Examples: owner/repo / b.md.',
      'Skipped 1 GitHub source file(s) from "owner/repo" due to oversized files. Examples: owner/repo / c.md.',
    ]));
  });

  it('enforces the total fetched byte limit before blob fetch when tree sizes are known', async () => {
    const fetchImpl = createRouteFetch({
      'https://api.github.com/repos/owner/repo': createJsonResponse({ default_branch: 'main' }),
      'https://api.github.com/repos/owner/repo/git/trees/main?recursive=1': createJsonResponse({
        tree: [
          { path: 'a.md', type: 'blob', sha: 'aaaaaa', size: 4 },
          { path: 'b.md', type: 'blob', sha: 'bbbbbb', size: 4 },
        ],
      }),
      'https://api.github.com/repos/owner/repo/git/blobs/aaaaaa': createJsonResponse(createBlob('1234')),
    });

    const result = await normalizeGitHubRepoSource('https://github.com/owner/repo', {
      id: 'source-1',
      createId: vi.fn()
        .mockReturnValueOnce('source-1')
        .mockReturnValueOnce('source-2'),
      fetchImpl,
      maxTotalFetchedBytes: 6,
    });

    expect(getFetchedUrls(fetchImpl)).toEqual([
      'https://api.github.com/repos/owner/repo',
      'https://api.github.com/repos/owner/repo/git/trees/main?recursive=1',
      'https://api.github.com/repos/owner/repo/git/blobs/aaaaaa',
    ]);
    expect(result.entries[1].manifest.warnings).toEqual([
      'Skipped GitHub source file "owner/repo / b.md" because the 6 byte total fetched limit was reached.',
    ]);
  });

  it('returns metadata-only skipped manifests for unsupported URLs and GitHub API failures', async () => {
    const unsupported = await normalizeGitHubRepoSource('https://github.com/owner/repo/issues/1', {
      id: 'source-1',
      fetchImpl: vi.fn(),
    });

    expect(unsupported.entries).toEqual([
      {
        item: null,
        manifest: expect.objectContaining({
          id: 'source-1',
          kind: 'github-repo',
          label: 'https://github.com/owner/repo/issues/1',
          included: false,
          warnings: ['GitHub repository URL must point to a repository root or /tree/{branch-or-ref}.'],
        }),
      },
    ]);

    const rateLimitedFetch = createRouteFetch({
      'https://api.github.com/repos/owner/repo': createJsonResponse(
        { message: 'API rate limit exceeded' },
        {
          status: 403,
          headers: { 'x-ratelimit-remaining': '0' },
        },
      ),
    });
    const rateLimited = await normalizeGitHubRepoSource('https://github.com/owner/repo', {
      id: 'source-1',
      fetchImpl: rateLimitedFetch,
    });

    expect(rateLimited.entries[0].manifest).toEqual(expect.objectContaining({
      kind: 'github-repo',
      included: false,
      warnings: [
        'GitHub source fetch failed because the unauthenticated GitHub API rate limit appears to be exhausted.',
      ],
    }));
    expect(rateLimited.warnings).toEqual([
      'GitHub source fetch failed because the unauthenticated GitHub API rate limit appears to be exhausted.',
    ]);
  });

  it('skips blob network failures without leaking raw source text into manifests', async () => {
    const fetchImpl = createRouteFetch({
      'https://api.github.com/repos/owner/repo': createJsonResponse({ default_branch: 'main' }),
      'https://api.github.com/repos/owner/repo/git/trees/main?recursive=1': createJsonResponse({
        tree: [
          { path: 'a.md', type: 'blob', sha: 'aaaaaa', size: 8 },
          { path: 'b.md', type: 'blob', sha: 'bbbbbb', size: 8 },
        ],
      }),
      'https://api.github.com/repos/owner/repo/git/blobs/aaaaaa': createJsonResponse(createBlob('kept text')),
      'https://api.github.com/repos/owner/repo/git/blobs/bbbbbb': createJsonResponse(
        { message: 'API rate limit exceeded' },
        {
          status: 403,
          headers: { 'x-ratelimit-remaining': '0' },
        },
      ),
    });

    const result = await normalizeGitHubRepoSource('https://github.com/owner/repo', {
      id: 'source-1',
      createId: vi.fn()
        .mockReturnValueOnce('source-1')
        .mockReturnValueOnce('source-2'),
      fetchImpl,
    });

    expect(result.entries[0].item.text).toBe('kept text');
    expect(result.entries[1].manifest).toEqual(expect.objectContaining({
      label: 'owner/repo / b.md',
      included: false,
      warnings: [
        'GitHub source fetch failed because the unauthenticated GitHub API rate limit appears to be exhausted.',
      ],
    }));
    result.entries.forEach((entry) => {
      expect(entry.manifest).not.toHaveProperty('text');
    });
  });

  it('keeps large repo warnings concise while preserving usable high-signal files', async () => {
    const { fetchImpl } = createLargeRepoFetchFixture();
    let nextSourceNumber = 1;

    const result = await normalizeGitHubRepoSource(LARGE_REPO_URL, {
      id: 'source-1',
      createId: () => `source-${nextSourceNumber++}`,
      fetchImpl,
    });

    const includedPaths = result.entries.filter((entry) => entry.item).map((entry) => entry.item.path);

    expect(includedPaths).toHaveLength(2);
    expect(includedPaths).toEqual(expect.arrayContaining([
      'README.md',
      'src/App.jsx',
    ]));
    expect(result.entries.filter((entry) => !entry.item)).toHaveLength(LARGE_REPO_SKIPPED_PATH_COUNT);
    expect(result.warnings).toHaveLength(2);
    expect(result.warnings.length).toBeLessThanOrEqual(25);
    expect(result.warnings).toEqual(expect.arrayContaining([
      expect.stringContaining('Skipped 13 GitHub source file(s) from "owner/repo" due to ignored/generated paths'),
      expect.stringContaining('Skipped 13 GitHub source file(s) from "owner/repo" due to unsupported file types'),
    ]));
    expect(result.entries.find((entry) => entry.manifest.path === 'dist/generated-01.min.js').manifest.warnings).toEqual([
      'Skipped ignored GitHub path "owner/repo / dist/generated-01.min.js" because it has an ignored path segment "dist".',
    ]);
    expect(result.entries.find((entry) => entry.manifest.path === 'screenshots/noisy-02.png').manifest.warnings).toEqual([
      'Skipped unsupported GitHub source file "owner/repo / screenshots/noisy-02.png".',
    ]);
    const fetchedUrls = fetchImpl.mock.calls.map(([url]) => url);

    expect(fetchedUrls.slice(0, 2)).toEqual([
      'https://api.github.com/repos/owner/repo',
      'https://api.github.com/repos/owner/repo/git/trees/main?recursive=1',
    ]);
    expect(fetchedUrls.slice(2)).toEqual(expect.arrayContaining([
      'https://api.github.com/repos/owner/repo/git/blobs/aaaaaa',
      'https://api.github.com/repos/owner/repo/git/blobs/bbbbbb',
    ]));
    expect(JSON.stringify(result.entries.map((entry) => entry.manifest))).not.toContain(
      LARGE_REPO_INCLUDED_TEXT['README.md'],
    );
  });

  it('uses conservative default GitHub limits', () => {
    expect(PROJECT_AGENT_SOURCE_GITHUB_FILE_MAX_BYTES).toBe(512 * 1024);
    expect(PROJECT_AGENT_SOURCE_GITHUB_TOTAL_TEXT_MAX_LENGTH).toBe(80000);
  });
});
