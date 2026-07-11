import {
  encodeSourcePathForUrl,
  isSafeRelativeSourcePath,
} from '../sourcePathUtils.js';

export const GITHUB_HOST = 'github.com';

const OWNER_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;
const REPO_PATTERN = /^[A-Za-z0-9._-]+$/;

export function cleanGitHubRepoUrlInput(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function decodePathSegment(segment) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return '';
  }
}

function getRepoLabel({ owner, repo }) {
  return `${owner}/${repo}`;
}

export function parseGitHubRepoUrl(value) {
  const input = cleanGitHubRepoUrlInput(value);

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

    if (!ref || !isSafeRelativeSourcePath(ref, { allowWindowsDrivePrefix: true })) {
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
      normalizedUrl: `https://${GITHUB_HOST}/${owner}/${repo}/tree/${encodeSourcePathForUrl(ref)}`,
    };
  }

  return {
    ok: false,
    warning: 'GitHub repository URL must point to a repository root or /tree/{branch-or-ref}.',
  };
}
