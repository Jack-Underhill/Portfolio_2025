import { describe, expect, it } from 'vitest';

import {
  normalizeByteLength,
  validateByteLength,
  validateKnownByteLength,
  validateTotalByteLength,
} from '../../../../../../server/admin/agent/sourceIngestion/validation/byteLimitValidation.js';

describe('source byte limit validation', () => {
  it('normalizes finite non-negative byte lengths only', () => {
    expect(normalizeByteLength(0)).toBe(0);
    expect(normalizeByteLength(12)).toBe(12);
    expect(normalizeByteLength(-1)).toBeNull();
    expect(normalizeByteLength(Number.NaN)).toBeNull();
    expect(normalizeByteLength(undefined)).toBeNull();
  });

  it('validates empty and oversized byte lengths', () => {
    expect(validateByteLength(0, { maxBytes: 10 })).toEqual({
      ok: false,
      reason: 'empty',
      bytes: 0,
    });
    expect(validateByteLength(11, { maxBytes: 10 })).toEqual({
      ok: false,
      reason: 'oversized',
      bytes: 11,
      maxBytes: 10,
    });
    expect(validateByteLength(10, { maxBytes: 10 })).toEqual({
      ok: true,
      bytes: 10,
    });
  });

  it('allows unknown known-size preflight values', () => {
    expect(validateKnownByteLength(null, { maxBytes: 10 })).toEqual({
      ok: true,
      bytes: null,
    });
  });

  it('validates accumulated total byte limits', () => {
    expect(validateTotalByteLength({
      currentBytes: 4,
      additionalBytes: 6,
      maxTotalBytes: 10,
    })).toEqual({
      ok: true,
      currentBytes: 4,
      additionalBytes: 6,
      totalBytes: 10,
    });
    expect(validateTotalByteLength({
      currentBytes: 4,
      additionalBytes: 7,
      maxTotalBytes: 10,
    })).toEqual({
      ok: false,
      reason: 'total-oversized',
      currentBytes: 4,
      additionalBytes: 7,
      totalBytes: 11,
      maxTotalBytes: 10,
    });
  });
});
