const TEXT_DECODER = new TextDecoder('utf-8', { fatal: true });
const TEXT_ENCODER = new TextEncoder();

export const PROJECT_AGENT_SOURCE_ALLOWED_EXTENSIONS = [
  '.txt',
  '.md',
  '.markdown',
  '.json',
  '.csv',
  '.log',
];

export const PROJECT_AGENT_SOURCE_DEFAULT_MEDIA_TYPE = 'text/plain';

const MEDIA_TYPES_BY_EXTENSION = new Map([
  ['.txt', 'text/plain'],
  ['.md', 'text/markdown'],
  ['.markdown', 'text/markdown'],
  ['.json', 'application/json'],
  ['.csv', 'text/csv'],
  ['.log', 'text/plain'],
]);

export function getUtf8ByteLength(text) {
  return TEXT_ENCODER.encode(text).byteLength;
}

export function getSourceFileExtension(name) {
  if (typeof name !== 'string') return '';

  const trimmedName = name.trim();
  const lastDotIndex = trimmedName.lastIndexOf('.');

  if (lastDotIndex <= 0 || lastDotIndex === trimmedName.length - 1) {
    return '';
  }

  return trimmedName.slice(lastDotIndex).toLowerCase();
}

export function isSupportedTextSourceFileName(name) {
  return PROJECT_AGENT_SOURCE_ALLOWED_EXTENSIONS.includes(getSourceFileExtension(name));
}

export function normalizePastedSourceText(sourceText, { id }) {
  const text = typeof sourceText === 'string' ? sourceText.trim() : '';

  if (!text) return null;

  return {
    id,
    kind: 'pasted-text',
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

function getFileMediaType(file, extension) {
  return typeof file?.type === 'string' && file.type.trim()
    ? file.type.trim()
    : MEDIA_TYPES_BY_EXTENSION.get(extension) || PROJECT_AGENT_SOURCE_DEFAULT_MEDIA_TYPE;
}

export async function normalizeUploadedTextSourceFile(file, { id, maxBytes }) {
  const label = getSafeFileLabel(file);
  const extension = getSourceFileExtension(label);
  const size = Number.isFinite(file?.size) ? file.size : null;

  if (!isSupportedTextSourceFileName(label)) {
    return {
      item: null,
      manifest: {
        id,
        kind: 'file',
        label,
        bytes: size ?? 0,
        included: false,
        warnings: [`Unsupported source file type for "${label}".`],
      },
      warnings: [`Skipped unsupported source file "${label}".`],
    };
  }

  if (size === 0) {
    return {
      item: null,
      manifest: {
        id,
        kind: 'file',
        label,
        mediaType: getFileMediaType(file, extension),
        bytes: 0,
        included: false,
        warnings: [`Source file "${label}" is empty.`],
      },
      warnings: [`Skipped empty source file "${label}".`],
    };
  }

  if (size != null && size > maxBytes) {
    return {
      item: null,
      manifest: {
        id,
        kind: 'file',
        label,
        mediaType: getFileMediaType(file, extension),
        bytes: size,
        included: false,
        warnings: [`Source file "${label}" exceeds the ${maxBytes} byte limit.`],
      },
      warnings: [`Skipped oversized source file "${label}".`],
    };
  }

  if (typeof file?.arrayBuffer !== 'function') {
    return {
      item: null,
      manifest: {
        id,
        kind: 'file',
        label,
        mediaType: getFileMediaType(file, extension),
        bytes: size ?? 0,
        included: false,
        warnings: [`Source file "${label}" could not be read.`],
      },
      warnings: [`Skipped unreadable source file "${label}".`],
    };
  }

  let buffer;

  try {
    buffer = await file.arrayBuffer();
  } catch {
    return {
      item: null,
      manifest: {
        id,
        kind: 'file',
        label,
        mediaType: getFileMediaType(file, extension),
        bytes: size ?? 0,
        included: false,
        warnings: [`Source file "${label}" could not be read.`],
      },
      warnings: [`Skipped unreadable source file "${label}".`],
    };
  }

  const byteLength = buffer.byteLength ?? size ?? 0;

  if (byteLength === 0) {
    return {
      item: null,
      manifest: {
        id,
        kind: 'file',
        label,
        mediaType: getFileMediaType(file, extension),
        bytes: 0,
        included: false,
        warnings: [`Source file "${label}" is empty.`],
      },
      warnings: [`Skipped empty source file "${label}".`],
    };
  }

  if (byteLength > maxBytes) {
    return {
      item: null,
      manifest: {
        id,
        kind: 'file',
        label,
        mediaType: getFileMediaType(file, extension),
        bytes: byteLength,
        included: false,
        warnings: [`Source file "${label}" exceeds the ${maxBytes} byte limit.`],
      },
      warnings: [`Skipped oversized source file "${label}".`],
    };
  }

  let text;

  try {
    text = TEXT_DECODER.decode(buffer).trim();
  } catch {
    return {
      item: null,
      manifest: {
        id,
        kind: 'file',
        label,
        mediaType: getFileMediaType(file, extension),
        bytes: byteLength,
        included: false,
        warnings: [`Source file "${label}" could not be decoded as UTF-8.`],
      },
      warnings: [`Skipped undecodable source file "${label}".`],
    };
  }

  if (!text) {
    return {
      item: null,
      manifest: {
        id,
        kind: 'file',
        label,
        mediaType: getFileMediaType(file, extension),
        bytes: byteLength,
        included: false,
        warnings: [`Source file "${label}" is empty after trimming.`],
      },
      warnings: [`Skipped empty source file "${label}".`],
    };
  }

  return {
    item: {
      id,
      kind: 'file',
      label,
      mediaType: getFileMediaType(file, extension),
      bytes: byteLength,
      text,
    },
    manifest: {
      id,
      kind: 'file',
      label,
      mediaType: getFileMediaType(file, extension),
      bytes: byteLength,
      included: true,
      warnings: [],
    },
    warnings: [],
  };
}
