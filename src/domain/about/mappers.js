import { normalizeString } from '../shared/normalize.js';

export function mapAboutRowToPublic(row) {
  if (!row) return null;

  return {
    profileImage: normalizeString(row.profile_image),
    professionTitle: normalizeString(row.profession_title),
    briefBio: normalizeString(row.brief_bio),
    resumeUrl: normalizeString(row.resume_pdf),
  };
}
