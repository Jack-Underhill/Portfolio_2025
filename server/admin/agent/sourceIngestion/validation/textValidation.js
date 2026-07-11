import {
  TEXT_SOURCE_ALLOWED_EXTENSION_SET,
  TEXT_SOURCE_ALLOWED_FILENAME_SET,
  TEXT_SOURCE_DISALLOWED_BINARY_OR_DUMP_EXTENSIONS,
  TEXT_SOURCE_DISALLOWED_SECRET_EXTENSIONS,
  TEXT_SOURCE_DISALLOWED_SECRET_FILENAMES,
  TEXT_SOURCE_GENERATED_BUNDLE_PATTERN,
  TEXT_SOURCE_GENERATED_SOURCE_PATTERN,
} from '../textSourcePolicy.js';
import {
  invalidSourceValidation,
  validSourceValidation,
} from './sourceValidationResult.js';

export function getSourceFileBaseName(name) {
  if (typeof name !== 'string') return '';

  const trimmedName = name.trim().replace(/\\/g, '/');
  const parts = trimmedName
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.at(-1) || '';
}

export function getSourceFileExtension(name) {
  const trimmedName = getSourceFileBaseName(name);
  const lastDotIndex = trimmedName.lastIndexOf('.');

  if (lastDotIndex <= 0 || lastDotIndex === trimmedName.length - 1) {
    return '';
  }

  return trimmedName.slice(lastDotIndex).toLowerCase();
}

export function isSupportedTextSourceFileName(name) {
  const baseName = getSourceFileBaseName(name).toLowerCase();
  return TEXT_SOURCE_ALLOWED_EXTENSION_SET.has(getSourceFileExtension(baseName))
    || TEXT_SOURCE_ALLOWED_FILENAME_SET.has(baseName);
}

export function getDisallowedTextSourceReason(name) {
  const baseName = getSourceFileBaseName(name).toLowerCase();
  const extension = getSourceFileExtension(baseName);

  if (baseName.startsWith('.env.') && baseName !== '.env.example') {
    return 'secret-like source file name';
  }

  if (
    TEXT_SOURCE_DISALLOWED_SECRET_FILENAMES.has(baseName)
    || TEXT_SOURCE_DISALLOWED_SECRET_EXTENSIONS.has(extension)
  ) {
    return 'secret-like source file name';
  }

  if (TEXT_SOURCE_DISALLOWED_BINARY_OR_DUMP_EXTENSIONS.has(extension)) {
    return 'binary or database dump source file type';
  }

  if (
    TEXT_SOURCE_GENERATED_SOURCE_PATTERN.test(baseName)
    || TEXT_SOURCE_GENERATED_BUNDLE_PATTERN.test(baseName)
  ) {
    return 'generated or minified bundle source file name';
  }

  return '';
}

export function validateTextSourceFileName(name) {
  const disallowedReason = getDisallowedTextSourceReason(name);

  if (disallowedReason) {
    return invalidSourceValidation('disallowed', { disallowedReason });
  }

  if (!isSupportedTextSourceFileName(name)) {
    return invalidSourceValidation('unsupported');
  }

  return validSourceValidation();
}
