import { describe, expect, it } from 'vitest';

import { validateContactState } from '../../../../server/admin/routes/validation.js';
import { fakeUploadFile } from './fakeUploadFile.js';

describe('admin contact validation', () => {
  it('normalizes contact links and current legacy skill arrays', () => {
    const iconFile = fakeUploadFile({ name: 'github.svg', type: 'image/svg+xml' });

    expect(validateContactState({
      proficientTechs: [' React ', '', 'Node'],
      experiencingTechs: [' Supabase ', null, 'Vite'],
      socialLinks: [{
        id: '4',
        label: ' GitHub ',
        url: ' https://github.com/example ',
        iconUrl: ' https://cdn.example.test/github.svg ',
        iconFile,
      }],
    })).toEqual({
      proficientTechs: ['React', 'Node'],
      experiencingTechs: ['Supabase', 'Vite'],
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
