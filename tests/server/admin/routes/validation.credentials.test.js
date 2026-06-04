import { describe, expect, it } from 'vitest';

import { validateCredentialsState } from '../../../../server/admin/routes/validation.js';

describe('admin credentials validation', () => {
  it('normalizes credential panels and derives sort order from row order', () => {
    expect(validateCredentialsState({
      education: [
        {
          id: ' 4 ',
          kind: 'education',
          title: ' B.S. in Computer Science ',
          org: ' Washington State University ',
          credentialType: " Bachelor's Degree ",
          desc: ' Systems and software curriculum ',
          chips: [' Software Engineering ', '', 'Algorithms'],
          issued: ' 2024-2026 ',
          gpa: ' 3.54 ',
          link: ' https://school.eecs.wsu.edu/ ',
          logoUrl: '',
          logoKey: ' WSU ',
          logoScale: '0.72',
          published: false,
        },
        {
          title: '',
          org: '',
          credentialType: '',
          chips: [''],
          published: false,
        },
      ],
      certifications: [
        {
          id: '0c538061-a5c4-4d55-939e-2a84f234cd3b',
          title: ' Azure Fundamentals ',
          org: ' Microsoft ',
          credentialType: ' Certification ',
          desc: ' Cloud fundamentals ',
          chips: [' Azure ', 'Security'],
          issued: ' 2025 ',
          link: 'https://learn.microsoft.com/',
          logoKey: 'microsoft',
          logoScale: '',
        },
      ],
    })).toEqual({
      education: [
        {
          id: 4,
          kind: 'education',
          title: 'B.S. in Computer Science',
          org: 'Washington State University',
          credentialType: "Bachelor's Degree",
          desc: 'Systems and software curriculum',
          chips: ['Software Engineering', 'Algorithms'],
          issued: '2024-2026',
          gpa: '3.54',
          link: 'https://school.eecs.wsu.edu/',
          logoUrl: '',
          logoKey: 'wsu',
          logoScale: 0.72,
          published: false,
          sortOrder: 0,
        },
      ],
      certifications: [
        {
          id: null,
          kind: 'certification',
          title: 'Azure Fundamentals',
          org: 'Microsoft',
          credentialType: 'Certification',
          desc: 'Cloud fundamentals',
          chips: ['Azure', 'Security'],
          issued: '2025',
          gpa: '',
          link: 'https://learn.microsoft.com/',
          logoUrl: '',
          logoKey: 'microsoft',
          logoScale: 0.7,
          published: true,
          sortOrder: 0,
        },
      ],
    });
  });

  it('drops fully blank rows so empty UI rows do not persist', () => {
    expect(validateCredentialsState({
      education: [
        { title: '', org: '', chips: [''] },
        { title: ' Minor in Mathematics ', org: ' WSU ' },
      ],
      certifications: [
        { title: '', org: '', link: '', logoKey: '' },
      ],
    })).toEqual({
      education: [
        {
          id: null,
          kind: 'education',
          title: 'Minor in Mathematics',
          org: 'WSU',
          credentialType: '',
          desc: '',
          chips: [],
          issued: '',
          gpa: '',
          link: '',
          logoUrl: '',
          logoKey: '',
          logoScale: 0.7,
          published: true,
          sortOrder: 0,
        },
      ],
      certifications: [],
    });
  });

  it('rejects non-blank credentials without required display fields', () => {
    expect(() => validateCredentialsState({
      education: [
        { title: '', org: 'Washington State University' },
      ],
      certifications: [],
    })).toThrow('education credential 1 title is required');

    expect(() => validateCredentialsState({
      education: [],
      certifications: [
        { title: 'Azure Fundamentals', org: '', chips: ['Cloud'] },
      ],
    })).toThrow('certification credential 1 organization is required');
  });

  it('rejects malformed kind, URLs, logo keys, and logo scale', () => {
    expect(() => validateCredentialsState({
      education: [
        { kind: 'certification', title: 'B.S. in CS', org: 'WSU' },
      ],
      certifications: [],
    })).toThrow('education credential 1 kind must be education');

    expect(() => validateCredentialsState({
      education: [],
      certifications: [
        { kind: 'badge', title: 'Azure Fundamentals', org: 'Microsoft' },
      ],
    })).toThrow('certification credential 1 kind must be education or certification');

    expect(() => validateCredentialsState({
      education: [
        { title: 'B.S. in CS', org: 'WSU', link: 'mailto:hello@example.test' },
      ],
      certifications: [],
    })).toThrow('education credential 1 credential URL must use http or https');

    expect(() => validateCredentialsState({
      education: [],
      certifications: [
        { title: 'Azure Fundamentals', org: 'Microsoft', logoKey: 'unknown' },
      ],
    })).toThrow('certification credential 1 logo key must be one of wsu, edcc, microsoft');

    expect(() => validateCredentialsState({
      education: [
        { title: 'B.S. in CS', org: 'WSU', logoScale: 1.5 },
      ],
      certifications: [],
    })).toThrow('education credential 1 logo scale must be between 0.4 and 1.2');
  });

  it('enforces row and highlights limits', () => {
    expect(() => validateCredentialsState({
      education: Array.from({ length: 21 }, (_, index) => ({
        title: `Credential ${index + 1}`,
        org: 'WSU',
      })),
      certifications: [],
    })).toThrow('education credentials must include 20 items or fewer');

    expect(() => validateCredentialsState({
      education: [],
      certifications: [
        {
          title: 'Azure Fundamentals',
          org: 'Microsoft',
          chips: Array.from({ length: 21 }, (_, index) => `Topic ${index + 1}`),
        },
      ],
    })).toThrow('certification credential 1 highlights must include 20 items or fewer');
  });
});
