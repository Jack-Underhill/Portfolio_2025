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
import {
  normalizeUploadedZipSourceFile,
  PROJECT_AGENT_SOURCE_ZIP_EXTENSION,
  PROJECT_AGENT_SOURCE_ZIP_ENTRY_MAX_BYTES,
  PROJECT_AGENT_SOURCE_ZIP_MAX_BYTES,
  PROJECT_AGENT_SOURCE_ZIP_MAX_ENTRIES,
  PROJECT_AGENT_SOURCE_ZIP_MAX_INCLUDED_FILES,
  PROJECT_AGENT_SOURCE_ZIP_TOTAL_EXTRACTED_BYTES,
} from './zipSource.js';

export const PROJECT_AGENT_SOURCE_ALLOWED_EXTENSIONS_WITH_RICH_FILES = [
  ...PROJECT_AGENT_SOURCE_ALLOWED_EXTENSIONS,
  PROJECT_AGENT_SOURCE_PDF_EXTENSION,
  PROJECT_AGENT_SOURCE_ZIP_EXTENSION,
];

export {
  PROJECT_AGENT_SOURCE_ALLOWED_EXTENSIONS_WITH_RICH_FILES as PROJECT_AGENT_SOURCE_ALLOWED_EXTENSIONS,
  PROJECT_AGENT_SOURCE_PDF_MAX_BYTES,
  PROJECT_AGENT_SOURCE_PDF_MAX_PAGES,
  PROJECT_AGENT_SOURCE_PDF_MAX_TEXT_LENGTH,
  PROJECT_AGENT_SOURCE_ZIP_ENTRY_MAX_BYTES,
  PROJECT_AGENT_SOURCE_ZIP_MAX_BYTES,
  PROJECT_AGENT_SOURCE_ZIP_MAX_ENTRIES,
  PROJECT_AGENT_SOURCE_ZIP_MAX_INCLUDED_FILES,
  PROJECT_AGENT_SOURCE_ZIP_TOTAL_EXTRACTED_BYTES,
};

export async function normalizeUploadedSourceFile(file, options = {}) {
  const extension = getSourceFileExtension(file?.name);

  if (extension === PROJECT_AGENT_SOURCE_PDF_EXTENSION) {
    return normalizeUploadedPdfSourceFile(file, {
      id: options.id,
      maxBytes: options.maxPdfBytes,
      maxPages: options.maxPdfPages,
      maxTextLength: options.maxPdfTextLength,
    });
  }

  if (extension === PROJECT_AGENT_SOURCE_ZIP_EXTENSION) {
    return normalizeUploadedZipSourceFile(file, {
      id: options.id,
      createId: options.createId,
      maxBytes: options.maxZipBytes,
      maxEntries: options.maxZipEntries,
      maxIncludedFiles: options.maxZipIncludedFiles,
      maxEntryBytes: options.maxZipEntryBytes,
      maxTotalExtractedBytes: options.maxZipTotalExtractedBytes,
      maxPdfPages: options.maxPdfPages,
      maxPdfTextLength: options.maxPdfTextLength,
    });
  }

  return normalizeUploadedTextSourceFile(file, options);
}
