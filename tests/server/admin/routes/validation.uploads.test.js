import { describe, expect, it } from 'vitest';

import {
  FILE_LIMITS,
  validateUploadFile,
} from '../../../../server/admin/routes/validation.js';
import { fakeUploadFile } from './fakeUploadFile.js';

describe('admin upload validation', () => {
  it('validates upload file size and MIME allowlists with minimal file objects', () => {
    const image = fakeUploadFile({ name: 'architecture.svg', type: 'image/svg+xml' });
    const pdfByExtension = fakeUploadFile({
      name: 'resume.pdf',
      type: 'application/octet-stream',
    });

    expect(validateUploadFile(image, 'architecture image', FILE_LIMITS.image)).toBe(image);
    expect(validateUploadFile(pdfByExtension, 'resume PDF', FILE_LIMITS.pdf)).toBe(
      pdfByExtension,
    );
    expect(validateUploadFile(null, 'architecture image', FILE_LIMITS.image)).toBeNull();

    expect(() => validateUploadFile(
      fakeUploadFile({ name: 'large.png', size: FILE_LIMITS.image.maxBytes + 1 }),
      'architecture image',
      FILE_LIMITS.image,
    )).toThrow('architecture image must be 5 MB or smaller');

    expect(() => validateUploadFile(
      fakeUploadFile({ name: 'notes.txt', type: 'text/plain' }),
      'architecture image',
      FILE_LIMITS.image,
    )).toThrow('architecture image must be an allowed file type');

    expect(() => validateUploadFile(
      { name: 'no-buffer.png', size: 10, type: 'image/png' },
      'architecture image',
      FILE_LIMITS.image,
    )).toThrow('architecture image must be an uploaded file');
  });
});
