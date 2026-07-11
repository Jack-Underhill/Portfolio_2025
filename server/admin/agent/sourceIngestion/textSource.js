import {
  PROJECT_AGENT_SOURCE_FILE_KIND,
  PROJECT_AGENT_SOURCE_PASTED_TEXT_KIND,
} from './sourceKinds.js';
import { PROJECT_AGENT_SOURCE_DEFAULT_MEDIA_TYPE } from './sourceMediaTypes.js';
import {
  createIncludedSourceResult,
  createSkippedSourceResult,
} from './sourceResult.js';
import {
  PROJECT_AGENT_TEXT_SOURCE_MEDIA_TYPES_BY_EXTENSION,
} from './textSourcePolicy.js';
import {
  validateByteLength,
  validateKnownByteLength,
} from './validation/byteLimitValidation.js';
import {
  getKnownFileSize,
  getReadableFileBytes,
  validateByteReader,
} from './validation/fileValidation.js';
import {
  getSourceFileExtension,
  validateTextSourceFileName,
} from './validation/textValidation.js';

export {
  PROJECT_AGENT_SOURCE_ALLOWED_EXTENSIONS,
  PROJECT_AGENT_SOURCE_ALLOWED_FILENAMES,
} from './textSourcePolicy.js';
export { PROJECT_AGENT_SOURCE_DEFAULT_MEDIA_TYPE } from './sourceMediaTypes.js';
export {
  getDisallowedTextSourceReason,
  getSourceFileBaseName,
  getSourceFileExtension,
  isSupportedTextSourceFileName,
} from './validation/textValidation.js';

const TEXT_DECODER = new TextDecoder('utf-8', { fatal: true });
const TEXT_ENCODER = new TextEncoder();

export function getUtf8ByteLength(text) {
  return TEXT_ENCODER.encode(text).byteLength;
}

export function normalizePastedSourceText(sourceText, { id }) {
  const text = typeof sourceText === 'string' ? sourceText.trim() : '';

  if (!text) return null;

  return {
    id,
    kind: PROJECT_AGENT_SOURCE_PASTED_TEXT_KIND,
    label: 'Pasted source material',
    mediaType: PROJECT_AGENT_SOURCE_DEFAULT_MEDIA_TYPE,
    bytes: getUtf8ByteLength(text),
    text,
  };
}

function getSafeFileLabel(file) {
  const name = typeof file?.name === 'string' ? file.name.trim() : '';
  return name || 'Unnamed source file';
}

function getTextSourceMediaType({ type, extension }) {
  return typeof type === 'string' && type.trim()
    ? type.trim()
    : PROJECT_AGENT_TEXT_SOURCE_MEDIA_TYPES_BY_EXTENSION.get(extension)
      || PROJECT_AGENT_SOURCE_DEFAULT_MEDIA_TYPE;
}

function createSkippedTextSourceResult({
  id,
  kind,
  label,
  mediaType,
  bytes,
  manifestWarning,
  warning,
}) {
  return createSkippedSourceResult({
    id,
    kind,
    label,
    mediaType,
    bytes,
    manifestWarnings: [manifestWarning],
    warning,
  });
}

function normalizeNotebookCellSource(source) {
  if (Array.isArray(source)) {
    return source.join('');
  }

  if (typeof source === 'string') {
    return source;
  }

  return '';
}

function extractNotebookText(text) {
  let notebook;

  try {
    notebook = JSON.parse(text);
  } catch {
    return {
      text: '',
      warning: 'Source file could not be parsed as a Jupyter notebook.',
    };
  }

  if (!Array.isArray(notebook?.cells)) {
    return {
      text: '',
      warning: 'Source file is not a supported Jupyter notebook.',
    };
  }

  const parts = [];

  notebook.cells.forEach((cell, index) => {
    const cellType = typeof cell?.cell_type === 'string' ? cell.cell_type : 'unknown';

    if (cellType !== 'markdown' && cellType !== 'code') {
      return;
    }

    const cellText = normalizeNotebookCellSource(cell.source).trim();

    if (!cellText) {
      return;
    }

    const label = cellType === 'markdown' ? 'Markdown' : 'Code';
    parts.push(`[${label} cell ${index + 1}]\n${cellText}`);
  });

  return {
    text: parts.join('\n\n').trim(),
    warning: '',
  };
}

export async function normalizeUploadedTextSourceFile(file, { id, maxBytes }) {
  const label = getSafeFileLabel(file);
  const size = getKnownFileSize(file);
  const type = typeof file?.type === 'string' ? file.type : '';
  const readBytes = getReadableFileBytes(file);

  return normalizeNamedTextSourceBytes({
    id,
    label,
    type,
    bytes: size,
    readBytes,
    maxBytes,
  });
}

export async function normalizeNamedTextSourceBytes({
  id,
  label: unsafeLabel,
  type = '',
  bytes: knownBytes,
  readBytes,
  maxBytes,
  kind = PROJECT_AGENT_SOURCE_FILE_KIND,
}) {
  const label = typeof unsafeLabel === 'string' && unsafeLabel.trim()
    ? unsafeLabel.trim()
    : 'Unnamed source file';
  const extension = getSourceFileExtension(label);
  const size = Number.isFinite(knownBytes) ? knownBytes : null;
  const mediaType = getTextSourceMediaType({ type, extension });
  const fileNameValidation = validateTextSourceFileName(label);

  if (!fileNameValidation.ok && fileNameValidation.reason === 'disallowed') {
    return createSkippedTextSourceResult({
      id,
      kind,
      label,
      mediaType,
      bytes: size ?? 0,
      manifestWarning: `Source file "${label}" is not allowed because it has a ${fileNameValidation.disallowedReason}.`,
      warning: `Skipped disallowed source file "${label}".`,
    });
  }

  if (!fileNameValidation.ok) {
    return createSkippedTextSourceResult({
      id,
      kind,
      label,
      bytes: size ?? 0,
      manifestWarning: `Unsupported source file type for "${label}".`,
      warning: `Skipped unsupported source file "${label}".`,
    });
  }

  const knownByteValidation = validateKnownByteLength(size, { maxBytes });

  if (!knownByteValidation.ok && knownByteValidation.reason === 'empty') {
    return createSkippedTextSourceResult({
      id,
      kind,
      label,
      mediaType,
      bytes: 0,
      manifestWarning: `Source file "${label}" is empty.`,
      warning: `Skipped empty source file "${label}".`,
    });
  }

  if (!knownByteValidation.ok && knownByteValidation.reason === 'oversized') {
    return createSkippedTextSourceResult({
      id,
      kind,
      label,
      mediaType,
      bytes: size,
      manifestWarning: `Source file "${label}" exceeds the ${maxBytes} byte limit.`,
      warning: `Skipped oversized source file "${label}".`,
    });
  }

  const readableValidation = validateByteReader(readBytes);

  if (!readableValidation.ok) {
    return createSkippedTextSourceResult({
      id,
      kind,
      label,
      mediaType,
      bytes: size ?? 0,
      manifestWarning: `Source file "${label}" could not be read.`,
      warning: `Skipped unreadable source file "${label}".`,
    });
  }

  let buffer;

  try {
    buffer = await readableValidation.readBytes();
  } catch {
    return createSkippedTextSourceResult({
      id,
      kind,
      label,
      mediaType,
      bytes: size ?? 0,
      manifestWarning: `Source file "${label}" could not be read.`,
      warning: `Skipped unreadable source file "${label}".`,
    });
  }

  const byteLength = buffer.byteLength ?? size ?? 0;
  const actualByteValidation = validateByteLength(byteLength, { maxBytes });

  if (!actualByteValidation.ok && actualByteValidation.reason === 'empty') {
    return createSkippedTextSourceResult({
      id,
      kind,
      label,
      mediaType,
      bytes: 0,
      manifestWarning: `Source file "${label}" is empty.`,
      warning: `Skipped empty source file "${label}".`,
    });
  }

  if (!actualByteValidation.ok && actualByteValidation.reason === 'oversized') {
    return createSkippedTextSourceResult({
      id,
      kind,
      label,
      mediaType,
      bytes: byteLength,
      manifestWarning: `Source file "${label}" exceeds the ${maxBytes} byte limit.`,
      warning: `Skipped oversized source file "${label}".`,
    });
  }

  let text;

  try {
    text = TEXT_DECODER.decode(buffer).trim();
  } catch {
    return createSkippedTextSourceResult({
      id,
      kind,
      label,
      mediaType,
      bytes: byteLength,
      manifestWarning: `Source file "${label}" could not be decoded as UTF-8.`,
      warning: `Skipped undecodable source file "${label}".`,
    });
  }

  if (!text) {
    return createSkippedTextSourceResult({
      id,
      kind,
      label,
      mediaType,
      bytes: byteLength,
      manifestWarning: `Source file "${label}" is empty after trimming.`,
      warning: `Skipped empty source file "${label}".`,
    });
  }

  if (extension === '.ipynb') {
    const notebookResult = extractNotebookText(text);

    if (!notebookResult.text) {
      return createSkippedTextSourceResult({
        id,
        kind,
        label,
        mediaType,
        bytes: byteLength,
        manifestWarning: notebookResult.warning || `Source file "${label}" is empty after trimming.`,
        warning: `Skipped unreadable source file "${label}".`,
      });
    }

    text = notebookResult.text;
  }

  return createIncludedSourceResult({
    id,
    kind,
    label,
    mediaType,
    bytes: byteLength,
    text,
  });
}
