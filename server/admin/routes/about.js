import { requireServiceClient } from '../clients/supabaseService.js';
import { getFileExtension } from '../utils/strings.js';
import { uploadAndGetPublicUrl } from '../utils/storage.js';
import {
  applyMultipartFiles,
  getStatePayload,
  parseAdminRequest,
} from './requestBody.js';
import { sendJson, sendRouteError } from './responses.js';
import { validateAboutState } from './validation.js';

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

export async function saveAboutData(state) {
  const validState = validateAboutState(state);
  const client = requireServiceClient();

  let profileImageUrl = validState.profileImageUrl;
  let resumeUrl = validState.resumeUrl;

  if (validState.profileImageFile) {
    const ext = getFileExtension(validState.profileImageFile) || '.png';
    profileImageUrl = await uploadAndGetPublicUrl(
      `about/profile${ext}`,
      validState.profileImageFile,
    );
  }

  if (validState.resumeFile) {
    const ext = getFileExtension(validState.resumeFile) || '.pdf';
    resumeUrl = await uploadAndGetPublicUrl(`docs/resume${ext}`, validState.resumeFile);
  }

  const payload = {
    id: ABOUT_ID,
    profile_image: profileImageUrl,
    profession_title: validState.professionTitle,
    brief_bio: validState.professionBio,
    resume_pdf: resumeUrl,
  };

  const { error } = await client
    .from('about')
    .upsert(payload, { onConflict: 'id' });
  if (error) throw error;

  return {
    ...validState,
    profileImageFile: null,
    profileImageUrl,
    professionTitle: payload.profession_title,
    professionBio: payload.brief_bio,
    resumeFile: null,
    resumeUrl,
  };
}

export async function handleAboutWrite(req, res) {
  try {
    const { body, form } = await parseAdminRequest(req);
    const state = getStatePayload(body, 'about');

    applyMultipartFiles(state, form, [
      {
        names: ['profileImageFile', 'about.profileImageFile'],
        set: (about, file) => {
          about.profileImageFile = file;
        },
      },
      {
        names: ['resumeFile', 'about.resumeFile'],
        set: (about, file) => {
          about.resumeFile = file;
        },
      },
    ]);

    sendJson(res, 200, await saveAboutData(state));
  } catch (error) {
    sendRouteError(res, error);
  }
}
