import { BUCKET, requireServiceClient } from '../clients/supabaseService.js';
import { getFileExtension, slugify } from './strings.js';

export function ensureDotExt(ext, fallback) {
  const value = (ext || '').trim();

  if (value && value.startsWith('.')) return value;
  if (value) return `.${value}`;

  return fallback;
}

export function makePermalink(id, titleAtCreation) {
  const suffix = slugify(titleAtCreation, `project-${id}`);
  return `${id}-${suffix}`;
}

export async function uploadAndGetPublicUrl(path, file) {
  const client = requireServiceClient();

  const { error: uploadError } = await client.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;

  const { data: publicUrlData } = client.storage
    .from(BUCKET)
    .getPublicUrl(path);
  return publicUrlData?.publicUrl || '';
}

async function uploadMediaFileForProject(id, file, fallbackExt) {
  if (!file) return null;

  const validExt = ensureDotExt(getFileExtension(file), fallbackExt);
  const path = `projects/${id}/preview${validExt}`;
  return uploadAndGetPublicUrl(path, file);
}

export async function resolveProjectMediaUrls(
  id,
  imageFile,
  imageUrl,
  videoFile,
  videoUrl,
  architectureImageFile,
  architectureImageUrl,
) {
  const imageBucketUrl =
    (await uploadMediaFileForProject(id, imageFile, '.png')) || imageUrl;

  const videoBucketUrl =
    (await uploadMediaFileForProject(id, videoFile, '.mp4')) || videoUrl;

  const architectureImageBucketUrl =
    (await uploadMediaFileForProject(id, architectureImageFile, '.svg')) ||
    architectureImageUrl;

  return { imageBucketUrl, videoBucketUrl, architectureImageBucketUrl };
}
