export const GITHUB_API_HOST = 'api.github.com';
export const GITHUB_API_BASE_URL = `https://${GITHUB_API_HOST}`;

const API_HEADERS = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'local-codex-project-agent',
};

export function encodeGitHubRefForApi(ref) {
  return encodeURIComponent(ref);
}

export function getGitHubRepositoryMetadataUrl({ owner, repo }) {
  return `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}`;
}

export function getGitHubRepositoryTreeUrl({ owner, repo, ref }) {
  return `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/git/trees/${encodeGitHubRefForApi(ref)}?recursive=1`;
}

export function getGitHubBlobUrl({ owner, repo, sha }) {
  return `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/git/blobs/${sha}`;
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

export async function fetchGitHubJson(url, { fetchImpl, timeoutMs }) {
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

export function getWarningFromGitHubFetchResult(result, action) {
  return result.warning || getHttpWarning(result.response, action);
}
