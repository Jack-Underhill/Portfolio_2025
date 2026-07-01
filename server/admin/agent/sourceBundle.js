import {
  normalizeUploadedSourceFile,
  PROJECT_AGENT_SOURCE_ALLOWED_EXTENSIONS,
  PROJECT_AGENT_SOURCE_PDF_MAX_BYTES,
  PROJECT_AGENT_SOURCE_PDF_MAX_PAGES,
  PROJECT_AGENT_SOURCE_PDF_MAX_TEXT_LENGTH,
} from './sourceIngestion/fileSource.js';
import { normalizePastedSourceText } from './sourceIngestion/textSource.js';

export {
  PROJECT_AGENT_SOURCE_ALLOWED_EXTENSIONS,
  PROJECT_AGENT_SOURCE_PDF_MAX_BYTES,
  PROJECT_AGENT_SOURCE_PDF_MAX_PAGES,
  PROJECT_AGENT_SOURCE_PDF_MAX_TEXT_LENGTH,
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
    const id = `source-${nextSourceNumber}`;
    nextSourceNumber += 1;

    const result = await normalizeUploadedSourceFile(file, {
      id,
      maxBytes: PROJECT_AGENT_SOURCE_FILE_MAX_BYTES,
      maxPdfBytes: PROJECT_AGENT_SOURCE_PDF_MAX_BYTES,
      maxPdfPages: PROJECT_AGENT_SOURCE_PDF_MAX_PAGES,
      maxPdfTextLength: PROJECT_AGENT_SOURCE_PDF_MAX_TEXT_LENGTH,
    });

    if (!result.item) {
      manifest.push(result.manifest);
      warnings.push(...result.warnings);
      continue;
    }

    const beforeLength = totalTextLength;
    totalTextLength = tryIncludeSource({
      source: result.item,
      sourceManifest: result.manifest,
      sources,
      manifest,
      warnings,
      totalTextLength,
    });

    if (totalTextLength === beforeLength) {
      continue;
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
