import {
  invalidSourceValidation,
  validSourceValidation,
} from './sourceValidationResult.js';

export function normalizeByteLength(value) {
  return Number.isFinite(value) && value >= 0 ? value : null;
}

export function validateByteLength(byteLength, { maxBytes } = {}) {
  const bytes = normalizeByteLength(byteLength) ?? 0;

  if (bytes === 0) {
    return invalidSourceValidation('empty', { bytes });
  }

  if (Number.isFinite(maxBytes) && bytes > maxBytes) {
    return invalidSourceValidation('oversized', { bytes, maxBytes });
  }

  return validSourceValidation({ bytes });
}

export function validateKnownByteLength(byteLength, { maxBytes } = {}) {
  const bytes = normalizeByteLength(byteLength);

  return bytes == null
    ? validSourceValidation({ bytes: null })
    : validateByteLength(bytes, { maxBytes });
}

export function validateTotalByteLength({
  currentBytes,
  additionalBytes,
  maxTotalBytes,
} = {}) {
  const current = normalizeByteLength(currentBytes) ?? 0;
  const additional = normalizeByteLength(additionalBytes) ?? 0;
  const totalBytes = current + additional;

  if (Number.isFinite(maxTotalBytes) && totalBytes > maxTotalBytes) {
    return invalidSourceValidation('total-oversized', {
      currentBytes: current,
      additionalBytes: additional,
      totalBytes,
      maxTotalBytes,
    });
  }

  return validSourceValidation({
    currentBytes: current,
    additionalBytes: additional,
    totalBytes,
  });
}
