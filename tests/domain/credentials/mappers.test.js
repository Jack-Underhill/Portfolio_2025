import { describe, expect, it } from 'vitest';

import { DEFAULT_CREDENTIALS } from '../../../src/domain/credentials/defaults.js';
import { mapCredentialRowsToPublic } from '../../../src/domain/credentials/mappers.js';

describe('credentials public mapper', () => {
  it('keeps static fallback credentials in the public section shape', () => {
    expect(DEFAULT_CREDENTIALS.education[0]).toMatchObject({
      kind: 'education',
      title: 'B.S. in Computer Science',
      org: 'Washington State University',
      credentialType: 'Bachelor’s Degree',
      gpa: '3.54',
      logoKey: 'wsu',
      sortOrder: 0,
    });

    expect(DEFAULT_CREDENTIALS.certifications[0]).toMatchObject({
      kind: 'certification',
      title: 'Azure Fundamentals',
      org: 'Microsoft',
      credentialType: 'Certification',
      logoKey: 'microsoft',
      sortOrder: 0,
    });
  });

  it('splits education and certification rows into card-friendly view models', () => {
    expect(mapCredentialRowsToPublic([
      {
        id: 12,
        credential_kind: ' certification ',
        title: ' Azure Fundamentals ',
        organization: ' Microsoft ',
        credential_type: ' Certification ',
        description: ' Core cloud concepts ',
        highlights: [' Azure ', ' ', 'NULL', 'Identity'],
        issued_label: ' 2025 ',
        credential_url: ' https://learn.microsoft.com/cert ',
        logo_url: ' https://example.com/logo.png ',
        logo_key: ' microsoft ',
        logo_scale: '0.62',
        sort_order: '1',
        published: true,
      },
      {
        id: 4,
        credential_kind: 'education',
        title: ' Minor in Mathematics ',
        organization: ' Washington State University ',
        credential_type: ' Minor ',
        description: ' Proof-focused foundation ',
        highlights: ['Calculus', 'Graph Theory'],
        issued_label: ' 2024-2026 ',
        gpa: ' 3.54 ',
        credential_url: ' https://math.wsu.edu/minors/ ',
        logo_url: null,
        logo_key: ' wsu ',
        logo_scale: 0.72,
        sort_order: 0,
        published: true,
      },
    ])).toEqual({
      education: [
        {
          id: 4,
          kind: 'education',
          title: 'Minor in Mathematics',
          org: 'Washington State University',
          credentialType: 'Minor',
          desc: 'Proof-focused foundation',
          chips: ['Calculus', 'Graph Theory'],
          issued: '2024-2026',
          gpa: '3.54',
          link: 'https://math.wsu.edu/minors/',
          logoUrl: null,
          logoKey: 'wsu',
          logoScale: 0.72,
          sortOrder: 0,
        },
      ],
      certifications: [
        {
          id: 12,
          kind: 'certification',
          title: 'Azure Fundamentals',
          org: 'Microsoft',
          credentialType: 'Certification',
          desc: 'Core cloud concepts',
          chips: ['Azure', 'Identity'],
          issued: '2025',
          gpa: '',
          link: 'https://learn.microsoft.com/cert',
          logoUrl: 'https://example.com/logo.png',
          logoKey: 'microsoft',
          logoScale: 0.62,
          sortOrder: 1,
        },
      ],
    });
  });

  it('filters invalid kinds, unpublished rows, blank titles, and blank organizations', () => {
    expect(mapCredentialRowsToPublic([
      {
        credential_kind: 'award',
        title: 'Ignored Award',
        organization: 'Example',
        published: true,
      },
      {
        credential_kind: 'education',
        title: 'Hidden Degree',
        organization: 'Example',
        published: false,
      },
      {
        credential_kind: 'education',
        title: ' ',
        organization: 'Example',
        published: true,
      },
      {
        credential_kind: 'certification',
        title: 'Missing Organization',
        organization: 'NULL',
        published: true,
      },
      {
        credential_kind: 'certification',
        title: 'Visible Certificate',
        organization: 'Example',
        published: true,
      },
    ])).toEqual({
      education: [],
      certifications: [
        {
          id: undefined,
          kind: 'certification',
          title: 'Visible Certificate',
          org: 'Example',
          credentialType: '',
          desc: '',
          chips: [],
          issued: '',
          gpa: '',
          link: '',
          logoUrl: null,
          logoKey: null,
          logoScale: 0.7,
          sortOrder: 0,
        },
      ],
    });
  });

  it('clamps logo scale and defaults invalid scale values', () => {
    expect(mapCredentialRowsToPublic([
      {
        id: 1,
        credential_kind: 'education',
        title: 'Tiny Logo',
        organization: 'Example',
        logo_scale: 0.1,
        sort_order: 2,
        published: true,
      },
      {
        id: 2,
        credential_kind: 'education',
        title: 'Huge Logo',
        organization: 'Example',
        logo_scale: 2,
        sort_order: 0,
        published: true,
      },
      {
        id: 3,
        credential_kind: 'education',
        title: 'Default Logo',
        organization: 'Example',
        logo_scale: 'not a number',
        sort_order: 1,
        published: true,
      },
    ])?.education.map((item) => ({
      title: item.title,
      logoScale: item.logoScale,
    }))).toEqual([
      { title: 'Huge Logo', logoScale: 1.2 },
      { title: 'Default Logo', logoScale: 0.7 },
      { title: 'Tiny Logo', logoScale: 0.4 },
    ]);
  });

  it('sorts each credential kind by sort order then database id', () => {
    expect(mapCredentialRowsToPublic([
      {
        id: 7,
        credential_kind: 'certification',
        title: 'Later Certificate',
        organization: 'Example',
        sort_order: 1,
        published: true,
      },
      {
        id: 9,
        credential_kind: 'education',
        title: 'Second Degree',
        organization: 'Example',
        sort_order: 0,
        published: true,
      },
      {
        id: 3,
        credential_kind: 'education',
        title: 'First Degree',
        organization: 'Example',
        sort_order: 0,
        published: true,
      },
      {
        id: 2,
        credential_kind: 'certification',
        title: 'First Certificate',
        organization: 'Example',
        sort_order: 0,
        published: true,
      },
    ])).toMatchObject({
      education: [
        { id: 3, title: 'First Degree', sortOrder: 0 },
        { id: 9, title: 'Second Degree', sortOrder: 0 },
      ],
      certifications: [
        { id: 2, title: 'First Certificate', sortOrder: 0 },
        { id: 7, title: 'Later Certificate', sortOrder: 1 },
      ],
    });
  });

  it('returns null for fallback-ready empty output', () => {
    expect(mapCredentialRowsToPublic([
      {
        credential_kind: 'education',
        title: 'Hidden',
        organization: 'Example',
        published: false,
      },
    ])).toBeNull();

    expect(mapCredentialRowsToPublic('education')).toBeNull();
    expect(mapCredentialRowsToPublic()).toBeNull();
  });
});
