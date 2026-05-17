import { describe, expect, it } from 'vitest';

import { validateAboutState } from '../../../../server/admin/routes/validation.js';
import { fakeUploadFile } from './fakeUploadFile.js';

describe('admin about validation', () => {
  it('maps safe about values and upload metadata without service calls', () => {
    const profileImageFile = fakeUploadFile({ name: 'avatar.PNG', type: 'image/png' });
    const resumeFile = fakeUploadFile({ name: 'resume.pdf', type: 'application/pdf' });

    expect(validateAboutState({
      draftId: 'local-about',
      profileImageFile,
      profileImageUrl: ' https://cdn.example.test/avatar.png ',
      professionTitle: ' Software Engineer ',
      professionBio: ' Builds useful portfolio systems. ',
      resumeFile,
      resumeUrl: ' https://cdn.example.test/resume.pdf ',
    })).toEqual({
      draftId: 'local-about',
      profileImageFile,
      profileImageUrl: 'https://cdn.example.test/avatar.png',
      professionTitle: 'Software Engineer',
      professionBio: 'Builds useful portfolio systems.',
      resumeFile,
      resumeUrl: 'https://cdn.example.test/resume.pdf',
    });
  });
});
