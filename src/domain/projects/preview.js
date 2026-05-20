import {
  normalizeOptionalString,
  normalizeString,
  normalizeStringArray,
} from '../shared/normalize.js';
import { PROJECT_TECH_STACK_KEYS, PROJECT_TYPES } from './constants.js';

const PROJECT_TYPE_SET = new Set(PROJECT_TYPES);

function normalizePermalink(value) {
  return String(value ?? '').trim();
}

function normalizeFeaturedRank(value) {
  const normalized = normalizeOptionalString(value);
  if (normalized === null) return null;

  const rank = Number(normalized);
  return Number.isSafeInteger(rank) ? rank : null;
}

function normalizeSortValue(value) {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isSafeInteger(number) ? number : 0;
}

function normalizeProjectType(value) {
  const projectType = normalizeOptionalString(value);
  if (!PROJECT_TYPE_SET.has(projectType)) return null;

  return projectType;
}

function normalizeProjectLabels(value) {
  const labels = normalizeStringArray(value, []);
  return [...new Set(labels)];
}

function normalizeTechStack(techStack) {
  if (!techStack || typeof techStack !== 'object' || Array.isArray(techStack)) {
    return null;
  }

  return Object.fromEntries(
    PROJECT_TECH_STACK_KEYS.map((key) => [
      key,
      normalizeStringArray(techStack[key], []),
    ]),
  );
}

function normalizeProjectChallenges(value) {
  if (!Array.isArray(value)) return [];
  return value;
}

export function mapProjectDraftToPreviewProject(draft) {
  const project = draft || {};
  const featuredRank = normalizeFeaturedRank(project.featuredRank);

  return {
    id: project.id ?? null,
    permalink: normalizePermalink(project.permalink),
    title: normalizeString(project.title),
    imageUrl: normalizeString(project.imageUrl),
    videoUrl: normalizeString(project.videoUrl),

    liveUrl: normalizeString(project.url),
    sourceUrl: normalizeString(project.sourceUrl),
    writeupUrl: normalizeString(project.writeupUrl),
    videoPageUrl: normalizeString(project.videoPageUrl),

    overview: normalizeString(project.overview),
    role: normalizeString(project.role),

    architectureImageUrl: normalizeString(project.architectureImageUrl),
    techStack: normalizeTechStack(project.techStack),

    features: normalizeStringArray(project.features, []),
    metrics: normalizeStringArray(project.metrics, []),
    challenges: normalizeProjectChallenges(project.challenges),
    improvements: normalizeStringArray(project.improvements, []),

    isFeatured: featuredRank !== null,
    featuredRank,
    projectType: normalizeProjectType(project.projectType),
    labels: normalizeProjectLabels(project.labels),

    published: project.published !== false,
    sortOrder: normalizeSortValue(project.sortOrder),
  };
}
