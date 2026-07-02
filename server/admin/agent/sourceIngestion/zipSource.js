import JSZip from 'jszip';

import {
  PROJECT_AGENT_SOURCE_PDF_MAX_PAGES,
  PROJECT_AGENT_SOURCE_PDF_MAX_TEXT_LENGTH,
} from './pdfSource.js';
import { getZipEntryName, normalizeZipEntry } from './zipEntryNormalizer.js';
import {
  PROJECT_AGENT_SOURCE_ZIP_ENTRY_MAX_BYTES,
  PROJECT_AGENT_SOURCE_ZIP_EXTENSION,
  PROJECT_AGENT_SOURCE_ZIP_MAX_BYTES,
  PROJECT_AGENT_SOURCE_ZIP_MAX_ENTRIES,
  PROJECT_AGENT_SOURCE_ZIP_MAX_INCLUDED_FILES,
  PROJECT_AGENT_SOURCE_ZIP_MEDIA_TYPE,
  PROJECT_AGENT_SOURCE_ZIP_TOTAL_EXTRACTED_BYTES,
} from './zipConstants.js';

export {
  PROJECT_AGENT_SOURCE_ZIP_ENTRY_MAX_BYTES,
  PROJECT_AGENT_SOURCE_ZIP_EXTENSION,
  PROJECT_AGENT_SOURCE_ZIP_MAX_BYTES,
  PROJECT_AGENT_SOURCE_ZIP_MAX_ENTRIES,
  PROJECT_AGENT_SOURCE_ZIP_MAX_INCLUDED_FILES,
  PROJECT_AGENT_SOURCE_ZIP_MEDIA_TYPE,
  PROJECT_AGENT_SOURCE_ZIP_TOTAL_EXTRACTED_BYTES,
};

function getSafeZipLabel(file) {
  const name = typeof file?.name === 'string' ? file.name.trim() : '';
  return name || 'Unnamed zip source file';
}

function getZipMediaType(file) {
  return typeof file?.type === 'string' && file.type.trim()
    ? file.type.trim()
    : PROJECT_AGENT_SOURCE_ZIP_MEDIA_TYPE;
}

function skipArchive({ id, archiveLabel, mediaType, bytes, warning }) {
  return {
    entries: [
      {
        item: null,
        manifest: {
          id,
          kind: 'zip',
          label: archiveLabel,
          mediaType,
          bytes,
          included: false,
          warnings: [warning],
        },
      },
    ],
    warnings: [warning],
  };
}

function skipArchiveEntry({ id, archiveLabel, bytes, warning }) {
  return {
    item: null,
    manifest: {
      id,
      kind: 'zip-entry',
      label: archiveLabel,
      mediaType: PROJECT_AGENT_SOURCE_ZIP_MEDIA_TYPE,
      bytes,
      included: false,
      warnings: [warning],
      archiveLabel,
    },
  };
}

function createIdGetter({ createId, id }) {
  return typeof createId === 'function' ? createId : () => id;
}

async function readZipBuffer(file, { archiveLabel, mediaType, maxBytes, nextId }) {
  const size = Number.isFinite(file?.size) ? file.size : null;

  if (size === 0 || (size != null && size > maxBytes) || typeof file?.arrayBuffer !== 'function') {
    const warning = size === 0
      ? `Zip source file "${archiveLabel}" is empty.`
      : size != null && size > maxBytes
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
    const buffer = await file.arrayBuffer();
    const byteLength = buffer.byteLength ?? size ?? 0;

    if (byteLength === 0 || byteLength > maxBytes) {
      return skipArchive({
        id: nextId(),
        archiveLabel,
        mediaType,
        bytes: byteLength,
        warning: byteLength === 0
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
  return Object
    .values(zip.files)
    .filter((entry) => !entry.dir)
    .sort((left, right) => getZipEntryName(left).localeCompare(getZipEntryName(right)));
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
  const archiveLabel = getSafeZipLabel(file);
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
    warnings.push(...result.warnings);
  }

  return { entries, warnings };
}
