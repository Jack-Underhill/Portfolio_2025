import JSZip from 'jszip';

import {
  PROJECT_AGENT_SOURCE_PDF_MAX_PAGES,
  PROJECT_AGENT_SOURCE_PDF_MAX_TEXT_LENGTH,
} from './pdfSource.js';
import {
  PROJECT_AGENT_SOURCE_ZIP_ENTRY_KIND,
  PROJECT_AGENT_SOURCE_ZIP_KIND,
} from './sourceKinds.js';
import { getSafeSourceLabel } from './sourcePathUtils.js';
import {
  createSkippedSourceEntriesResult,
  createSkippedSourceResult,
  createSourceResultEntry,
} from './sourceResult.js';
import { sortSourceEntriesByPathRank } from './sourceEntryRanking.js';
import {
  addCompactSourceWarning,
  createSourceWarningCompaction,
  getCompactSourceWarningSummaries,
} from './sourceWarningCompaction.js';
import {
  getZipEntryRankingSignals,
  normalizeZipEntry,
} from './zipEntryNormalizer.js';
import {
  PROJECT_AGENT_SOURCE_ZIP_ENTRY_MAX_BYTES,
  PROJECT_AGENT_SOURCE_ZIP_EXTENSION,
  PROJECT_AGENT_SOURCE_ZIP_MAX_BYTES,
  PROJECT_AGENT_SOURCE_ZIP_MAX_ENTRIES,
  PROJECT_AGENT_SOURCE_ZIP_MAX_INCLUDED_FILES,
  PROJECT_AGENT_SOURCE_ZIP_MEDIA_TYPE,
  PROJECT_AGENT_SOURCE_ZIP_TOTAL_EXTRACTED_BYTES,
} from './zipConstants.js';
import {
  validateByteLength,
  validateKnownByteLength,
} from './validation/byteLimitValidation.js';
import {
  getKnownFileSize,
  validateReadableFile,
} from './validation/fileValidation.js';

export {
  PROJECT_AGENT_SOURCE_ZIP_ENTRY_MAX_BYTES,
  PROJECT_AGENT_SOURCE_ZIP_EXTENSION,
  PROJECT_AGENT_SOURCE_ZIP_MAX_BYTES,
  PROJECT_AGENT_SOURCE_ZIP_MAX_ENTRIES,
  PROJECT_AGENT_SOURCE_ZIP_MAX_INCLUDED_FILES,
  PROJECT_AGENT_SOURCE_ZIP_MEDIA_TYPE,
  PROJECT_AGENT_SOURCE_ZIP_TOTAL_EXTRACTED_BYTES,
};

function getZipMediaType(file) {
  return typeof file?.type === 'string' && file.type.trim()
    ? file.type.trim()
    : PROJECT_AGENT_SOURCE_ZIP_MEDIA_TYPE;
}

function skipArchive({ id, archiveLabel, mediaType, bytes, warning }) {
  return createSkippedSourceEntriesResult({
    id,
    kind: PROJECT_AGENT_SOURCE_ZIP_KIND,
    label: archiveLabel,
    mediaType,
    bytes,
    warning,
  });
}

function skipArchiveEntry({ id, archiveLabel, bytes, warning }) {
  return createSourceResultEntry(createSkippedSourceResult({
    id,
    kind: PROJECT_AGENT_SOURCE_ZIP_ENTRY_KIND,
    label: archiveLabel,
    mediaType: PROJECT_AGENT_SOURCE_ZIP_MEDIA_TYPE,
    bytes,
    warning,
    manifestMetadata: {
      archiveLabel,
    },
  }));
}

function createIdGetter({ createId, id }) {
  return typeof createId === 'function' ? createId : () => id;
}

async function readZipBuffer(file, { archiveLabel, mediaType, maxBytes, nextId }) {
  const size = getKnownFileSize(file);
  const knownByteValidation = validateKnownByteLength(size, { maxBytes });
  const readableValidation = validateReadableFile(file);

  if (!knownByteValidation.ok || !readableValidation.ok) {
    const warning = knownByteValidation.reason === 'empty'
      ? `Zip source file "${archiveLabel}" is empty.`
      : knownByteValidation.reason === 'oversized'
        ? `Zip source file "${archiveLabel}" exceeds the ${maxBytes} byte limit.`
        : `Zip source file "${archiveLabel}" could not be read.`;

    return skipArchive({
      id: nextId(),
      archiveLabel,
      mediaType,
      bytes: size ?? 0,
      warning,
    });
  }

  try {
    const buffer = await readableValidation.readBytes();
    const byteLength = buffer.byteLength ?? size ?? 0;
    const actualByteValidation = validateByteLength(byteLength, { maxBytes });

    if (!actualByteValidation.ok) {
      return skipArchive({
        id: nextId(),
        archiveLabel,
        mediaType,
        bytes: byteLength,
        warning: actualByteValidation.reason === 'empty'
          ? `Zip source file "${archiveLabel}" is empty.`
          : `Zip source file "${archiveLabel}" exceeds the ${maxBytes} byte limit.`,
      });
    }

    return { buffer, byteLength };
  } catch {
    return skipArchive({
      id: nextId(),
      archiveLabel,
      mediaType,
      bytes: size ?? 0,
      warning: `Zip source file "${archiveLabel}" could not be read.`,
    });
  }
}

async function loadZip(buffer, { archiveLabel, mediaType, byteLength, nextId }) {
  try {
    return { zip: await JSZip.loadAsync(Buffer.from(buffer)) };
  } catch {
    return skipArchive({
      id: nextId(),
      archiveLabel,
      mediaType,
      bytes: byteLength,
      warning: `Zip source file "${archiveLabel}" could not be inspected.`,
    });
  }
}

function getSortedFileEntries(zip) {
  const entriesWithSignals = Object
    .values(zip.files)
    .filter((entry) => !entry.dir)
    .map((entry) => ({
      entry,
      signals: getZipEntryRankingSignals(entry),
    }));

  return sortSourceEntriesByPathRank(entriesWithSignals, {
    getPath: (item) => item.signals.path,
    getIgnoreReason: (item) => item.signals.ignoreReason,
    isSupported: (item) => item.signals.supported,
  })
    .map(({ entry }) => entry);
}

function formatZipCompactWarning({ archiveLabel, summary }) {
  const examples = summary.examples.length > 0
    ? ` Examples: ${summary.examples.join('; ')}.`
    : '';

  return `Skipped ${summary.count} zip source entr${summary.count === 1 ? 'y' : 'ies'} from "${archiveLabel}" due to ${summary.reason}.${examples}`;
}

export async function normalizeUploadedZipSourceFile(file, {
  id,
  createId,
  maxBytes = PROJECT_AGENT_SOURCE_ZIP_MAX_BYTES,
  maxEntries = PROJECT_AGENT_SOURCE_ZIP_MAX_ENTRIES,
  maxIncludedFiles = PROJECT_AGENT_SOURCE_ZIP_MAX_INCLUDED_FILES,
  maxEntryBytes = PROJECT_AGENT_SOURCE_ZIP_ENTRY_MAX_BYTES,
  maxTotalExtractedBytes = PROJECT_AGENT_SOURCE_ZIP_TOTAL_EXTRACTED_BYTES,
  maxPdfPages = PROJECT_AGENT_SOURCE_PDF_MAX_PAGES,
  maxPdfTextLength = PROJECT_AGENT_SOURCE_PDF_MAX_TEXT_LENGTH,
} = {}) {
  const archiveLabel = getSafeSourceLabel(file?.name, 'Unnamed zip source file');
  const mediaType = getZipMediaType(file);
  const nextId = createIdGetter({ createId, id });
  const readResult = await readZipBuffer(file, {
    archiveLabel,
    mediaType,
    maxBytes,
    nextId,
  });

  if (readResult.entries) return readResult;

  const loadResult = await loadZip(readResult.buffer, {
    archiveLabel,
    mediaType,
    byteLength: readResult.byteLength,
    nextId,
  });

  if (loadResult.entries) return loadResult;

  const fileEntries = getSortedFileEntries(loadResult.zip);
  const entries = [];
  const warnings = [];
  const compactWarnings = createSourceWarningCompaction();
  const counters = {
    includedCount: 0,
    totalExtractedBytes: 0,
  };
  const limits = {
    maxIncludedFiles,
    maxEntryBytes,
    maxTotalExtractedBytes,
    maxPdfPages,
    maxPdfTextLength,
  };

  if (fileEntries.length > maxEntries) {
    const warning = `Zip source file "${archiveLabel}" has ${fileEntries.length} entries; only the first ${maxEntries} entries were inspected.`;
    entries.push(skipArchiveEntry({
      id: nextId(),
      archiveLabel,
      bytes: readResult.byteLength,
      warning,
    }));
    warnings.push(warning);
  }

  for (const entry of fileEntries.slice(0, maxEntries)) {
    const result = await normalizeZipEntry({
      entry,
      archiveLabel,
      id: nextId(),
      limits,
      counters,
    });

    entries.push(result.entry);
    if (result.compactWarningReason) {
      addCompactSourceWarning(compactWarnings, {
        reason: result.compactWarningReason,
        label: result.entry?.manifest?.label,
      });
    } else {
      warnings.push(...result.warnings);
    }
  }

  warnings.push(
    ...getCompactSourceWarningSummaries(compactWarnings).map((summary) => formatZipCompactWarning({
      archiveLabel,
      summary,
    })),
  );

  return { entries, warnings };
}
