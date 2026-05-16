import { describe, expect, it } from 'vitest';

import { BadRequestError } from '../../../../server/admin/routes/requestBody.js';
import {
  optionalHttpUrl,
  optionalPositiveInteger,
  optionalString,
} from '../../../../server/admin/routes/validation.js';

describe('admin validation helper primitives', () => {
  it('trims optional strings and enforces the configured length limit', () => {
    expect(optionalString('  Portfolio admin  ', 'title', 20)).toBe('Portfolio admin');
    expect(optionalString(null, 'title', 20)).toBe('');

    expect(() => optionalString('too long', 'title', 3)).toThrow(BadRequestError);
    expect(() => optionalString(42, 'title', 20)).toThrow('title must be a string');
  });

  it('accepts only optional http and https URLs', () => {
    expect(optionalHttpUrl(' https://example.test/path ', 'asset URL')).toBe(
      'https://example.test/path',
    );
    expect(optionalHttpUrl('http://localhost:8787/admin-api', 'asset URL')).toBe(
      'http://localhost:8787/admin-api',
    );
    expect(optionalHttpUrl('', 'asset URL')).toBe('');

    expect(() => optionalHttpUrl('not a url', 'asset URL')).toThrow(
      'asset URL must be a valid URL',
    );
    expect(() => optionalHttpUrl('ftp://example.test/file', 'asset URL')).toThrow(
      'asset URL must use http or https',
    );
  });

  it('normalizes optional positive integer input', () => {
    expect(optionalPositiveInteger(7, 'project id')).toBe(7);
    expect(optionalPositiveInteger('8', 'project id')).toBe(8);
    expect(optionalPositiveInteger(null, 'project id')).toBeNull();
    expect(optionalPositiveInteger('', 'project id')).toBeNull();

    expect(() => optionalPositiveInteger(0, 'project id')).toThrow(
      'project id must be a positive integer',
    );
    expect(() => optionalPositiveInteger('2.5', 'project id')).toThrow(
      'project id must be a positive integer',
    );
  });
});
