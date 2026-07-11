import { describe, expect, it } from 'vitest';

import {
  getDisallowedTextSourceReason,
  getSourceFileExtension,
  isSupportedTextSourceFileName,
  validateTextSourceFileName,
} from '../../../../../../server/admin/agent/sourceIngestion/validation/textValidation.js';

describe('source text filename validation', () => {
  it('uses the final path segment for extension and filename support checks', () => {
    expect(getSourceFileExtension('bundle.zip / src/App.tsx')).toBe('.tsx');
    expect(getSourceFileExtension('bundle.zip / Dockerfile')).toBe('');
    expect(isSupportedTextSourceFileName('bundle.zip / Dockerfile')).toBe(true);
  });

  it('reports disallowed text filenames with factual reasons', () => {
    expect(getDisallowedTextSourceReason('.env.local')).toBe('secret-like source file name');
    expect(validateTextSourceFileName('private.key')).toEqual({
      ok: false,
      reason: 'disallowed',
      disallowedReason: 'secret-like source file name',
    });
    expect(validateTextSourceFileName('database.sqlite')).toEqual({
      ok: false,
      reason: 'disallowed',
      disallowedReason: 'binary or database dump source file type',
    });
    expect(validateTextSourceFileName('client.bundle.css')).toEqual({
      ok: false,
      reason: 'disallowed',
      disallowedReason: 'generated or minified bundle source file name',
    });
  });

  it('separates supported, unsupported, and safe dotfile names', () => {
    expect(validateTextSourceFileName('README')).toEqual({ ok: true });
    expect(validateTextSourceFileName('.env.example')).toEqual({ ok: true });
    expect(validateTextSourceFileName('logo.png')).toEqual({
      ok: false,
      reason: 'unsupported',
    });
  });
});
