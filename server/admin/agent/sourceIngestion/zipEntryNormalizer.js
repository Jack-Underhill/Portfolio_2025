import {
  normalizeNamedTextSourceBytes,
} from './textSource.js';
import {
  cleanUnsafeRelativeSourcePath,
  getSourceFileExtension,
  isSafeRelativeSourcePath,
  joinSourceDisplayPath,
} from './sourcePathUtils.js';
import {
  createSkippedSourceResult,
  createSourceResultEntry,
} from './sourceResult.js';
import {
  normalizeUploadedPdfSourceFile,
  PROJECT_AGENT_SOURCE_PDF_EXTENSION,
  PROJECT_AGENT_SOURCE_PDF_MEDIA_TYPE,
} from './pdfSource.js';
import {
  PROJECT_AGENT_SOURCE_PDF_KIND,
  PROJECT_AGENT_SOURCE_ZIP_ENTRY_KIND,
} from './sourceKinds.js';
import {
  IGNORED_ZIP_PATH_SEGMENTS,
  PROJECT_AGENT_SOURCE_ZIP_EXTENSION,
  PROJECT_AGENT_SOURCE_ZIP_MEDIA_TYPE,
} from './zipConstants.js';
import { validateTotalByteLength } from './validation/byteLimitValidation.js';
import { validateTextSourceFileName } from './validation/textValidation.js';

export function getZipEntryName(entry) {
  return typeof entry?.unsafeOriginalName === 'string' && entry.unsafeOriginalName.trim()
    ? entry.unsafeOriginalName.trim()
    : (typeof entry?.name === 'string' ? entry.name.trim() : '');
}

function createFileLike({ name, type, bytes }) {
  return {
    name,
    type,
    size: bytes.byteLength,
    arrayBuffer: async () => bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    ),
  };
}

function getSafePath(entry) {
  const original = getZipEntryName(entry);

  if (!original) return { path: 'unsafe entry', unsafe: true };

  const hasUnsafeOriginal = typeof entry?.unsafeOriginalName === 'string'
    && entry.unsafeOriginalName !== entry.name;
  const isSafePath = isSafeRelativeSourcePath(original);

  return hasUnsafeOriginal || !isSafePath
    ? { path: cleanUnsafeRelativeSourcePath(original), unsafe: true }
    : { path: original.split('/').join('/'), unsafe: false };
}

function getEntryKind(path) {
  const extension = getSourceFileExtension(path);
  const textValidation = validateTextSourceFileName(path);

  if (extension === PROJECT_AGENT_SOURCE_PDF_EXTENSION) {
    return { extension, kind: PROJECT_AGENT_SOURCE_PDF_KIND };
  }
  if (!textValidation.ok && textValidation.reason === 'disallowed') {
    return { extension, kind: 'disallowed-text', disallowedReason: textValidation.disallowedReason };
  }
  if (textValidation.ok) return { extension, kind: 'text' };
  if (extension === PROJECT_AGENT_SOURCE_ZIP_EXTENSION) return { extension, kind: 'nested-zip' };
  return { extension, kind: '' };
}

function getPolicyWarning({ archiveLabel, path, pathIsUnsafe, kind, includedCount, maxIncludedFiles }) {
  const label = joinSourceDisplayPath(archiveLabel, path);
  const isIgnored = path
    .split('/')
    .some((part) => IGNORED_ZIP_PATH_SEGMENTS.has(part.toLowerCase()));

  if (pathIsUnsafe) return `Skipped unsafe zip entry "${label}".`;
  if (isIgnored) return `Skipped ignored zip entry "${label}".`;
  if (kind === 'disallowed-text') return `Skipped disallowed zip entry "${label}".`;
  if (kind === 'nested-zip') return `Skipped nested zip entry "${label}".`;
  if (!kind) return `Skipped unsupported zip entry "${label}".`;
  if (includedCount >= maxIncludedFiles) {
    return `Skipped zip entry "${label}" because the ${maxIncludedFiles} included file limit was reached.`;
  }

  return '';
}

function getUncompressedSize(entry) {
  const size = entry?._data?.uncompressedSize;
  return Number.isFinite(size) && size >= 0 ? size : null;
}

function getSizeWarning({ archiveLabel, path, bytes, totalExtractedBytes, limits }) {
  const label = joinSourceDisplayPath(archiveLabel, path);

  if (bytes > limits.maxEntryBytes) {
    return `Skipped oversized zip entry "${label}" because it exceeds the ${limits.maxEntryBytes} byte limit.`;
  }

  const totalValidation = validateTotalByteLength({
    currentBytes: totalExtractedBytes,
    additionalBytes: bytes,
    maxTotalBytes: limits.maxTotalExtractedBytes,
  });

  if (!totalValidation.ok) {
    return `Skipped zip entry "${label}" because the ${limits.maxTotalExtractedBytes} byte total extracted limit was reached.`;
  }

  return '';
}

async function readEntryBytes({ entry, archiveLabel, path, counters, limits }) {
  const knownSize = getUncompressedSize(entry);
  const knownSizeWarning = knownSize == null ? '' : getSizeWarning({
    archiveLabel,
    path,
    bytes: knownSize,
    totalExtractedBytes: counters.totalExtractedBytes,
    limits,
  });

  if (knownSizeWarning) return { warning: knownSizeWarning, bytesLength: knownSize };

  try {
    const bytes = await entry.async('uint8array');
    const warning = getSizeWarning({
      archiveLabel,
      path,
      bytes: bytes.byteLength,
      totalExtractedBytes: counters.totalExtractedBytes,
      limits,
    });

    return warning ? { warning, bytesLength: bytes.byteLength } : { bytes };
  } catch {
    return { warning: `Skipped unreadable zip entry "${joinSourceDisplayPath(archiveLabel, path)}".` };
  }
}

function isBinaryLooking(bytes) {
  const sampleLength = Math.min(bytes.byteLength, 1024);
  let controlCount = 0;

  for (let index = 0; index < sampleLength; index += 1) {
    const value = bytes[index];
    if (value === 0) return true;
    if (value < 32 && value !== 9 && value !== 10 && value !== 13) controlCount += 1;
  }

  return sampleLength > 0 && controlCount / sampleLength > 0.1;
}

function skipped({ id, archiveLabel, path, bytes = 0, warning }) {
  const label = joinSourceDisplayPath(archiveLabel, path);
  const result = createSkippedSourceResult({
    id,
    kind: PROJECT_AGENT_SOURCE_ZIP_ENTRY_KIND,
    label,
    mediaType: PROJECT_AGENT_SOURCE_ZIP_MEDIA_TYPE,
    bytes,
    warning,
    manifestMetadata: {
      archiveLabel,
      path,
    },
  });

  return {
    entry: createSourceResultEntry(result),
    warnings: result.warnings,
  };
}

function withArchiveMetadata(result, { archiveLabel, path, bytes }) {
  return {
    entry: {
      item: result.item ? { ...result.item, archiveLabel, path } : null,
      manifest: {
        ...result.manifest,
        archiveLabel,
        path,
        extractedBytes: bytes,
      },
    },
    warnings: result.warnings,
  };
}

export async function normalizeZipEntry({ entry, archiveLabel, id, limits, counters }) {
  const { path, unsafe } = getSafePath(entry);
  const { kind } = getEntryKind(path);
  const policyWarning = getPolicyWarning({
    archiveLabel,
    path,
    pathIsUnsafe: unsafe,
    kind,
    includedCount: counters.includedCount,
    maxIncludedFiles: limits.maxIncludedFiles,
  });

  if (policyWarning) return skipped({ id, archiveLabel, path, warning: policyWarning });

  const readResult = await readEntryBytes({ entry, archiveLabel, path, counters, limits });

  if (readResult.warning) {
    return skipped({
      id,
      archiveLabel,
      path,
      bytes: readResult.bytesLength,
      warning: readResult.warning,
    });
  }

  if (kind === 'text' && isBinaryLooking(readResult.bytes)) {
    return skipped({
      id,
      archiveLabel,
      path,
      bytes: readResult.bytes.byteLength,
      warning: `Skipped binary-looking zip entry "${joinSourceDisplayPath(archiveLabel, path)}".`,
    });
  }

  const label = joinSourceDisplayPath(archiveLabel, path);
  const result = kind === PROJECT_AGENT_SOURCE_PDF_KIND
    ? await normalizeUploadedPdfSourceFile(createFileLike({
      name: label,
      type: PROJECT_AGENT_SOURCE_PDF_MEDIA_TYPE,
      bytes: readResult.bytes,
    }), {
      id,
      maxBytes: limits.maxEntryBytes,
      maxPages: limits.maxPdfPages,
      maxTextLength: limits.maxPdfTextLength,
    })
    : await normalizeNamedTextSourceBytes({
      id,
      label,
      bytes: readResult.bytes.byteLength,
      readBytes: async () => readResult.bytes,
      maxBytes: limits.maxEntryBytes,
    });

  counters.totalExtractedBytes += readResult.bytes.byteLength;
  if (result.item) counters.includedCount += 1;

  return withArchiveMetadata(result, {
    archiveLabel,
    path,
    bytes: readResult.bytes.byteLength,
  });
}
