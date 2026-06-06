import { describe, expect, it } from 'vitest';

import { validateContactState } from '../../../../server/admin/routes/validation.js';
import { fakeUploadFile } from './fakeUploadFile.js';

describe('admin contact validation', () => {
  it('normalizes contact links', () => {
    const iconFile = fakeUploadFile({ name: 'github.svg', type: 'image/svg+xml' });

    expect(validateContactState({
      socialLinks: [{
        id: '4',
        label: ' GitHub ',
        url: ' https://github.com/example ',
        iconUrl: ' https://cdn.example.test/github.svg ',
        iconFile,
        published: false,
      }],
    })).toEqual({
      socialLinks: [{
        id: 4,
        label: 'GitHub',
        url: 'https://github.com/example',
        iconUrl: 'https://cdn.example.test/github.svg',
        iconFile,
        published: false,
      }],
    });
  });

  it('defaults missing contact link published state to true', () => {
    expect(validateContactState({
      socialLinks: [{
        label: 'LinkedIn',
        url: 'https://linkedin.example.test/profile',
      }],
    })).toEqual({
      socialLinks: [{
        id: null,
        label: 'LinkedIn',
        url: 'https://linkedin.example.test/profile',
        iconUrl: '',
        iconFile: null,
        published: true,
      }],
    });
  });

  it('rejects non-boolean contact link published state', () => {
    expect(() => validateContactState({
      socialLinks: [{
        label: 'GitHub',
        url: 'https://github.com/example',
        published: 'false',
      }],
    })).toThrow('social link 1 published must be a boolean');
  });
});
