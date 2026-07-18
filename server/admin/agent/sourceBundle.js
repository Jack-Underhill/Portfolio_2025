import {
  normalizeUploadedSourceFile,
  PROJECT_AGENT_SOURCE_ALLOWED_EXTENSIONS,
  PROJECT_AGENT_SOURCE_PDF_MAX_BYTES,
  PROJECT_AGENT_SOURCE_PDF_MAX_PAGES,
  PROJECT_AGENT_SOURCE_PDF_MAX_TEXT_LENGTH,
  PROJECT_AGENT_SOURCE_ZIP_ENTRY_MAX_BYTES,
  PROJECT_AGENT_SOURCE_ZIP_MAX_BYTES,
  PROJECT_AGENT_SOURCE_ZIP_MAX_ENTRIES,
  PROJECT_AGENT_SOURCE_ZIP_MAX_INCLUDED_FILES,
  PROJECT_AGENT_SOURCE_ZIP_TOTAL_EXTRACTED_BYTES,
} from './sourceIngestion/fileSource.js';
import {
  normalizeGitHubRepoSource,
  PROJECT_AGENT_SOURCE_GITHUB_FILE_MAX_BYTES,
  PROJECT_AGENT_SOURCE_GITHUB_MAX_INCLUDED_FILES,
  PROJECT_AGENT_SOURCE_GITHUB_MAX_TREE_ENTRIES,
  PROJECT_AGENT_SOURCE_GITHUB_TIMEOUT_MS,
  PROJECT_AGENT_SOURCE_GITHUB_TOTAL_FETCHED_BYTES,
  PROJECT_AGENT_SOURCE_GITHUB_TOTAL_TEXT_MAX_LENGTH,
} from './sourceIngestion/githubSource.js';
import {
  addCompactSourceWarning,
  createSourceWarningCompaction,
  getCompactSourceWarningSummaries,
} from './sourceIngestion/sourceWarningCompaction.js';
import { normalizePastedSourceText } from './sourceIngestion/textSource.js';

export {
  PROJECT_AGENT_SOURCE_ALLOWED_EXTENSIONS,
  PROJECT_AGENT_SOURCE_PDF_MAX_BYTES,
  PROJECT_AGENT_SOURCE_PDF_MAX_PAGES,
  PROJECT_AGENT_SOURCE_PDF_MAX_TEXT_LENGTH,
  PROJECT_AGENT_SOURCE_ZIP_ENTRY_MAX_BYTES,
  PROJECT_AGENT_SOURCE_ZIP_MAX_BYTES,
  PROJECT_AGENT_SOURCE_ZIP_MAX_ENTRIES,
  PROJECT_AGENT_SOURCE_ZIP_MAX_INCLUDED_FILES,
  PROJECT_AGENT_SOURCE_ZIP_TOTAL_EXTRACTED_BYTES,
  PROJECT_AGENT_SOURCE_GITHUB_FILE_MAX_BYTES,
  PROJECT_AGENT_SOURCE_GITHUB_MAX_INCLUDED_FILES,
  PROJECT_AGENT_SOURCE_GITHUB_MAX_TREE_ENTRIES,
  PROJECT_AGENT_SOURCE_GITHUB_TIMEOUT_MS,
  PROJECT_AGENT_SOURCE_GITHUB_TOTAL_FETCHED_BYTES,
  PROJECT_AGENT_SOURCE_GITHUB_TOTAL_TEXT_MAX_LENGTH,
};

export const PROJECT_AGENT_SOURCE_TEXT_MAX_LENGTH = 30000;
export const PROJECT_AGENT_SOURCE_CONTAINER_TEXT_MAX_LENGTH = 12000;
export const PROJECT_AGENT_SOURCE_FILE_MAX_BYTES = 512 * 1024;
export const PROJECT_AGENT_SOURCE_TOTAL_TEXT_MAX_LENGTH = 80000;
export const PROJECT_AGENT_SOURCE_FILE_MAX_COUNT = 10;

const PROJECT_CONTAINER_TEXT_BUDGET_REASON = 'project-container text budget';

function createIncludedManifestEntry(source, sourceManifest) {
  const baseManifest = sourceManifest ? { ...sourceManifest } : {};
  delete baseManifest.text;

  return {
    ...baseManifest,
    id: source.id,
    kind: source.kind,
    label: source.label,
    mediaType: source.mediaType,
    bytes: source.bytes,
    included: true,
    warnings: Array.isArray(sourceManifest?.warnings) ? [...sourceManifest.warnings] : [],
  };
}

function createSkippedManifestEntry({ source, warning, sourceManifest }) {
  const bytes = source ? source.bytes : 0;
  const baseManifest = sourceManifest ? { ...sourceManifest } : {};
  delete baseManifest.text;

  return {
    ...baseManifest,
    id: source.id,
    kind: source.kind,
    label: source.label,
    mediaType: source.mediaType,
    bytes,
    included: false,
    warnings: [
      ...(Array.isArray(sourceManifest?.warnings) ? sourceManifest.warnings : []),
      warning,
    ],
  };
}

function isProjectContainerSource(source) {
  return source?.kind === 'github-file' || Boolean(source?.archiveLabel && source?.path);
}

function getPerSourceTextLimit(source) {
  if (source.kind === 'pasted-text') {
    return {
      maxLength: PROJECT_AGENT_SOURCE_TEXT_MAX_LENGTH,
      warning: `Truncated pasted source material to ${PROJECT_AGENT_SOURCE_TEXT_MAX_LENGTH} characters.`,
    };
  }

  if (isProjectContainerSource(source)) {
    return {
      maxLength: PROJECT_AGENT_SOURCE_CONTAINER_TEXT_MAX_LENGTH,
      warning: `Truncated source "${source.label}" to ${PROJECT_AGENT_SOURCE_CONTAINER_TEXT_MAX_LENGTH} characters to keep project-container evidence balanced.`,
      compactWarningReason: PROJECT_CONTAINER_TEXT_BUDGET_REASON,
    };
  }

  return {
    maxLength: source.text.length,
    warning: null,
  };
}

function formatSourceTextBudgetWarning(summary) {
  const examples = summary.examples.length
    ? ` Examples: ${summary.examples.join('; ')}.`
    : '';
  const fileLabel = summary.count === 1 ? 'file' : 'files';

  return `Truncated ${summary.count} project-container source ${fileLabel} to ${PROJECT_AGENT_SOURCE_CONTAINER_TEXT_MAX_LENGTH} characters each to keep source coverage balanced.${examples}`;
}

function applySourceTextLimit(source, maxLength, warning, { compactWarningReason } = {}) {
  if (source.text.length <= maxLength) {
    return {
      source,
      manifestWarnings: [],
      warnings: [],
      compactWarning: null,
    };
  }

  const truncatedText = source.text.slice(0, maxLength).trimEnd();
  const truncatedSource = {
    ...source,
    text: truncatedText,
  };

  return {
    source: truncatedSource,
    manifestWarnings: [warning],
    warnings: compactWarningReason ? [] : [warning],
    compactWarning: compactWarningReason
      ? {
        reason: compactWarningReason,
        label: source.label,
      }
      : null,
  };
}

function tryIncludeSource({
  source,
  sourceManifest,
  sources,
  manifest,
  warnings,
  textBudgetWarningCompaction,
  totalTextLength,
}) {
  const remainingLength = PROJECT_AGENT_SOURCE_TOTAL_TEXT_MAX_LENGTH - totalTextLength;

  if (remainingLength <= 0) {
    const warning = `Skipped source "${source.label}" because the total source text limit was reached.`;
    manifest.push(createSkippedManifestEntry({
      source,
      sourceManifest,
      warning,
    }));
    warnings.push(warning);
    return totalTextLength;
  }

  const sourceLimit = getPerSourceTextLimit(source);
  const perSourceLimit = Math.min(sourceLimit.maxLength, source.text.length);
  const maxLength = Math.min(perSourceLimit, remainingLength);
  const hitTotalLimit = source.text.length > maxLength && remainingLength < perSourceLimit;
  const limitWarning = hitTotalLimit
    ? `Truncated source "${source.label}" to fit the ${PROJECT_AGENT_SOURCE_TOTAL_TEXT_MAX_LENGTH} character total source limit.`
    : sourceLimit.warning;
  const limited = applySourceTextLimit(source, maxLength, limitWarning, {
    compactWarningReason: hitTotalLimit ? null : sourceLimit.compactWarningReason,
  });

  sources.push(limited.source);
  manifest.push({
    ...createIncludedManifestEntry(limited.source, sourceManifest),
    warnings: [
      ...(Array.isArray(sourceManifest?.warnings) ? sourceManifest.warnings : []),
      ...limited.manifestWarnings,
    ],
  });
  warnings.push(...limited.warnings);
  if (limited.compactWarning) {
    addCompactSourceWarning(textBudgetWarningCompaction, limited.compactWarning);
  }

  return totalTextLength + limited.source.text.length;
}

function createSourceIdGenerator(start) {
  let nextSourceNumber = start;

  return {
    nextId() {
      const id = `source-${nextSourceNumber}`;
      nextSourceNumber += 1;
      return id;
    },
    getNextSourceNumber() {
      return nextSourceNumber;
    },
  };
}

function normalizeSourceResults(result) {
  if (Array.isArray(result?.entries)) {
    return result.entries;
  }

  return [
    {
      item: result.item,
      manifest: result.manifest,
    },
  ];
}

export async function createProjectAgentSourceBundle({
  sourceText,
  sourceFiles = [],
  githubRepoUrl,
  githubFetchImpl,
} = {}) {
  const sources = [];
  const manifest = [];
  const warnings = [];
  const textBudgetWarningCompaction = createSourceWarningCompaction();
  let totalTextLength = 0;
  let nextSourceNumber = 1;

  const pastedSource = normalizePastedSourceText(sourceText, { id: `source-${nextSourceNumber}` });

  if (pastedSource) {
    nextSourceNumber += 1;
    totalTextLength = tryIncludeSource({
      source: pastedSource,
      sources,
      manifest,
      warnings,
      textBudgetWarningCompaction,
      totalTextLength,
    });
  }

  const files = Array.isArray(sourceFiles) ? sourceFiles.slice(0, PROJECT_AGENT_SOURCE_FILE_MAX_COUNT) : [];

  if (Array.isArray(sourceFiles) && sourceFiles.length > PROJECT_AGENT_SOURCE_FILE_MAX_COUNT) {
    warnings.push(`Skipped ${sourceFiles.length - PROJECT_AGENT_SOURCE_FILE_MAX_COUNT} source file(s) beyond the ${PROJECT_AGENT_SOURCE_FILE_MAX_COUNT} file limit.`);
  }

  for (const file of files) {
    const idGenerator = createSourceIdGenerator(nextSourceNumber);

    const result = await normalizeUploadedSourceFile(file, {
      id: `source-${nextSourceNumber}`,
      createId: idGenerator.nextId,
      maxBytes: PROJECT_AGENT_SOURCE_FILE_MAX_BYTES,
      maxPdfBytes: PROJECT_AGENT_SOURCE_PDF_MAX_BYTES,
      maxPdfPages: PROJECT_AGENT_SOURCE_PDF_MAX_PAGES,
      maxPdfTextLength: PROJECT_AGENT_SOURCE_PDF_MAX_TEXT_LENGTH,
      maxZipBytes: PROJECT_AGENT_SOURCE_ZIP_MAX_BYTES,
      maxZipEntries: PROJECT_AGENT_SOURCE_ZIP_MAX_ENTRIES,
      maxZipIncludedFiles: PROJECT_AGENT_SOURCE_ZIP_MAX_INCLUDED_FILES,
      maxZipEntryBytes: PROJECT_AGENT_SOURCE_ZIP_ENTRY_MAX_BYTES,
      maxZipTotalExtractedBytes: PROJECT_AGENT_SOURCE_ZIP_TOTAL_EXTRACTED_BYTES,
    });
    const sourceResults = normalizeSourceResults(result);

    nextSourceNumber = Math.max(
      nextSourceNumber + 1,
      idGenerator.getNextSourceNumber(),
    );

    for (const sourceResult of sourceResults) {
      if (!sourceResult.item) {
        manifest.push(sourceResult.manifest);
        continue;
      }

      totalTextLength = tryIncludeSource({
        source: sourceResult.item,
        sourceManifest: sourceResult.manifest,
        sources,
        manifest,
        warnings,
        textBudgetWarningCompaction,
        totalTextLength,
      });
    }

    warnings.push(...result.warnings);
  }

  const githubSourceText = typeof githubRepoUrl === 'string' ? githubRepoUrl.trim() : '';

  if (githubSourceText) {
    const idGenerator = createSourceIdGenerator(nextSourceNumber);
    const result = await normalizeGitHubRepoSource(githubSourceText, {
      id: `source-${nextSourceNumber}`,
      createId: idGenerator.nextId,
      fetchImpl: githubFetchImpl,
    });

    nextSourceNumber = Math.max(
      nextSourceNumber + 1,
      idGenerator.getNextSourceNumber(),
    );

    for (const sourceResult of normalizeSourceResults(result)) {
      if (!sourceResult.item) {
        manifest.push(sourceResult.manifest);
        continue;
      }

      totalTextLength = tryIncludeSource({
        source: sourceResult.item,
        sourceManifest: sourceResult.manifest,
        sources,
        manifest,
        warnings,
        textBudgetWarningCompaction,
        totalTextLength,
      });
    }

    warnings.push(...result.warnings);
  }

  return {
    hasSourceContext: sources.length > 0,
    sources,
    manifest,
    warnings: [
      ...warnings,
      ...getCompactSourceWarningSummaries(textBudgetWarningCompaction)
        .map(formatSourceTextBudgetWarning),
    ],
  };
}
