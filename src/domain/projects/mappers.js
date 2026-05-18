import {
  normalizeArray,
  normalizeOptionalString,
  normalizeString,
  normalizeStringArray,
} from '../shared/normalize.js';
import { PROJECT_TYPES } from './constants.js';
import { createEmptyProjectDetails } from './defaults.js';

const DETAIL_URL_FIELDS = [
  'imageUrl',
  'videoUrl',
  'architectureImageUrl',
];

const DETAIL_PLAIN_FIELDS = [
  'id',
  'title',
  'liveUrl',
  'sourceUrl',
  'writeupUrl',
  'videoPageUrl',
  'techStack',
];

const DETAIL_CLASSIFICATION_FIELDS = [
  'isFeatured',
  'featuredRank',
  'projectType',
  'labels',
];

const DETAIL_TEXT_FIELDS = [
  'overview',
  'role',
];

const DETAIL_ARRAY_FIELDS = [
  ['features', []],
  ['metrics', null],
  ['challenges', []],
  ['improvements', []],
];

const MERGE_FALLBACK_FIELDS = [
  'permalink',
  'title',
  'imageUrl',
  'videoUrl',
];

const PROJECT_TYPE_SET = new Set(PROJECT_TYPES);

function hasOwnValue(object, field) {
  return object?.[field] !== undefined;
}

function isEmptyValue(value) {
  return value == null || value === '';
}

function copyPlainFields(source, target, fields) {
  fields.forEach((field) => {
    if (hasOwnValue(source, field)) target[field] = source[field];
  });
}

function copyTextFields(source, target, fields) {
  fields.forEach((field) => {
    if (hasOwnValue(source, field)) target[field] = source[field] ?? '';
  });
}

function copyUrlFields(source, target, fields) {
  fields.forEach((field) => {
    const value = normalizeOptionalString(source?.[field]);
    if (value !== null) target[field] = value;
  });
}

function copyArrayFields(source, target, fieldConfigs) {
  fieldConfigs.forEach(([field, fallback]) => {
    if (hasOwnValue(source, field)) target[field] = normalizeArray(source[field], fallback);
  });
}

function normalizePermalink(value) {
  return String(value ?? '').trim();
}

function normalizeProjectChallenges(value) {
  if (Array.isArray(value)) return value;
  return [];
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

function mapProjectClassification(row) {
  const featuredRank = normalizeFeaturedRank(row?.featured_rank);

  return {
    isFeatured: featuredRank !== null,
    featuredRank,
    projectType: normalizeProjectType(row?.project_type),
    labels: normalizeProjectLabels(row?.labels),
  };
}

function mapProjectViewModelClassification(project) {
  const featuredRank = normalizeFeaturedRank(project?.featuredRank);

  return {
    isFeatured: featuredRank !== null,
    featuredRank,
    projectType: normalizeProjectType(project?.projectType),
    labels: normalizeProjectLabels(project?.labels),
  };
}

export function mapProjectRowToPublicCard(row) {
  return {
    id: row?.id,
    permalink: normalizePermalink(row?.permalink),
    imageUrl: normalizeString(row?.image_url),
    videoUrl: normalizeString(row?.video_url),
    title: normalizeString(row?.title),
    description: normalizeString(row?.card_description),
    directUrl: normalizeString(row?.live_url || row?.source_url),
    techTags: normalizeStringArray(row?.tech_tags, []),
    sortOrder: normalizeSortValue(row?.sort_order),
    ...mapProjectClassification(row),
  };
}

export function mapProjectRowToPublicDetails(row) {
  if (!row) return null;

  return {
    id: row.id,
    permalink: normalizePermalink(row.permalink),
    title: normalizeString(row.title),
    imageUrl: normalizeString(row.image_url),
    videoUrl: normalizeString(row.video_url),

    liveUrl: normalizeString(row.live_url),
    sourceUrl: normalizeString(row.source_url),
    writeupUrl: normalizeString(row.writeup_url),
    videoPageUrl: normalizeString(row.video_page_url),

    overview: normalizeString(row.overview),
    role: normalizeString(row.role),

    architectureImageUrl: normalizeString(row.architecture_image_url),
    techStack: row.tech_stack || null,

    features: normalizeStringArray(row.features, []),
    metrics: normalizeStringArray(row.metrics, []),
    challenges: normalizeProjectChallenges(row.challenges),
    improvements: normalizeStringArray(row.improvements, []),

    ...mapProjectClassification(row),

    published: !!row.published,
    sortOrder: row.sort_order ?? 0,
  };
}

export function toProjectCardViewModel(project, { fallbackImageUrl = null, fallbackId = null } = {}) {
  const id = project?.id ?? fallbackId;

  return {
    id,
    permalink: normalizePermalink(project?.permalink),
    imageUrl: normalizeOptionalString(project?.imageUrl) || fallbackImageUrl,
    videoUrl: normalizeOptionalString(project?.videoUrl),
    title: project?.title || null,
    description: project?.description || null,
    directUrl: normalizeOptionalString(project?.directUrl),
    techTags: normalizeStringArray(project?.techTags, []),
    sortOrder: normalizeSortValue(project?.sortOrder),
    ...createEmptyProjectDetails(),
    ...mapProjectViewModelClassification(project),
  };
}

export function toProjectDetailsViewModel(project) {
  if (!project) return null;

  const output = {};

  copyPlainFields(project, output, DETAIL_PLAIN_FIELDS);
  if (hasOwnValue(project, 'permalink')) output.permalink = normalizePermalink(project.permalink);

  copyUrlFields(project, output, DETAIL_URL_FIELDS);
  copyTextFields(project, output, DETAIL_TEXT_FIELDS);
  copyArrayFields(project, output, DETAIL_ARRAY_FIELDS);
  copyPlainFields(mapProjectViewModelClassification(project), output, DETAIL_CLASSIFICATION_FIELDS);

  return output;
}

export function mergeProjectViewModels(cardProject, detailProject) {
  const card = cardProject || {};
  const details = detailProject || {};
  const merged = { ...details };

  MERGE_FALLBACK_FIELDS.forEach((field) => {
    if (isEmptyValue(details[field])) merged[field] = card[field];
  });

  return merged;
}

export function normalizeProjectSortOrder(projects) {
  if (!Array.isArray(projects)) return [];

  return projects.map((project, index) => ({
    ...project,
    sortOrder: index,
  }));
}
