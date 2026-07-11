import { describe, expect, it } from 'vitest';

import {
  getKnownFileSize,
  getReadableFileBytes,
  validateByteReader,
  validateReadableFile,
} from '../../../../../../server/admin/agent/sourceIngestion/validation/fileValidation.js';

describe('source file validation', () => {
  it('normalizes finite non-negative file sizes', () => {
    expect(getKnownFileSize({ size: 0 })).toBe(0);
    expect(getKnownFileSize({ size: 24 })).toBe(24);
    expect(getKnownFileSize({ size: -1 })).toBeNull();
    expect(getKnownFileSize({ size: Number.NaN })).toBeNull();
  });

  it('detects readable file-like objects', async () => {
    const bytes = new Uint8Array([1, 2, 3]);
    const file = {
      arrayBuffer: async () => bytes.buffer,
    };
    const readBytes = getReadableFileBytes(file);

    expect(typeof readBytes).toBe('function');
    await expect(readBytes()).resolves.toBe(bytes.buffer);
    expect(validateReadableFile(file).ok).toBe(true);
    await expect(validateReadableFile(file).readBytes()).resolves.toBe(bytes.buffer);
    expect(validateByteReader(readBytes)).toEqual({ ok: true, readBytes });
  });

  it('reports unreadable file-like objects factually', () => {
    expect(getReadableFileBytes({})).toBeNull();
    expect(validateByteReader(null)).toEqual({
      ok: false,
      reason: 'unreadable',
    });
    expect(validateByteReader('not a reader')).toEqual({
      ok: false,
      reason: 'unreadable',
    });
    expect(validateReadableFile({})).toEqual({
      ok: false,
      reason: 'unreadable',
    });
  });
});
