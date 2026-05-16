import { normalizeString } from '../shared/normalize.js';

export function mapAboutRowToPublic(row) {
  if (!row) return null;

  const profileImageUrl = normalizeString(row.profile_image_url ?? row.profile_image);

  return {
    profileImageUrl,
    professionTitle: normalizeString(row.profession_title),
    briefBio: normalizeString(row.brief_bio),
    resumeUrl: normalizeString(row.resume_pdf),
  };
}
