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
      }],
    })).toEqual({
      socialLinks: [{
        id: 4,
        label: 'GitHub',
        url: 'https://github.com/example',
        iconUrl: 'https://cdn.example.test/github.svg',
        iconFile,
      }],
    });
  });
});
