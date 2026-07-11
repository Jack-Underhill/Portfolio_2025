import { describe, expect, it } from 'vitest';

import {
  invalidSourceValidation,
  validSourceValidation,
} from '../../../../../../server/admin/agent/sourceIngestion/validation/sourceValidationResult.js';

describe('source validation result helpers', () => {
  it('creates small valid and invalid result objects with caller metadata', () => {
    expect(validSourceValidation({ bytes: 12 })).toEqual({
      ok: true,
      bytes: 12,
    });
    expect(invalidSourceValidation('oversized', { maxBytes: 10 })).toEqual({
      ok: false,
      reason: 'oversized',
      maxBytes: 10,
    });
  });
});
