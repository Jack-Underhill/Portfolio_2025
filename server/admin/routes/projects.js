import { requireServiceClient } from '../clients/supabaseService.js';
import { flattenTechStack, normalizeStringArray } from '../utils/strings.js';
import { sendJson, sendRouteError } from './responses.js';

const PROJECT_SECTION_ID = 1;
const TECH_STACK_ORDER = ['frontend', 'backend', 'data', 'infrastructure'];

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

function dbRowToUiProject(project) {
  const techStack = project.tech_stack ?? null;
  const tagsFromDb = normalizeStringArray(project.tech_tags);
  const tagsFromStack = flattenTechStack(techStack, TECH_STACK_ORDER);
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

function toUiProject(project) {
  const p = project || {};

  return {
    id: p.id ?? null,

    permalink: p.permalink ?? '',
    imageUrl: p.imageUrl ?? '',
    videoUrl: p.videoUrl ?? '',
    architectureImageUrl: p.architectureImageUrl ?? '',

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
