import { PDFParse } from 'pdf-parse';

import { PROJECT_AGENT_SOURCE_PDF_KIND } from './sourceKinds.js';
import {
  PROJECT_AGENT_SOURCE_PDF_MAX_BYTES,
  PROJECT_AGENT_SOURCE_PDF_MAX_PAGES,
  PROJECT_AGENT_SOURCE_PDF_MAX_TEXT_LENGTH,
} from './sourceLimits.js';
import { PROJECT_AGENT_SOURCE_PDF_MEDIA_TYPE } from './sourceMediaTypes.js';
import {
  createIncludedSourceResult,
  createSkippedSourceResult,
} from './sourceResult.js';
import {
  validateByteLength,
  validateKnownByteLength,
} from './validation/byteLimitValidation.js';
import {
  getKnownFileSize,
  validateReadableFile,
} from './validation/fileValidation.js';

export const PROJECT_AGENT_SOURCE_PDF_EXTENSION = '.pdf';
export { PROJECT_AGENT_SOURCE_PDF_MEDIA_TYPE } from './sourceMediaTypes.js';
export {
  PROJECT_AGENT_SOURCE_PDF_MAX_BYTES,
  PROJECT_AGENT_SOURCE_PDF_MAX_PAGES,
  PROJECT_AGENT_SOURCE_PDF_MAX_TEXT_LENGTH,
} from './sourceLimits.js';

function getSafePdfLabel(file) {
  const name = typeof file?.name === 'string' ? file.name.trim() : '';
  return name || 'Unnamed PDF source file';
}

function getFileMediaType(file) {
  return typeof file?.type === 'string' && file.type.trim()
    ? file.type.trim()
    : PROJECT_AGENT_SOURCE_PDF_MEDIA_TYPE;
}

function createSkippedPdfResult({
  id,
  label,
  mediaType,
  bytes,
  manifestWarning,
  warning,
  pages,
}) {
  return createSkippedSourceResult({
    id,
    kind: PROJECT_AGENT_SOURCE_PDF_KIND,
    label,
    mediaType,
    bytes,
    warning,
    manifestWarnings: [manifestWarning],
    manifestMetadata: {
      ...(Number.isFinite(pages) ? { pages } : {}),
    },
  });
}

function formatPdfText({ label, pages }) {
  const pageParts = pages
    .map((page) => {
      const text = typeof page?.text === 'string' ? page.text.trim() : '';

      if (!text) return '';

      return `[Page ${page.num}]\n${text}`;
    })
    .filter(Boolean);

  if (pageParts.length === 0) return '';

  return `[PDF: ${label}]\n${pageParts.join('\n\n')}`.trim();
}

async function extractPdfText(buffer, { maxPages }) {
  const parser = new PDFParse({ data: Buffer.from(buffer) });

  try {
    return await parser.getText({
      first: maxPages,
      pageJoiner: '',
    });
  } finally {
    await parser.destroy();
  }
}

export async function normalizeUploadedPdfSourceFile(file, {
  id,
  maxBytes = PROJECT_AGENT_SOURCE_PDF_MAX_BYTES,
  maxPages = PROJECT_AGENT_SOURCE_PDF_MAX_PAGES,
  maxTextLength = PROJECT_AGENT_SOURCE_PDF_MAX_TEXT_LENGTH,
} = {}) {
  const label = getSafePdfLabel(file);
  const mediaType = getFileMediaType(file);
  const size = getKnownFileSize(file);
  const knownByteValidation = validateKnownByteLength(size, { maxBytes });

  if (!knownByteValidation.ok && knownByteValidation.reason === 'empty') {
    return createSkippedPdfResult({
      id,
      label,
      mediaType,
      bytes: 0,
      manifestWarning: `PDF source file "${label}" is empty.`,
      warning: `Skipped empty PDF source file "${label}".`,
    });
  }

  if (!knownByteValidation.ok && knownByteValidation.reason === 'oversized') {
    return createSkippedPdfResult({
      id,
      label,
      mediaType,
      bytes: size,
      manifestWarning: `PDF source file "${label}" exceeds the ${maxBytes} byte limit.`,
      warning: `Skipped oversized PDF source file "${label}".`,
    });
  }

  const readableValidation = validateReadableFile(file);

  if (!readableValidation.ok) {
    return createSkippedPdfResult({
      id,
      label,
      mediaType,
      bytes: size ?? 0,
      manifestWarning: `PDF source file "${label}" could not be read.`,
      warning: `Skipped unreadable PDF source file "${label}".`,
    });
  }

  let buffer;

  try {
    buffer = await readableValidation.readBytes();
  } catch {
    return createSkippedPdfResult({
      id,
      label,
      mediaType,
      bytes: size ?? 0,
      manifestWarning: `PDF source file "${label}" could not be read.`,
      warning: `Skipped unreadable PDF source file "${label}".`,
    });
  }

  const byteLength = buffer.byteLength ?? size ?? 0;
  const actualByteValidation = validateByteLength(byteLength, { maxBytes });

  if (!actualByteValidation.ok && actualByteValidation.reason === 'empty') {
    return createSkippedPdfResult({
      id,
      label,
      mediaType,
      bytes: 0,
      manifestWarning: `PDF source file "${label}" is empty.`,
      warning: `Skipped empty PDF source file "${label}".`,
    });
  }

  if (!actualByteValidation.ok && actualByteValidation.reason === 'oversized') {
    return createSkippedPdfResult({
      id,
      label,
      mediaType,
      bytes: byteLength,
      manifestWarning: `PDF source file "${label}" exceeds the ${maxBytes} byte limit.`,
      warning: `Skipped oversized PDF source file "${label}".`,
    });
  }

  let result;

  try {
    result = await extractPdfText(buffer, { maxPages });
  } catch {
    return createSkippedPdfResult({
      id,
      label,
      mediaType,
      bytes: byteLength,
      manifestWarning: `PDF source file "${label}" could not be extracted as text.`,
      warning: `Skipped unreadable PDF source file "${label}".`,
    });
  }

  const pages = Number.isFinite(result?.total) ? result.total : undefined;
  let text = formatPdfText({
    label,
    pages: Array.isArray(result?.pages) ? result.pages : [],
  });

  if (!text) {
    const noTextWarning = `PDF source file "${label}" did not contain extractable text. It may be scanned/image-only.`;
    return createSkippedPdfResult({
      id,
      label,
      mediaType,
      bytes: byteLength,
      pages,
      manifestWarning: noTextWarning,
      warning: `Skipped PDF source file "${label}" because no extractable text was found.`,
    });
  }

  const warnings = [];
  const manifestWarnings = [];

  if (pages > maxPages) {
    const pageLimitWarning = `PDF source file "${label}" has ${pages} pages; only the first ${maxPages} pages were extracted.`;
    warnings.push(pageLimitWarning);
    manifestWarnings.push(pageLimitWarning);
  }

  const isTextTruncated = text.length > maxTextLength;

  if (isTextTruncated) {
    text = text.slice(0, maxTextLength).trimEnd();
    const textLimitWarning = `Truncated extracted PDF text from "${label}" to ${maxTextLength} characters.`;
    warnings.push(textLimitWarning);
    manifestWarnings.push(textLimitWarning);
  }

  return createIncludedSourceResult({
    id,
    kind: PROJECT_AGENT_SOURCE_PDF_KIND,
    label,
    mediaType,
    bytes: byteLength,
    text,
    warnings,
    manifestWarnings,
    manifestMetadata: {
      ...(Number.isFinite(pages) ? { pages } : {}),
      ...(isTextTruncated ? { truncated: true } : {}),
    },
  });
}
