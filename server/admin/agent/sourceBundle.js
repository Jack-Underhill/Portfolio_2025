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
};

export const PROJECT_AGENT_SOURCE_TEXT_MAX_LENGTH = 30000;
export const PROJECT_AGENT_SOURCE_FILE_MAX_BYTES = 512 * 1024;
export const PROJECT_AGENT_SOURCE_TOTAL_TEXT_MAX_LENGTH = 80000;
export const PROJECT_AGENT_SOURCE_FILE_MAX_COUNT = 10;

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

function applySourceTextLimit(source, maxLength, warning) {
  if (source.text.length <= maxLength) {
    return {
      source,
      manifestWarnings: [],
      warnings: [],
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
    warnings: [warning],
  };
}

function tryIncludeSource({
  source,
  sourceManifest,
  sources,
  manifest,
  warnings,
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

  const perSourceLimit = source.kind === 'pasted-text'
    ? PROJECT_AGENT_SOURCE_TEXT_MAX_LENGTH
    : source.text.length;
  const maxLength = Math.min(perSourceLimit, remainingLength);
  const limitWarning = source.kind === 'pasted-text' && source.text.length > PROJECT_AGENT_SOURCE_TEXT_MAX_LENGTH
    ? `Truncated pasted source material to ${PROJECT_AGENT_SOURCE_TEXT_MAX_LENGTH} characters.`
    : `Truncated source "${source.label}" to fit the ${PROJECT_AGENT_SOURCE_TOTAL_TEXT_MAX_LENGTH} character total source limit.`;
  const limited = applySourceTextLimit(source, maxLength, limitWarning);

  sources.push(limited.source);
  manifest.push({
    ...createIncludedManifestEntry(limited.source, sourceManifest),
    warnings: [
      ...(Array.isArray(sourceManifest?.warnings) ? sourceManifest.warnings : []),
      ...limited.manifestWarnings,
    ],
  });
  warnings.push(...limited.warnings);

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
} = {}) {
  const sources = [];
  const manifest = [];
  const warnings = [];
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
        totalTextLength,
      });
    }

    warnings.push(...result.warnings);
  }

  return {
    hasSourceContext: sources.length > 0,
    sources,
    manifest,
    warnings,
  };
}
