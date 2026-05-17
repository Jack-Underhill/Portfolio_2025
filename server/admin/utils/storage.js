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

export function buildProjectPreviewImagePath(id, ext) {
  return buildProjectMediaPath(id, 'preview-image', ext);
}

export function buildProjectPreviewVideoPath(id, ext) {
  return buildProjectMediaPath(id, 'preview-video', ext);
}

export function buildProjectArchitecturePath(id, ext) {
  return buildProjectMediaPath(id, 'architecture', ext);
}

function buildProjectMediaPath(id, mediaStem, ext) {
  const projectId = Number(id);
  const validExt = ensureDotExt(ext, '');

  if (!Number.isInteger(projectId) || projectId <= 0) {
    throw new Error('project media path requires a positive project id');
  }

  if (!/^\.[a-z0-9]+$/i.test(validExt)) {
    throw new Error('project media path requires a safe file extension');
  }

  return `projects/${projectId}/${mediaStem}${validExt}`;
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

async function uploadPreviewImageFileForProject(id, file, fallbackExt) {
  if (!file) return null;

  const validExt = ensureDotExt(getFileExtension(file), fallbackExt);
  const path = buildProjectPreviewImagePath(id, validExt);
  return uploadAndGetPublicUrl(path, file);
}

async function uploadVideoFileForProject(id, file, fallbackExt) {
  if (!file) return null;

  const validExt = ensureDotExt(getFileExtension(file), fallbackExt);
  const path = buildProjectPreviewVideoPath(id, validExt);
  return uploadAndGetPublicUrl(path, file);
}

async function uploadArchitectureFileForProject(id, file, fallbackExt) {
  if (!file) return null;

  const validExt = ensureDotExt(getFileExtension(file), fallbackExt);
  const path = buildProjectArchitecturePath(id, validExt);
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
    (await uploadPreviewImageFileForProject(id, imageFile, '.png')) || imageUrl;

  const videoBucketUrl =
    (await uploadVideoFileForProject(id, videoFile, '.mp4')) || videoUrl;

  const architectureImageBucketUrl =
    (await uploadArchitectureFileForProject(id, architectureImageFile, '.svg')) ||
    architectureImageUrl;

  return { imageBucketUrl, videoBucketUrl, architectureImageBucketUrl };
}
