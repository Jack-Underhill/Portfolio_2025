import {
  fetchGitHubJson,
  getGitHubRepositoryMetadataUrl,
  getGitHubRepositoryTreeUrl,
  getWarningFromGitHubFetchResult,
} from './github/githubApiClient.js';
import { normalizeGitHubTreeEntry } from './github/githubFileNormalizer.js';
import {
  PROJECT_AGENT_SOURCE_GITHUB_FILE_MAX_BYTES,
  PROJECT_AGENT_SOURCE_GITHUB_MAX_INCLUDED_FILES,
  PROJECT_AGENT_SOURCE_GITHUB_MAX_TREE_ENTRIES,
  PROJECT_AGENT_SOURCE_GITHUB_TIMEOUT_MS,
  PROJECT_AGENT_SOURCE_GITHUB_TOTAL_FETCHED_BYTES,
  PROJECT_AGENT_SOURCE_GITHUB_TOTAL_TEXT_MAX_LENGTH,
} from './github/githubLimits.js';
import {
  getGitHubTreeWarnings,
  getSortedGitHubBlobEntries,
} from './github/githubTree.js';
import {
  getSkippedGitHubRepoEntry,
} from './github/githubManifest.js';
import {
  cleanGitHubRepoUrlInput,
  parseGitHubRepoUrl,
} from './github/githubUrl.js';

export {
  PROJECT_AGENT_SOURCE_GITHUB_FILE_MAX_BYTES,
  PROJECT_AGENT_SOURCE_GITHUB_MAX_INCLUDED_FILES,
  PROJECT_AGENT_SOURCE_GITHUB_MAX_TREE_ENTRIES,
  PROJECT_AGENT_SOURCE_GITHUB_TIMEOUT_MS,
  PROJECT_AGENT_SOURCE_GITHUB_TOTAL_FETCHED_BYTES,
  PROJECT_AGENT_SOURCE_GITHUB_TOTAL_TEXT_MAX_LENGTH,
} from './github/githubLimits.js';
export { parseGitHubRepoUrl } from './github/githubUrl.js';

function createIdGetter({ createId, id }) {
  return typeof createId === 'function' ? createId : () => id;
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

  if (!cleanGitHubRepoUrlInput(githubRepoUrl)) {
    return { entries, warnings };
  }

  if (!parsed.ok) {
    const warning = parsed.warning;
    entries.push(getSkippedGitHubRepoEntry({
      id: nextId(),
      label: cleanGitHubRepoUrlInput(githubRepoUrl),
      warning,
    }));
    warnings.push(warning);
    return { entries, warnings };
  }

  const metadataUrl = getGitHubRepositoryMetadataUrl(parsed);
  const metadataResult = await fetchGitHubJson(metadataUrl, { fetchImpl, timeoutMs });

  if (!metadataResult.ok) {
    const warning = getWarningFromGitHubFetchResult(metadataResult, 'repository metadata');
    entries.push(getSkippedGitHubRepoEntry({
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
    entries.push(getSkippedGitHubRepoEntry({
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
  const treeUrl = getGitHubRepositoryTreeUrl(repoInfo);
  const treeResult = await fetchGitHubJson(treeUrl, { fetchImpl, timeoutMs });

  if (!treeResult.ok) {
    const warning = parsed.ref
      ? `GitHub repository ref "${parsed.ref}" could not be resolved.`
      : getWarningFromGitHubFetchResult(treeResult, 'repository tree');
    entries.push(getSkippedGitHubRepoEntry({
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

  const blobEntries = getSortedGitHubBlobEntries(treeResult.data?.tree);
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

  warnings.push(...getGitHubTreeWarnings({
    repoLabel: parsed.repoLabel,
    treeResult,
    blobEntries,
    maxTreeEntries,
  }));

  for (const entry of blobEntries.slice(0, maxTreeEntries)) {
    const result = await normalizeGitHubTreeEntry({
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
    entries.push(getSkippedGitHubRepoEntry({
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
