import {
  getDisallowedTextSourceReason,
  isSupportedTextSourceFileName,
  normalizeNamedTextSourceBytes,
} from './textSource.js';
import {
  PROJECT_AGENT_SOURCE_GITHUB_FILE_KIND,
  PROJECT_AGENT_SOURCE_GITHUB_REPO_KIND,
} from './sourceKinds.js';
import { PROJECT_AGENT_SOURCE_DEFAULT_MEDIA_TYPE } from './sourceMediaTypes.js';

export const PROJECT_AGENT_SOURCE_GITHUB_MAX_TREE_ENTRIES = 500;
export const PROJECT_AGENT_SOURCE_GITHUB_MAX_INCLUDED_FILES = 40;
export const PROJECT_AGENT_SOURCE_GITHUB_FILE_MAX_BYTES = 512 * 1024;
export const PROJECT_AGENT_SOURCE_GITHUB_TOTAL_FETCHED_BYTES = 5 * 1024 * 1024;
export const PROJECT_AGENT_SOURCE_GITHUB_TOTAL_TEXT_MAX_LENGTH = 80000;
export const PROJECT_AGENT_SOURCE_GITHUB_TIMEOUT_MS = 10000;

const GITHUB_HOST = 'github.com';
const GITHUB_API_HOST = 'api.github.com';
const GITHUB_API_BASE_URL = `https://${GITHUB_API_HOST}`;
const API_HEADERS = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'local-codex-project-agent',
};
const IGNORED_PATH_SEGMENTS = new Set([
  '.git',
  '.github',
  '.next',
  '.nuxt',
  '.cache',
  '.parcel-cache',
  '.turbo',
  '.venv',
  'venv',
  'env',
  'node_modules',
  'bower_components',
  'vendor',
  'dist',
  'build',
  'coverage',
  'out',
  'target',
  'bin',
  'obj',
  '__pycache__',
]);
const NOISY_FILENAMES = new Set([
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  'composer.lock',
  'poetry.lock',
  'cargo.lock',
  'go.sum',
]);
const GENERATED_PATH_PATTERNS = [
  /\.min\.(?:css|js)$/i,
  /\.bundle\.(?:css|js)$/i,
  /\.generated\./i,
];
const OWNER_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;
const REPO_PATTERN = /^[A-Za-z0-9._-]+$/;
const SHA_PATTERN = /^[a-f0-9]{6,64}$/i;

function createIdGetter({ createId, id }) {
  return typeof createId === 'function' ? createId : () => id;
}

function cleanInput(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function decodePathSegment(segment) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return '';
  }
}

function encodePathPart(part) {
  return encodeURIComponent(part);
}

function encodeRefForApi(ref) {
  return encodeURIComponent(ref);
}

function encodePathForUrl(path) {
  return String(path)
    .split('/')
    .map(encodePathPart)
    .join('/');
}

function isSafeGitHubPath(path) {
  if (typeof path !== 'string' || !path.trim()) return false;
  if (path.startsWith('/') || path.startsWith('\\') || path.includes('\\')) return false;

  return path
    .split('/')
    .every((part) => part && part !== '.' && part !== '..');
}

function getRepoLabel({ owner, repo }) {
  return `${owner}/${repo}`;
}

function getFileLabel({ repoLabel, path }) {
  return `${repoLabel} / ${path}`;
}

function getSourceUrl({ owner, repo, ref, path }) {
  return `https://${GITHUB_HOST}/${owner}/${repo}/blob/${encodeURIComponent(ref)}/${encodePathForUrl(path)}`;
}

function getSkippedRepoEntry({ id, label, warning, metadata = {} }) {
  return {
    item: null,
    manifest: {
      id,
      kind: PROJECT_AGENT_SOURCE_GITHUB_REPO_KIND,
      label,
      mediaType: PROJECT_AGENT_SOURCE_DEFAULT_MEDIA_TYPE,
      bytes: 0,
      included: false,
      warnings: [warning],
      ...metadata,
    },
  };
}

function getSkippedFileEntry({
  id,
  repoInfo,
  path,
  bytes = 0,
  warning,
  ignoredPathReason,
}) {
  const repoLabel = getRepoLabel(repoInfo);
  const metadata = {
    repo: repoLabel,
    owner: repoInfo.owner,
    ref: repoInfo.ref,
    path,
    sourceUrl: getSourceUrl({ ...repoInfo, path }),
  };

  if (ignoredPathReason) {
    metadata.ignoredPathReason = ignoredPathReason;
  }

  return {
    item: null,
    manifest: {
      id,
      kind: PROJECT_AGENT_SOURCE_GITHUB_FILE_KIND,
      label: getFileLabel({ repoLabel, path }),
      mediaType: PROJECT_AGENT_SOURCE_DEFAULT_MEDIA_TYPE,
      bytes,
      included: false,
      warnings: [warning],
      ...metadata,
    },
  };
}

function getRateLimitWarning(response) {
  const remaining = response?.headers?.get?.('x-ratelimit-remaining');

  return remaining === '0'
    ? 'GitHub source fetch failed because the unauthenticated GitHub API rate limit appears to be exhausted.'
    : '';
}

function getHttpWarning(response, action) {
  const rateLimitWarning = getRateLimitWarning(response);

  if (rateLimitWarning) return rateLimitWarning;
  if (response?.status === 404) return `GitHub source ${action} was not found.`;
  if (response?.status === 403) return `GitHub source ${action} was forbidden by GitHub.`;
  return `GitHub source ${action} failed with HTTP ${response?.status || 'error'}.`;
}

async function fetchGitHubJson(url, { fetchImpl, timeoutMs }) {
  if (typeof fetchImpl !== 'function') {
    return {
      ok: false,
      warning: 'GitHub source fetch is unavailable in this runtime.',
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, {
      headers: API_HEADERS,
      signal: controller.signal,
    });

    if (!response?.ok) {
      return { ok: false, response };
    }

    try {
      return { ok: true, data: await response.json() };
    } catch {
      return {
        ok: false,
        warning: 'GitHub source response could not be parsed as JSON.',
      };
    }
  } catch (error) {
    const aborted = error?.name === 'AbortError' || controller.signal.aborted;
    return {
      ok: false,
      warning: aborted
        ? `GitHub source fetch timed out after ${timeoutMs}ms.`
        : 'GitHub source fetch failed because the network request could not be completed.',
    };
  } finally {
    clearTimeout(timeout);
  }
}

function getWarningFromFetchResult(result, action) {
  return result.warning || getHttpWarning(result.response, action);
}

export function parseGitHubRepoUrl(value) {
  const input = cleanInput(value);

  if (!input) {
    return {
      ok: false,
      warning: 'GitHub repository URL is empty.',
    };
  }

  let parsed;

  try {
    parsed = new URL(input);
  } catch {
    return {
      ok: false,
      warning: 'GitHub repository URL must be a valid https://github.com/{owner}/{repo} URL.',
    };
  }

  if ((parsed.protocol !== 'https:' && parsed.protocol !== 'http:') || parsed.hostname.toLowerCase() !== GITHUB_HOST) {
    return {
      ok: false,
      warning: 'GitHub repository URL must use the github.com host.',
    };
  }

  const parts = parsed.pathname.split('/').filter(Boolean).map(decodePathSegment);
  const [owner, rawRepo, route] = parts;
  const repo = rawRepo?.endsWith('.git') ? rawRepo.slice(0, -4) : rawRepo;

  if (!OWNER_PATTERN.test(owner || '') || !REPO_PATTERN.test(repo || '')) {
    return {
      ok: false,
      warning: 'GitHub repository URL must include a valid owner and repository name.',
    };
  }

  if (parts.length === 2) {
    return {
      ok: true,
      owner,
      repo,
      repoLabel: getRepoLabel({ owner, repo }),
      ref: '',
      normalizedUrl: `https://${GITHUB_HOST}/${owner}/${repo}`,
    };
  }

  if (parts.length >= 4 && route === 'tree') {
    const ref = parts.slice(3).join('/').trim();

    if (!ref || !isSafeGitHubPath(ref)) {
      return {
        ok: false,
        warning: 'GitHub repository tree URL must include a valid branch or ref.',
      };
    }

    return {
      ok: true,
      owner,
      repo,
      repoLabel: getRepoLabel({ owner, repo }),
      ref,
      normalizedUrl: `https://${GITHUB_HOST}/${owner}/${repo}/tree/${encodePathForUrl(ref)}`,
    };
  }

  return {
    ok: false,
    warning: 'GitHub repository URL must point to a repository root or /tree/{branch-or-ref}.',
  };
}

function getPathIgnoreReason(path) {
  if (!isSafeGitHubPath(path)) return 'unsafe path';

  const parts = path.split('/');
  const ignoredSegment = parts.find((part) => IGNORED_PATH_SEGMENTS.has(part.toLowerCase()));

  if (ignoredSegment) return `ignored path segment "${ignoredSegment}"`;

  const baseName = parts.at(-1).toLowerCase();

  if (NOISY_FILENAMES.has(baseName)) return `noisy generated file "${baseName}"`;
  if (GENERATED_PATH_PATTERNS.some((pattern) => pattern.test(baseName))) {
    return `generated or minified file "${baseName}"`;
  }

  return '';
}

function getSortedBlobEntries(tree) {
  return Array.isArray(tree)
    ? tree
      .filter((entry) => entry?.type === 'blob')
      .slice()
      .sort((left, right) => String(left.path || '').localeCompare(String(right.path || '')))
    : [];
}

function normalizeGitHubBlobContent(blob) {
  if (blob?.encoding !== 'base64' || typeof blob?.content !== 'string') {
    return null;
  }

  return Buffer.from(blob.content.replace(/\s/g, ''), 'base64');
}

function withRepoMetadata(result, repoInfo, path) {
  const repoLabel = getRepoLabel(repoInfo);
  const metadata = {
    repo: repoLabel,
    owner: repoInfo.owner,
    ref: repoInfo.ref,
    path,
    sourceUrl: getSourceUrl({ ...repoInfo, path }),
  };

  return {
    item: result.item ? { ...result.item, ...metadata } : null,
    manifest: {
      ...result.manifest,
      ...metadata,
    },
  };
}

function applyGitHubTextLimit(result, counters, maxTotalTextLength) {
  if (!result.item) return { result, warnings: [] };

  const remainingLength = maxTotalTextLength - counters.totalSourceTextLength;

  if (remainingLength <= 0) {
    const warning = `Skipped GitHub source file "${result.item.label}" because the ${maxTotalTextLength} character GitHub source text limit was reached.`;

    return {
      result: {
        item: null,
        manifest: {
          ...result.manifest,
          included: false,
          warnings: [...result.manifest.warnings, warning],
        },
      },
      warnings: [warning],
    };
  }

  if (result.item.text.length <= remainingLength) {
    counters.totalSourceTextLength += result.item.text.length;
    return { result, warnings: [] };
  }

  const warning = `Truncated GitHub source file "${result.item.label}" to fit the ${maxTotalTextLength} character GitHub source text limit.`;
  const text = result.item.text.slice(0, remainingLength).trimEnd();

  counters.totalSourceTextLength += text.length;

  return {
    result: {
      item: { ...result.item, text },
      manifest: {
        ...result.manifest,
        warnings: [...result.manifest.warnings, warning],
      },
    },
    warnings: [warning],
  };
}

async function normalizeTreeEntry({
  entry,
  repoInfo,
  nextId,
  fetchImpl,
  limits,
  counters,
}) {
  const id = nextId();
  const path = typeof entry?.path === 'string' ? entry.path : '';
  const bytes = Number.isFinite(entry?.size) && entry.size >= 0 ? entry.size : 0;
  const ignoreReason = getPathIgnoreReason(path);

  if (ignoreReason) {
    const warning = `Skipped ignored GitHub path "${getFileLabel({ repoLabel: getRepoLabel(repoInfo), path })}" because it has an ${ignoreReason}.`;
    return {
      entry: getSkippedFileEntry({
        id,
        repoInfo,
        path: path || 'unknown path',
        bytes,
        warning,
        ignoredPathReason: ignoreReason,
      }),
      warnings: [warning],
    };
  }

  if (bytes > limits.maxFileBytes) {
    const warning = `Skipped oversized GitHub source file "${getFileLabel({ repoLabel: getRepoLabel(repoInfo), path })}" because it exceeds the ${limits.maxFileBytes} byte limit.`;
    return {
      entry: getSkippedFileEntry({ id, repoInfo, path, bytes, warning }),
      warnings: [warning],
    };
  }

  const repoLabel = getRepoLabel(repoInfo);
  const label = getFileLabel({ repoLabel, path });
  const disallowedReason = getDisallowedTextSourceReason(label);

  if (disallowedReason) {
    const warning = `Skipped disallowed GitHub source file "${label}" because it has a ${disallowedReason}.`;
    return {
      entry: getSkippedFileEntry({ id, repoInfo, path, bytes, warning }),
      warnings: [warning],
    };
  }

  if (!isSupportedTextSourceFileName(label)) {
    const warning = `Skipped unsupported GitHub source file "${label}".`;
    return {
      entry: getSkippedFileEntry({ id, repoInfo, path, bytes, warning }),
      warnings: [warning],
    };
  }

  if (counters.includedFileCount >= limits.maxIncludedFiles) {
    const warning = `Skipped GitHub source file "${label}" because the ${limits.maxIncludedFiles} included file limit was reached.`;
    return {
      entry: getSkippedFileEntry({ id, repoInfo, path, bytes, warning }),
      warnings: [warning],
    };
  }

  if (bytes > 0 && counters.totalFetchedBytes + bytes > limits.maxTotalFetchedBytes) {
    const warning = `Skipped GitHub source file "${label}" because the ${limits.maxTotalFetchedBytes} byte total fetched limit was reached.`;
    return {
      entry: getSkippedFileEntry({ id, repoInfo, path, bytes, warning }),
      warnings: [warning],
    };
  }

  const blobSha = typeof entry?.sha === 'string' ? entry.sha : '';
  const blobUrl = SHA_PATTERN.test(blobSha)
    ? `${GITHUB_API_BASE_URL}/repos/${repoInfo.owner}/${repoInfo.repo}/git/blobs/${blobSha}`
    : '';
  let content;

  if (!blobUrl) {
    const warning = `Skipped GitHub source file "${label}" because the file metadata is missing a valid blob SHA.`;
    return {
      entry: getSkippedFileEntry({ id, repoInfo, path, bytes, warning }),
      warnings: [warning],
    };
  }

  const blobResult = await fetchGitHubJson(blobUrl, {
    fetchImpl,
    timeoutMs: limits.timeoutMs,
  });

  if (!blobResult.ok) {
    const warning = getWarningFromFetchResult(blobResult, `file "${path}"`);
    return {
      entry: getSkippedFileEntry({ id, repoInfo, path, bytes, warning }),
      warnings: [warning],
    };
  }

  content = normalizeGitHubBlobContent(blobResult.data);

  if (!content) {
    const warning = `Skipped GitHub source file "${label}" because the blob content is not base64 encoded.`;
    return {
      entry: getSkippedFileEntry({ id, repoInfo, path, bytes, warning }),
      warnings: [warning],
    };
  }

  if (content.byteLength > limits.maxFileBytes) {
    const warning = `Skipped oversized GitHub source file "${label}" because it exceeds the ${limits.maxFileBytes} byte limit.`;
    return {
      entry: getSkippedFileEntry({
        id,
        repoInfo,
        path,
        bytes: content.byteLength,
        warning,
      }),
      warnings: [warning],
    };
  }

  if (counters.totalFetchedBytes + content.byteLength > limits.maxTotalFetchedBytes) {
    const warning = `Skipped GitHub source file "${label}" because the ${limits.maxTotalFetchedBytes} byte total fetched limit was reached.`;
    return {
      entry: getSkippedFileEntry({
        id,
        repoInfo,
        path,
        bytes: content.byteLength,
        warning,
      }),
      warnings: [warning],
    };
  }

  counters.totalFetchedBytes += content.byteLength;
  const normalizeResult = await normalizeNamedTextSourceBytes({
    id,
    kind: PROJECT_AGENT_SOURCE_GITHUB_FILE_KIND,
    label,
    bytes: content.byteLength,
    maxBytes: limits.maxFileBytes,
    readBytes: async () => content,
  });
  const result = withRepoMetadata(normalizeResult, repoInfo, path);

  if (result.item) counters.includedFileCount += 1;

  const limited = applyGitHubTextLimit(result, counters, limits.maxTotalSourceTextLength);

  return {
    entry: limited.result,
    warnings: [...normalizeResult.warnings, ...limited.warnings],
  };
}

export async function normalizeGitHubRepoSource(githubRepoUrl, {
  id,
  createId,
  fetchImpl = globalThis.fetch,
  maxTreeEntries = PROJECT_AGENT_SOURCE_GITHUB_MAX_TREE_ENTRIES,
  maxIncludedFiles = PROJECT_AGENT_SOURCE_GITHUB_MAX_INCLUDED_FILES,
  maxFileBytes = PROJECT_AGENT_SOURCE_GITHUB_FILE_MAX_BYTES,
  maxTotalFetchedBytes = PROJECT_AGENT_SOURCE_GITHUB_TOTAL_FETCHED_BYTES,
  maxTotalSourceTextLength = PROJECT_AGENT_SOURCE_GITHUB_TOTAL_TEXT_MAX_LENGTH,
  timeoutMs = PROJECT_AGENT_SOURCE_GITHUB_TIMEOUT_MS,
} = {}) {
  const entries = [];
  const warnings = [];
  const nextId = createIdGetter({ createId, id });
  const parsed = parseGitHubRepoUrl(githubRepoUrl);

  if (!cleanInput(githubRepoUrl)) {
    return { entries, warnings };
  }

  if (!parsed.ok) {
    const warning = parsed.warning;
    entries.push(getSkippedRepoEntry({
      id: nextId(),
      label: cleanInput(githubRepoUrl),
      warning,
    }));
    warnings.push(warning);
    return { entries, warnings };
  }

  const metadataUrl = `${GITHUB_API_BASE_URL}/repos/${parsed.owner}/${parsed.repo}`;
  const metadataResult = await fetchGitHubJson(metadataUrl, { fetchImpl, timeoutMs });

  if (!metadataResult.ok) {
    const warning = getWarningFromFetchResult(metadataResult, 'repository metadata');
    entries.push(getSkippedRepoEntry({
      id: nextId(),
      label: parsed.repoLabel,
      warning,
      metadata: {
        repo: parsed.repoLabel,
        owner: parsed.owner,
        ref: parsed.ref || '',
      },
    }));
    warnings.push(warning);
    return { entries, warnings };
  }

  const ref = parsed.ref || metadataResult.data?.default_branch || '';

  if (!ref) {
    const warning = `GitHub repository "${parsed.repoLabel}" did not provide a default branch.`;
    entries.push(getSkippedRepoEntry({
      id: nextId(),
      label: parsed.repoLabel,
      warning,
      metadata: {
        repo: parsed.repoLabel,
        owner: parsed.owner,
        ref,
      },
    }));
    warnings.push(warning);
    return { entries, warnings };
  }

  const repoInfo = {
    owner: parsed.owner,
    repo: parsed.repo,
    ref,
  };
  const treeUrl = `${GITHUB_API_BASE_URL}/repos/${parsed.owner}/${parsed.repo}/git/trees/${encodeRefForApi(ref)}?recursive=1`;
  const treeResult = await fetchGitHubJson(treeUrl, { fetchImpl, timeoutMs });

  if (!treeResult.ok) {
    const warning = parsed.ref
      ? `GitHub repository ref "${parsed.ref}" could not be resolved.`
      : getWarningFromFetchResult(treeResult, 'repository tree');
    entries.push(getSkippedRepoEntry({
      id: nextId(),
      label: parsed.repoLabel,
      warning,
      metadata: {
        repo: parsed.repoLabel,
        owner: parsed.owner,
        ref,
      },
    }));
    warnings.push(warning);
    return { entries, warnings };
  }

  const blobEntries = getSortedBlobEntries(treeResult.data?.tree);
  const counters = {
    includedFileCount: 0,
    totalFetchedBytes: 0,
    totalSourceTextLength: 0,
  };
  const limits = {
    maxTreeEntries,
    maxIncludedFiles,
    maxFileBytes,
    maxTotalFetchedBytes,
    maxTotalSourceTextLength,
    timeoutMs,
  };

  if (treeResult.data?.truncated) {
    warnings.push(`GitHub repository "${parsed.repoLabel}" tree was truncated by GitHub before all files could be inspected.`);
  }

  if (blobEntries.length > maxTreeEntries) {
    warnings.push(`GitHub repository "${parsed.repoLabel}" has ${blobEntries.length} file entries; only the first ${maxTreeEntries} entries were inspected.`);
  }

  for (const entry of blobEntries.slice(0, maxTreeEntries)) {
    const result = await normalizeTreeEntry({
      entry,
      repoInfo,
      nextId,
      fetchImpl,
      limits,
      counters,
    });

    entries.push(result.entry);
    warnings.push(...result.warnings);
  }

  if (entries.length === 0) {
    const warning = `GitHub repository "${parsed.repoLabel}" did not contain supported source files.`;
    entries.push(getSkippedRepoEntry({
      id: nextId(),
      label: parsed.repoLabel,
      warning,
      metadata: {
        repo: parsed.repoLabel,
        owner: parsed.owner,
        ref,
      },
    }));
    warnings.push(warning);
  }

  return { entries, warnings };
}
