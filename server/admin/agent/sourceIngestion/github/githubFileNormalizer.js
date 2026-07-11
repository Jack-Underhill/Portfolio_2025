import { normalizeNamedTextSourceBytes } from '../textSource.js';
import { PROJECT_AGENT_SOURCE_GITHUB_FILE_KIND } from '../sourceKinds.js';
import { validateTotalByteLength } from '../validation/byteLimitValidation.js';
import { validateTextSourceFileName } from '../validation/textValidation.js';
import {
  fetchGitHubJson,
  getGitHubBlobUrl,
  getWarningFromGitHubFetchResult,
} from './githubApiClient.js';
import { getGitHubPathIgnoreReason } from './githubPathPolicy.js';
import {
  getGitHubFileLabel,
  getGitHubRepoLabel,
  getSkippedGitHubFileEntry,
  withGitHubRepoMetadata,
} from './githubManifest.js';

const SHA_PATTERN = /^[a-f0-9]{6,64}$/i;

function normalizeGitHubBlobContent(blob) {
  if (blob?.encoding !== 'base64' || typeof blob?.content !== 'string') {
    return null;
  }

  return Buffer.from(blob.content.replace(/\s/g, ''), 'base64');
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

function createSkippedEntryResult({ id, repoInfo, path, bytes, warning, ignoredPathReason }) {
  return {
    entry: getSkippedGitHubFileEntry({
      id,
      repoInfo,
      path,
      bytes,
      warning,
      ignoredPathReason,
    }),
    warnings: [warning],
  };
}

export async function normalizeGitHubTreeEntry({
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
  const repoLabel = getGitHubRepoLabel(repoInfo);
  const label = getGitHubFileLabel({ repoLabel, path });
  const ignoreReason = getGitHubPathIgnoreReason(path);

  if (ignoreReason) {
    return createSkippedEntryResult({
      id,
      repoInfo,
      path: path || 'unknown path',
      bytes,
      ignoredPathReason: ignoreReason,
      warning: `Skipped ignored GitHub path "${label}" because it has an ${ignoreReason}.`,
    });
  }

  if (bytes > limits.maxFileBytes) {
    return createSkippedEntryResult({
      id,
      repoInfo,
      path,
      bytes,
      warning: `Skipped oversized GitHub source file "${label}" because it exceeds the ${limits.maxFileBytes} byte limit.`,
    });
  }

  const textValidation = validateTextSourceFileName(label);

  if (!textValidation.ok && textValidation.reason === 'disallowed') {
    return createSkippedEntryResult({
      id,
      repoInfo,
      path,
      bytes,
      warning: `Skipped disallowed GitHub source file "${label}" because it has a ${textValidation.disallowedReason}.`,
    });
  }

  if (!textValidation.ok) {
    return createSkippedEntryResult({
      id,
      repoInfo,
      path,
      bytes,
      warning: `Skipped unsupported GitHub source file "${label}".`,
    });
  }

  if (counters.includedFileCount >= limits.maxIncludedFiles) {
    return createSkippedEntryResult({
      id,
      repoInfo,
      path,
      bytes,
      warning: `Skipped GitHub source file "${label}" because the ${limits.maxIncludedFiles} included file limit was reached.`,
    });
  }

  const knownTotalValidation = validateTotalByteLength({
    currentBytes: counters.totalFetchedBytes,
    additionalBytes: bytes,
    maxTotalBytes: limits.maxTotalFetchedBytes,
  });

  if (bytes > 0 && !knownTotalValidation.ok) {
    return createSkippedEntryResult({
      id,
      repoInfo,
      path,
      bytes,
      warning: `Skipped GitHub source file "${label}" because the ${limits.maxTotalFetchedBytes} byte total fetched limit was reached.`,
    });
  }

  const blobSha = typeof entry?.sha === 'string' ? entry.sha : '';
  const blobUrl = SHA_PATTERN.test(blobSha)
    ? getGitHubBlobUrl({ ...repoInfo, sha: blobSha })
    : '';

  if (!blobUrl) {
    return createSkippedEntryResult({
      id,
      repoInfo,
      path,
      bytes,
      warning: `Skipped GitHub source file "${label}" because the file metadata is missing a valid blob SHA.`,
    });
  }

  const blobResult = await fetchGitHubJson(blobUrl, {
    fetchImpl,
    timeoutMs: limits.timeoutMs,
  });

  if (!blobResult.ok) {
    return createSkippedEntryResult({
      id,
      repoInfo,
      path,
      bytes,
      warning: getWarningFromGitHubFetchResult(blobResult, `file "${path}"`),
    });
  }

  const content = normalizeGitHubBlobContent(blobResult.data);

  if (!content) {
    return createSkippedEntryResult({
      id,
      repoInfo,
      path,
      bytes,
      warning: `Skipped GitHub source file "${label}" because the blob content is not base64 encoded.`,
    });
  }

  if (content.byteLength > limits.maxFileBytes) {
    return createSkippedEntryResult({
      id,
      repoInfo,
      path,
      bytes: content.byteLength,
      warning: `Skipped oversized GitHub source file "${label}" because it exceeds the ${limits.maxFileBytes} byte limit.`,
    });
  }

  const actualTotalValidation = validateTotalByteLength({
    currentBytes: counters.totalFetchedBytes,
    additionalBytes: content.byteLength,
    maxTotalBytes: limits.maxTotalFetchedBytes,
  });

  if (!actualTotalValidation.ok) {
    return createSkippedEntryResult({
      id,
      repoInfo,
      path,
      bytes: content.byteLength,
      warning: `Skipped GitHub source file "${label}" because the ${limits.maxTotalFetchedBytes} byte total fetched limit was reached.`,
    });
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
  const result = withGitHubRepoMetadata(normalizeResult, repoInfo, path);

  if (result.item) counters.includedFileCount += 1;

  const limited = applyGitHubTextLimit(result, counters, limits.maxTotalSourceTextLength);

  return {
    entry: limited.result,
    warnings: [...normalizeResult.warnings, ...limited.warnings],
  };
}
