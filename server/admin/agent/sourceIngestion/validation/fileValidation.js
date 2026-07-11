import { normalizeByteLength } from './byteLimitValidation.js';
import {
  invalidSourceValidation,
  validSourceValidation,
} from './sourceValidationResult.js';

export function getKnownFileSize(file) {
  return normalizeByteLength(file?.size);
}

export function getReadableFileBytes(file) {
  return typeof file?.arrayBuffer === 'function'
    ? async () => file.arrayBuffer()
    : null;
}

export function validateByteReader(readBytes) {
  return typeof readBytes === 'function'
    ? validSourceValidation({ readBytes })
    : invalidSourceValidation('unreadable');
}

export function validateReadableFile(file) {
  return validateByteReader(getReadableFileBytes(file));
}
