import { requireServiceClient } from '../clients/supabaseService.js';
import { makePermalink, resolveProjectMediaUrls } from '../utils/storage.js';
import { flattenTechStack, normalizeStringArray } from '../utils/strings.js';
import { PROJECT_TECH_STACK_KEYS } from '../../../src/domain/projects/constants.js';
import {
  applyMultipartFiles,
  BadRequestError,
  getStatePayload,
  parseAdminRequest,
} from './requestBody.js';
import { sendJson, sendRouteError } from './responses.js';
import { validateProjectsState } from './validation.js';

const PROJECT_SECTION_ID = 1;

export async function loadProjectsData() {
  const client = requireServiceClient();

  const [
    { data: section, error: sectionError },
    { data: cards, error: cardsError },
  ] = await Promise.all([
    client
      .from('project_section')
      .select('*')
      .eq('id', PROJECT_SECTION_ID)
      .maybeSingle(),
    client
      .from('projects')
      .select('id, permalink, image_url, video_url, title, card_description, live_url, overview, role, source_url, writeup_url, video_page_url, architecture_image_url, tech_stack, tech_tags, features, metrics, challenges, improvements, published, sort_order')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true }),
  ]);

  if (sectionError) throw sectionError;
  if (cardsError) throw cardsError;

  return {
    projectBio: section?.about_projects || '',
    projects: (cards || []).map((row) => dbRowToUiProject(row)),
  };
}

export async function handleProjectsRead(_req, res) {
  try {
    sendJson(res, 200, await loadProjectsData());
  } catch (error) {
    sendRouteError(res, error);
  }
}

export async function saveProjectsData(state) {
  const validState = validateProjectsState(state);
  const client = requireServiceClient();

  const projectBio = validState.projectBio;
  const normalized = normalizeUiProjects(validState);
  const existingById = await fetchExistingProjectsById(client, normalized);
  assertExistingProjectIds(normalized, existingById);

  const { error: sectionError } = await client
    .from('project_section')
    .upsert(
      [{ id: PROJECT_SECTION_ID, about_projects: projectBio }],
      { onConflict: 'id' },
    );
  if (sectionError) throw sectionError;

  const savedProjects = [];
  const keepIds = [];

  for (const project of normalized) {
    const savedProject = await saveOneProject(client, project, existingById);
    keepIds.push(savedProject.id);
    savedProjects.push(savedProject);
  }

  await deleteRemovedProjects(client, keepIds);

  return {
    projectBio,
    projects: savedProjects,
  };
}

export async function handleProjectsWrite(req, res) {
  try {
    const { body, form } = await parseAdminRequest(req);
    const state = getStatePayload(body, 'projects');
    attachProjectFiles(state, form);
    sendJson(res, 200, await saveProjectsData(state));
  } catch (error) {
    sendRouteError(res, error);
  }
}

function dbRowToUiProject(project) {
  const techStack = project.tech_stack ?? null;
  const tagsFromDb = normalizeStringArray(project.tech_tags);
  const tagsFromStack = flattenTechStack(techStack, PROJECT_TECH_STACK_KEYS);
  const techTags = tagsFromDb.length ? tagsFromDb : tagsFromStack;

  return toUiProject({
    id: project.id,
    title: project.title,
    description: project.card_description,
    url: project.live_url,

    imageUrl: project.image_url,
    videoUrl: project.video_url,
    architectureImageUrl: project.architecture_image_url,

    permalink: project.permalink,
    overview: project.overview,
    role: project.role,
    sourceUrl: project.source_url,
    writeupUrl: project.writeup_url,
    videoPageUrl: project.video_page_url,

    techStack,
    techTags,

    features: project.features,
    metrics: project.metrics,
    challenges: project.challenges,
    improvements: project.improvements,

    published: project.published,
    sortOrder: project.sort_order,
  });
}

async function saveOneProject(client, project, existingById) {
  let id = project.id;
  let permalink;
  let imageUrl;
  let videoUrl;
  let architectureImageUrl;

  if (Number.isFinite(id)) {
    const mediaUrls = await resolveProjectMediaUrls(
      id,
      project.imageFile,
      project.imageUrl,
      project.videoFile,
      project.videoUrl,
      project.architectureImageFile,
      project.architectureImageUrl,
    );
    imageUrl = mediaUrls.imageBucketUrl;
    videoUrl = mediaUrls.videoBucketUrl;
    architectureImageUrl = mediaUrls.architectureImageBucketUrl;

    const updatePayload = {
      ...toDbProjectPayload(project),
      image_url: imageUrl,
      video_url: videoUrl,
      architecture_image_url: architectureImageUrl,
    };

    const dbPermalink = (existingById.get(id)?.permalink || '').trim();
    if (!dbPermalink) {
      updatePayload.permalink = makePermalink(id, project.title);
    }

    const { data, error } = await client
      .from('projects')
      .update(updatePayload)
      .eq('id', id)
      .select('id, permalink')
      .single();
    if (error) throw error;

    permalink = (data?.permalink || dbPermalink || '').trim();
  } else {
    const { data, error } = await client
      .from('projects')
      .insert([{ ...toDbProjectPayload(project) }])
      .select('id')
      .single();
    if (error) throw error;

    id = data.id;
    const mediaUrls = await resolveProjectMediaUrls(
      id,
      project.imageFile,
      project.imageUrl,
      project.videoFile,
      project.videoUrl,
      project.architectureImageFile,
      project.architectureImageUrl,
    );
    imageUrl = mediaUrls.imageBucketUrl;
    videoUrl = mediaUrls.videoBucketUrl;
    architectureImageUrl = mediaUrls.architectureImageBucketUrl;
    permalink = makePermalink(id, project.title);

    const { error: updateError } = await client
      .from('projects')
      .update({
        permalink,
        image_url: imageUrl,
        video_url: videoUrl,
        architecture_image_url: architectureImageUrl,
      })
      .eq('id', id);
    if (updateError) throw updateError;
  }

  return toUiProject(project, id, permalink, imageUrl, videoUrl, architectureImageUrl);
}

async function deleteRemovedProjects(client, keepIds) {
  if (keepIds.length) {
    const { error } = await client
      .from('projects')
      .delete()
      .not('id', 'in', `(${keepIds.join(',')})`);
    if (error) throw error;
    return;
  }

  const { error } = await client.from('projects').delete().neq('id', 0);
  if (error) throw error;
}

function toUiProject(
  project,
  id = null,
  permalink = null,
  imageUrl = null,
  videoUrl = null,
  architectureImageUrl = null,
) {
  const p = project || {};

  return {
    id: id ?? p.id ?? null,

    permalink: permalink ?? p.permalink ?? '',
    imageUrl: imageUrl ?? p.imageUrl ?? '',
    videoUrl: videoUrl ?? p.videoUrl ?? '',
    architectureImageUrl: architectureImageUrl ?? p.architectureImageUrl ?? '',

    imageFile: null,
    videoFile: null,
    architectureImageFile: null,

    title: p.title || '',
    description: p.description || '',
    url: p.url || '',

    overview: p.overview || '',
    role: p.role || '',
    sourceUrl: p.sourceUrl || '',
    writeupUrl: p.writeupUrl || '',
    videoPageUrl: p.videoPageUrl || '',

    techStack: p.techStack,
    challenges: p.challenges || [],

    techTags: Array.isArray(p.techTags) ? p.techTags : [''],
    features: Array.isArray(p.features) ? p.features : [],
    metrics: Array.isArray(p.metrics) ? p.metrics : null,
    improvements: Array.isArray(p.improvements) ? p.improvements : [],

    published: p.published !== false,
    sortOrder: Number.isFinite(p.sortOrder) ? p.sortOrder : 0,
  };
}

function toDbProjectPayload(project) {
  return {
    title: project.title,
    card_description: project.description,
    live_url: project.url,

    image_url: project.imageUrl,
    video_url: project.videoUrl,
    architecture_image_url: project.architectureImageUrl,

    overview: project.overview,
    role: project.role,
    source_url: project.sourceUrl,
    writeup_url: project.writeupUrl,
    video_page_url: project.videoPageUrl,

    tech_stack: project.techStack,
    tech_tags: project.techTags,

    features: project.features,
    metrics: project.metrics,
    challenges: project.challenges,
    improvements: project.improvements,

    published: project.published,
    sort_order: project.sortOrder,
  };
}

function normalizeUiProjects(state) {
  const inputProjects = Array.isArray(state.projects) ? state.projects : [];
  const normalized = [];

  for (let index = 0; index < inputProjects.length; index += 1) {
    const project = inputProjects[index] || {};

    const permalink = nullableString(project.permalink);
    const title = nullableString(project.title);
    const description = nullableString(project.description);
    const url = nullableString(project.url);
    const overview = nullableString(project.overview);
    const role = nullableString(project.role);
    const sourceUrl = nullableString(project.sourceUrl);
    const writeupUrl = nullableString(project.writeupUrl);
    const videoPageUrl = nullableString(project.videoPageUrl);
    const imageUrl = nullableString(project.imageUrl);
    const videoUrl = nullableString(project.videoUrl);
    const architectureImageUrl = nullableString(project.architectureImageUrl);

    const imageFile = project.imageFile || null;
    const videoFile = project.videoFile || null;
    const architectureImageFile = project.architectureImageFile || null;

    const techStack = normalizeTechStack(project.techStack);
    const challenges = Array.isArray(project.challenges) ? project.challenges : null;

    const tagsFromStack = flattenTechStack(techStack, PROJECT_TECH_STACK_KEYS);
    const tagsManual = normalizeStringArray(project.techTags);
    const techTags = tagsFromStack.length ? tagsFromStack : tagsManual;

    const hasImage = Boolean(imageFile || imageUrl);
    const hasVideo = Boolean(videoFile || videoUrl);
    const isEmpty =
      !title &&
      !description &&
      techTags.length === 0 &&
      !url &&
      !hasImage &&
      !hasVideo;
    if (isEmpty) continue;

    const rawId = Number(project.id);
    const id = Number.isFinite(rawId) && rawId > 0 ? rawId : null;

    normalized.push({
      id,
      permalink,
      sortOrder: index,
      published: project.published !== false,
      title: title || `Project ${index + 1}`,
      description,
      url,
      overview,
      role,
      sourceUrl,
      writeupUrl,
      videoPageUrl,
      imageFile,
      videoFile,
      architectureImageFile,
      imageUrl,
      videoUrl,
      architectureImageUrl,
      techStack,
      techTags,
      features: Array.isArray(project.features) ? project.features : null,
      metrics: Array.isArray(project.metrics) ? project.metrics : null,
      challenges,
      improvements: Array.isArray(project.improvements) ? project.improvements : null,
    });
  }

  return normalized;
}

async function fetchExistingProjectsById(client, normalized) {
  const existingIds = normalized
    .filter((project) => Number.isFinite(project.id))
    .map((project) => project.id);

  const existingById = new Map();
  if (!existingIds.length) return existingById;

  const { data, error } = await client
    .from('projects')
    .select('id, permalink')
    .in('id', existingIds);
  if (error) throw error;

  for (const row of data || []) {
    existingById.set(row.id, row);
  }

  return existingById;
}

function assertExistingProjectIds(normalized, existingById) {
  for (const project of normalized) {
    if (Number.isFinite(project.id) && !existingById.has(project.id)) {
      throw new BadRequestError(`project id ${project.id} does not exist`);
    }
  }
}

export function attachProjectFiles(state, form) {
  if (!form || !Array.isArray(state.projects)) return;

  state.projects.forEach((project, index) => {
    applyMultipartFiles(project, form, [
      {
        names: [
          `projects.${index}.imageFile`,
          `projects.projects.${index}.imageFile`,
          `projects[${index}][imageFile]`,
          `projects[${index}].imageFile`,
          `projects[projects][${index}][imageFile]`,
        ],
        set: (target, file) => {
          target.imageFile = file;
        },
      },
      {
        names: [
          `projects.${index}.videoFile`,
          `projects.projects.${index}.videoFile`,
          `projects[${index}][videoFile]`,
          `projects[${index}].videoFile`,
          `projects[projects][${index}][videoFile]`,
        ],
        set: (target, file) => {
          target.videoFile = file;
        },
      },
      {
        names: [
          `projects.${index}.architectureImageFile`,
          `projects.projects.${index}.architectureImageFile`,
          `projects[${index}][architectureImageFile]`,
          `projects[${index}].architectureImageFile`,
          `projects[projects][${index}][architectureImageFile]`,
        ],
        set: (target, file) => {
          target.architectureImageFile = file;
        },
      },
    ]);
  });
}

function normalizeTechStack(techStack) {
  if (!techStack || typeof techStack !== 'object' || Array.isArray(techStack)) {
    return techStack ?? null;
  }

  return techStack;
}

function nullableString(value) {
  const trimmed = stringOrEmpty(value);
  return trimmed || null;
}

function stringOrEmpty(value) {
  return typeof value === 'string' ? value.trim() : '';
}
