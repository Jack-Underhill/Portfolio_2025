import { Buffer } from 'node:buffer';

import { vi } from 'vitest';

const encoder = new TextEncoder();

export const LARGE_REPO_URL = 'https://github.com/owner/repo';
export const LARGE_REPO_INCLUDED_TEXT = {
  'README.md': '# Repo notes\nThis README is usable source evidence.',
  'src/App.jsx': 'export function App() { return "usable source"; }',
};
export const LARGE_REPO_SKIPPED_PATH_COUNT = 26;

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

function createGitHubBlob(text) {
  const bytes = encoder.encode(text);

  return {
    encoding: 'base64',
    content: Buffer.from(bytes).toString('base64'),
    size: bytes.byteLength,
  };
}

export function createLargeRepoTreeEntries() {
  const skippedEntries = Array.from({ length: LARGE_REPO_SKIPPED_PATH_COUNT }, (_, index) => {
    const number = String(index + 1).padStart(2, '0');

    return index % 2 === 0
      ? { path: `dist/generated-${number}.min.js`, type: 'blob', sha: `cccccc${number}`, size: 128 }
      : { path: `screenshots/noisy-${number}.png`, type: 'blob', sha: `dddddd${number}`, size: 128 };
  });

  return [
    { path: 'README.md', type: 'blob', sha: 'aaaaaa', size: encoder.encode(LARGE_REPO_INCLUDED_TEXT['README.md']).byteLength },
    { path: 'src/App.jsx', type: 'blob', sha: 'bbbbbb', size: encoder.encode(LARGE_REPO_INCLUDED_TEXT['src/App.jsx']).byteLength },
    ...skippedEntries,
  ];
}

export function createLargeRepoFetchFixture() {
  const routes = {
    'https://api.github.com/repos/owner/repo': createJsonResponse({ default_branch: 'main' }),
    'https://api.github.com/repos/owner/repo/git/trees/main?recursive=1': createJsonResponse({
      tree: createLargeRepoTreeEntries(),
    }),
    'https://api.github.com/repos/owner/repo/git/blobs/aaaaaa': createJsonResponse(
      createGitHubBlob(LARGE_REPO_INCLUDED_TEXT['README.md']),
    ),
    'https://api.github.com/repos/owner/repo/git/blobs/bbbbbb': createJsonResponse(
      createGitHubBlob(LARGE_REPO_INCLUDED_TEXT['src/App.jsx']),
    ),
  };
  const fetchImpl = vi.fn(async (url) => {
    const route = routes[url];

    if (!route) throw new Error(`Unexpected fetch: ${url}`);
    return route;
  });

  return { fetchImpl };
}
