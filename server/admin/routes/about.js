import { requireServiceClient } from '../clients/supabaseService.js';
import { sendJson, sendRouteError } from './responses.js';

const ABOUT_ID = 1;

export async function loadAboutData() {
  const client = requireServiceClient();

  const { data, error } = await client
    .from('about')
    .select('*')
    .eq('id', ABOUT_ID)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    return {
      profileImageFile: null,
      profileImageUrl: '',
      professionTitle: '',
      professionBio: '',
      resumeFile: null,
      resumeUrl: '',
    };
  }

  return {
    profileImageFile: null,
    profileImageUrl: data.profile_image ?? '',
    professionTitle: data.profession_title ?? '',
    professionBio: data.brief_bio ?? '',
    resumeFile: null,
    resumeUrl: data.resume_pdf ?? '',
  };
}

export async function handleAboutRead(_req, res) {
  try {
    sendJson(res, 200, await loadAboutData());
  } catch (error) {
    sendRouteError(res, error);
  }
}
