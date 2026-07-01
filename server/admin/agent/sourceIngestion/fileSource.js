import {
  normalizeUploadedTextSourceFile,
  PROJECT_AGENT_SOURCE_ALLOWED_EXTENSIONS,
  getSourceFileExtension,
} from './textSource.js';
import {
  normalizeUploadedPdfSourceFile,
  PROJECT_AGENT_SOURCE_PDF_EXTENSION,
  PROJECT_AGENT_SOURCE_PDF_MAX_BYTES,
  PROJECT_AGENT_SOURCE_PDF_MAX_PAGES,
  PROJECT_AGENT_SOURCE_PDF_MAX_TEXT_LENGTH,
} from './pdfSource.js';

export const PROJECT_AGENT_SOURCE_ALLOWED_EXTENSIONS_WITH_PDF = [
  ...PROJECT_AGENT_SOURCE_ALLOWED_EXTENSIONS,
  PROJECT_AGENT_SOURCE_PDF_EXTENSION,
];

export {
  PROJECT_AGENT_SOURCE_ALLOWED_EXTENSIONS_WITH_PDF as PROJECT_AGENT_SOURCE_ALLOWED_EXTENSIONS,
  PROJECT_AGENT_SOURCE_PDF_MAX_BYTES,
  PROJECT_AGENT_SOURCE_PDF_MAX_PAGES,
  PROJECT_AGENT_SOURCE_PDF_MAX_TEXT_LENGTH,
};

export async function normalizeUploadedSourceFile(file, options = {}) {
  if (getSourceFileExtension(file?.name) === PROJECT_AGENT_SOURCE_PDF_EXTENSION) {
    return normalizeUploadedPdfSourceFile(file, {
      id: options.id,
      maxBytes: options.maxPdfBytes,
      maxPages: options.maxPdfPages,
      maxTextLength: options.maxPdfTextLength,
    });
  }

  return normalizeUploadedTextSourceFile(file, options);
}
