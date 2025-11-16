import { supabaseAdmin, BUCKET } from './supabaseAdminClient';

const ABOUT_ID = 1; // treat "about" as a singleton row with id = 1

function requireClient() {
    if (!supabaseAdmin) {
        throw new Error('Supabase admin client is not configured');
    }
    return supabaseAdmin;
}

function getFileExtension(file) {
    if (!file?.name) return '';
    const dot = file.name.lastIndexOf('.');
    return dot === -1 ? '' : file.name.slice(dot); // includes the leading "."
}

/**
 * Load About data from Supabase and map into your admin state shape.
 */
export async function loadAbout() {
    const client = requireClient();

    const { data, error } = await client
        .from('about')
        .select('*')
        .eq('id', ABOUT_ID)
        .maybeSingle();

    if (error) throw error;

    if (!data) {
        return {
            profileImageFile:   null,
            profileImageUrl:    '',
            professionTitle:    '',
            professionBio:      '',
            resumeFile:         null,
            resumeUrl:          '',
        };
    }

    return {
        profileImageFile:   null,
        profileImageUrl:    data.profile_image ?? '',
        professionTitle:    data.profession_title ?? '',
        professionBio:      data.brief_bio ?? '',
        resumeFile:         null,
        resumeUrl:          data.resume_pdf ?? '',
    };
}

/**
 * Save About data:
 * - uploads new profile image / resume if provided
 * - upserts the "about" row
 * - returns the updated state (with file fields cleared and URLs filled)
 */
export async function saveAbout(state) {
    const client = requireClient();

    let profileImageUrl = state.profileImageUrl;
    let resumeUrl       = state.resumeUrl;

    // --- upload profile image if user picked a new file ---
    if (state.profileImageFile) {
        const ext = getFileExtension(state.profileImageFile) || '.png';
        const path = `about/profile${ext}`;

        const { error: uploadError } = await client.storage
            .from(BUCKET)
            .upload(path, state.profileImageFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = client.storage
            .from(BUCKET)
            .getPublicUrl(path);

        profileImageUrl = publicUrlData.publicUrl;
    }

    // --- upload resume PDF if user picked a new file ---
    if (state.resumeFile) {
        const ext = getFileExtension(state.resumeFile) || '.pdf';
        const path = `docs/resume${ext}`;

        const { error: uploadError } = await client.storage
            .from(BUCKET)
            .upload(path, state.resumeFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = client.storage
            .from(BUCKET)
            .getPublicUrl(path);

        resumeUrl = publicUrlData.publicUrl;
    }

    // --- upsert into about table ---
    const payload = {
        id:                 ABOUT_ID,
        profile_image:      profileImageUrl,
        profession_title:   state.professionTitle,
        brief_bio:          state.professionBio,
        resume_pdf:         resumeUrl,
    };

    const { error: upsertError } = await client
        .from('about')
        .upsert(payload, { onConflict: 'id' });

    if (upsertError) throw upsertError;

    // return a cleaned-up state object for React
    return {
        ...state,
        profileImageFile: null,
        profileImageUrl,
        resumeFile: null,
        resumeUrl,
    };
}
