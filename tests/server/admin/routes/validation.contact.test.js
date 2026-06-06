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

  it('allows mailto contact link URLs', () => {
    expect(validateContactState({
      socialLinks: [{
        label: 'Email',
        url: ' mailto:hello@example.test ',
      }, {
        label: 'Email with subject',
        url: 'mailto:hello@example.test?subject=Portfolio%20Contact',
      }],
    })).toEqual({
      socialLinks: [{
        id: null,
        label: 'Email',
        url: 'mailto:hello@example.test',
        iconUrl: '',
        iconFile: null,
        published: true,
      }, {
        id: null,
        label: 'Email with subject',
        url: 'mailto:hello@example.test?subject=Portfolio%20Contact',
        iconUrl: '',
        iconFile: null,
        published: true,
      }],
    });
  });

  it('rejects mailto contact link URLs without a recipient', () => {
    expect(() => validateContactState({
      socialLinks: [{
        label: 'Email',
        url: 'mailto:?subject=Portfolio%20Contact',
      }],
    })).toThrow('social link 1 URL mailto link must include an email address');
  });

  it('keeps social icon URLs limited to http or https', () => {
    expect(() => validateContactState({
      socialLinks: [{
        label: 'Email',
        url: 'mailto:hello@example.test',
        iconUrl: 'mailto:icons@example.test',
      }],
    })).toThrow('social link 1 icon URL must use http or https');
  });

  it('treats temporary UUID contact link ids as unsaved rows', () => {
    expect(validateContactState({
      socialLinks: [{
        id: 'c4f90439-a188-4b8d-8a33-6f4682d1c654',
        label: 'Website',
        url: 'https://example.test',
      }],
    })).toEqual({
      socialLinks: [{
        id: null,
        label: 'Website',
        url: 'https://example.test',
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
