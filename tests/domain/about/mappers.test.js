import { describe, expect, it } from 'vitest';

import { mapAboutRowToPublic } from '../../../src/domain/about/mappers.js';
import { mergeAboutData } from '../../../src/domain/about/viewModel.js';

describe('about public mapper', () => {
  it('maps database about rows to the public about shape', () => {
    expect(mapAboutRowToPublic({
      profile_image_url: ' https://cdn.example.test/profile.png ',
      profession_title: ' Full-Stack Developer ',
      brief_bio: ' Builds public-safe portfolio systems. ',
      resume_pdf: ' https://cdn.example.test/resume.pdf ',
    })).toEqual({
      profileImageUrl: 'https://cdn.example.test/profile.png',
      professionTitle: 'Full-Stack Developer',
      briefBio: 'Builds public-safe portfolio systems.',
      resumeUrl: 'https://cdn.example.test/resume.pdf',
    });
  });

  it('keeps the current profile_image database column as a supported source', () => {
    expect(mapAboutRowToPublic({
      profile_image: ' https://cdn.example.test/current-profile.png ',
    })).toMatchObject({
      profileImageUrl: 'https://cdn.example.test/current-profile.png',
    });
  });

  it('returns safe empty strings for null or missing about row values', () => {
    expect(mapAboutRowToPublic({})).toEqual({
      profileImageUrl: '',
      professionTitle: '',
      briefBio: '',
      resumeUrl: '',
    });

    expect(mapAboutRowToPublic(null)).toBeNull();
  });
});

describe('about hero fallback merge', () => {
  it('preserves previous Hero values when public about data is missing or partial', () => {
    const previous = {
      professionTitle: 'Fallback title',
      briefBio: 'Fallback bio',
      profileImageUrl: '/fallback-profile.png',
      resumeUrl: '/fallback-resume.pdf',
    };

    expect(mergeAboutData({
      professionTitle: 'Public title',
      briefBio: '',
      profileImageUrl: null,
    }, previous)).toEqual({
      professionTitle: 'Public title',
      briefBio: 'Fallback bio',
      profileImageUrl: '/fallback-profile.png',
      resumeUrl: '/fallback-resume.pdf',
    });
  });

  it('returns a complete renderable shape when both inputs are sparse', () => {
    expect(mergeAboutData(null, {})).toEqual({
      professionTitle: '',
      briefBio: '',
      profileImageUrl: '',
      resumeUrl: '',
    });
  });
});
