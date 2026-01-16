import { BUCKET, requireClient } from "../supabaseAdminClient.js";
import { slugify, getFileExtension } from "./strings";

export function ensureDotExt(ext, fallback) {
    const e = (ext || '').trim();

    if (e && e.startsWith('.')) return e;
    if (e) return `.${e}`;

    return fallback;
};

export function makePermalink(id, titleAtCreation) {
    const suffix = slugify(titleAtCreation, `project-${id}`);
    return `${id}-${suffix}`;
};

export async function uploadAndGetPublicUrl(path, file) {
    const client = requireClient();

    const { error: uploadError } = await client.storage.from(BUCKET).upload(path, file, { upsert: true });
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = client.storage.from(BUCKET).getPublicUrl(path);
    return publicUrlData?.publicUrl || '';
}

// Uploads use id-based paths (stable even if title changes)
async function uploadMediaFileForProject(id, file, ext) {
    if (file) {
        const validExt = ensureDotExt(getFileExtension(file), ext);
        const path = `projects/${id}/preview${validExt}`;
        return await uploadAndGetPublicUrl(path, file);
    }

    return null;
}

export async function resolveProjectMediaUrls(
    id, 
    imageFile, imageUrl, 
    videoFile, videoUrl, 
    architectureImageFile, architectureImageUrl
) {
    const imageBucketUrl = 
        await uploadMediaFileForProject(id, imageFile, '.png') 
        || imageUrl;

    const videoBucketUrl = 
        await uploadMediaFileForProject(id, videoFile, '.mp4') 
        || videoUrl;

    const architectureImageBucketUrl = 
        await uploadMediaFileForProject(id, architectureImageFile, '.svg') 
        || architectureImageUrl;

    return { imageBucketUrl, videoBucketUrl, architectureImageBucketUrl };
}