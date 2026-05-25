import { normalizeOptionalString, normalizeStringArray } from '../shared/normalize.js';
import { PROJECT_TECH_STACK_KEYS, PROJECT_TYPES } from './constants.js';

const TEXT_FIELDS = Object.freeze([
  'title',
  'description',
  'overview',
  'role',
  'url',
  'sourceUrl',
  'writeupUrl',
  'videoPageUrl',
]);

const LIST_FIELDS = Object.freeze([
  'features',
  'metrics',
  'improvements',
]);

const SUPPORTED_FIELDS = Object.freeze([
  ...TEXT_FIELDS,
  ...LIST_FIELDS,
  'challenges',
  'techStack',
  'projectType',
  'labels',
  'published',
  'featuredRank',
]);

const SUPPORTED_FIELD_SET = new Set(SUPPORTED_FIELDS);
const PROJECT_TYPE_SET = new Set(PROJECT_TYPES);

const PRESERVED_FIELDS = Object.freeze([
  'id',
  'permalink',
  'sortOrder',
  'imageUrl',
  'videoUrl',
  'architectureImageUrl',
  'imageFile',
  'videoFile',
  'architectureImageFile',
  'techTags',
]);

export class AgentProjectDraftImportError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AgentProjectDraftImportError';
  }
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function hasOwnValue(object, field) {
  return Object.prototype.hasOwnProperty.call(object, field);
}

function extractJsonSource(source) {
  const text = String(source ?? '').trim();
  const fencedJsonMatch = text.match(/```json\s*([\s\S]*?)```/i);

  return (fencedJsonMatch?.[1] ?? text).trim();
}

function parseJsonObject(source) {
  try {
    return JSON.parse(source);
  } catch {
    throw new AgentProjectDraftImportError('Agent draft payload must be valid JSON.');
  }
}

function assertPlainPayload(value) {
  if (!isPlainObject(value)) {
    throw new AgentProjectDraftImportError('Agent draft payload must be a JSON object.');
  }
}

function normalizeTextField(value, label) {
  if (value == null) return '';
  if (typeof value !== 'string') {
    throw new AgentProjectDraftImportError(`${label} must be a string.`);
  }

  return normalizeOptionalString(value) ?? '';
}

function normalizeStringListField(value, label) {
  if (value == null) return [];
  if (!Array.isArray(value)) {
    throw new AgentProjectDraftImportError(`${label} must be an array.`);
  }

  return value
    .map((item, index) => normalizeTextField(item, `${label} item ${index + 1}`))
    .filter(Boolean);
}

function normalizeUniqueStringListField(value, label) {
  const items = normalizeStringListField(value, label);
  const output = [];
  const seen = new Set();

  items.forEach((item) => {
    const key = item.toLowerCase();
    if (seen.has(key)) return;

    seen.add(key);
    output.push(item);
  });

  return output;
}

function normalizeFeaturedRank(value) {
  if (value == null || value === '') return '';

  const rank = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(rank)) {
    throw new AgentProjectDraftImportError('featuredRank must be an integer.');
  }

  return rank;
}

function normalizeProjectType(value) {
  const projectType = normalizeTextField(value, 'projectType');
  if (!projectType) return '';
  if (!PROJECT_TYPE_SET.has(projectType)) {
    throw new AgentProjectDraftImportError('projectType must be an accepted project type.');
  }

  return projectType;
}

function normalizePublished(value) {
  if (value == null) return true;
  if (typeof value !== 'boolean') {
    throw new AgentProjectDraftImportError('published must be a boolean.');
  }

  return value;
}

function normalizeTechStack(value, warnings) {
  if (value == null) return Object.fromEntries(PROJECT_TECH_STACK_KEYS.map((key) => [key, []]));
  if (!isPlainObject(value)) {
    throw new AgentProjectDraftImportError('techStack must be an object.');
  }

  const patch = {};
  Object.keys(value).forEach((key) => {
    if (!PROJECT_TECH_STACK_KEYS.includes(key)) {
      warnings.push(`Ignored unsupported techStack field "${key}".`);
      return;
    }

    patch[key] = normalizeStringListField(value[key], `techStack.${key}`);
  });

  return patch;
}

function normalizeChallenges(value) {
  if (value == null) return [];
  if (!Array.isArray(value)) {
    throw new AgentProjectDraftImportError('challenges must be an array.');
  }

  return value
    .map((item, index) => {
      if (!isPlainObject(item)) {
        throw new AgentProjectDraftImportError(`challenges item ${index + 1} must be an object.`);
      }

      const challenge = normalizeTextField(item.challenge, `challenges item ${index + 1} challenge`);
      const solution = normalizeTextField(item.solution, `challenges item ${index + 1} solution`);
      const result = normalizeTextField(item.result, `challenges item ${index + 1} result`);

      return { challenge, solution, result };
    })
    .filter((item) => item.challenge || item.solution || item.result);
}

function collectUnknownKeyWarnings(payload) {
  return Object.keys(payload)
    .filter((key) => !SUPPORTED_FIELD_SET.has(key))
    .map((key) => `Ignored unsupported project draft field "${key}".`);
}

function normalizeExportUniqueStringList(value) {
  const output = [];
  const seen = new Set();

  normalizeStringArray(value).forEach((item) => {
    const key = item.toLowerCase();
    if (seen.has(key)) return;

    seen.add(key);
    output.push(item);
  });

  return output;
}

function normalizeExportProjectType(value) {
  const projectType = normalizeOptionalString(value);
  return PROJECT_TYPE_SET.has(projectType) ? projectType : '';
}

function normalizeExportFeaturedRank(value) {
  if (value == null || value === '') return '';

  const rank = typeof value === 'number' ? value : Number(value);
  if (Number.isInteger(rank)) return rank;

  return normalizeOptionalString(value);
}

function normalizeExportPublished(value) {
  return typeof value === 'boolean' ? value : true;
}

function normalizeExportTechStack(value) {
  const source = isPlainObject(value) ? value : {};

  return Object.fromEntries(
    PROJECT_TECH_STACK_KEYS.map((key) => [key, normalizeStringArray(source[key])]),
  );
}

function normalizeExportChallenges(value) {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isPlainObject)
    .map((item) => ({
      challenge: normalizeOptionalString(item.challenge),
      solution: normalizeOptionalString(item.solution),
      result: normalizeOptionalString(item.result),
    }))
    .filter((item) => item.challenge || item.solution || item.result);
}

function createDraftReviewPayload(project) {
  return {
    title: normalizeOptionalString(project.title),
    description: normalizeOptionalString(project.description),
    overview: normalizeOptionalString(project.overview),
    role: normalizeOptionalString(project.role),
    features: normalizeStringArray(project.features),
    metrics: normalizeStringArray(project.metrics),
    challenges: normalizeExportChallenges(project.challenges),
    improvements: normalizeStringArray(project.improvements),
    techStack: normalizeExportTechStack(project.techStack),
    projectType: normalizeExportProjectType(project.projectType),
    labels: normalizeExportUniqueStringList(project.labels),
    url: normalizeOptionalString(project.url),
    sourceUrl: normalizeOptionalString(project.sourceUrl),
    writeupUrl: normalizeOptionalString(project.writeupUrl),
    videoPageUrl: normalizeOptionalString(project.videoPageUrl),
    published: normalizeExportPublished(project.published),
    featuredRank: normalizeExportFeaturedRank(project.featuredRank),
  };
}

export function parseAgentProjectDraftPayload(source) {
  const jsonSource = extractJsonSource(source);
  const payload = parseJsonObject(jsonSource);

  assertPlainPayload(payload);

  return {
    payload,
    warnings: [],
  };
}

export function mapAgentProjectDraftToProjectPatch(payload) {
  assertPlainPayload(payload);

  const warnings = collectUnknownKeyWarnings(payload);
  const patch = {};

  TEXT_FIELDS.forEach((field) => {
    if (hasOwnValue(payload, field)) {
      patch[field] = normalizeTextField(payload[field], field);
    }
  });

  LIST_FIELDS.forEach((field) => {
    if (hasOwnValue(payload, field)) {
      patch[field] = normalizeStringListField(payload[field], field);
    }
  });

  if (hasOwnValue(payload, 'challenges')) {
    patch.challenges = normalizeChallenges(payload.challenges);
  }

  if (hasOwnValue(payload, 'techStack')) {
    patch.techStack = normalizeTechStack(payload.techStack, warnings);
  }

  if (hasOwnValue(payload, 'projectType')) {
    patch.projectType = normalizeProjectType(payload.projectType);
  }

  if (hasOwnValue(payload, 'labels')) {
    patch.labels = normalizeUniqueStringListField(payload.labels, 'labels');
  }

  if (hasOwnValue(payload, 'published')) {
    patch.published = normalizePublished(payload.published);
  }

  if (hasOwnValue(payload, 'featuredRank')) {
    patch.featuredRank = normalizeFeaturedRank(payload.featuredRank);
  }

  return {
    patch,
    appliedFields: Object.keys(patch),
    warnings,
  };
}

export function applyAgentProjectDraftPatch(activeProject, source) {
  const currentProject = isPlainObject(activeProject) ? activeProject : {};
  const parsed = typeof source === 'string' ? parseAgentProjectDraftPayload(source) : {
    payload: source,
    warnings: [],
  };
  const mapped = mapAgentProjectDraftToProjectPatch(parsed.payload);
  const nextProject = {
    ...currentProject,
    ...mapped.patch,
  };

  if (mapped.patch.techStack) {
    nextProject.techStack = {
      ...(isPlainObject(currentProject.techStack) ? currentProject.techStack : {}),
      ...mapped.patch.techStack,
    };
  }

  PRESERVED_FIELDS.forEach((field) => {
    if (hasOwnValue(currentProject, field)) nextProject[field] = currentProject[field];
  });

  return {
    project: nextProject,
    patch: mapped.patch,
    appliedFields: mapped.appliedFields,
    warnings: [...parsed.warnings, ...mapped.warnings],
  };
}

export function createAgentProjectDraftReviewContext(activeProject) {
  const currentProject = isPlainObject(activeProject) ? activeProject : {};

  return {
    projectContext: {
      id: hasOwnValue(currentProject, 'id') ? currentProject.id : '',
      title: normalizeOptionalString(currentProject.title),
      permalink: normalizeOptionalString(currentProject.permalink),
      projectType: normalizeExportProjectType(currentProject.projectType),
      labels: normalizeExportUniqueStringList(currentProject.labels),
    },
    draft: createDraftReviewPayload(currentProject),
  };
}

export function stringifyAgentProjectDraftReviewContext(activeProject) {
  return JSON.stringify(createAgentProjectDraftReviewContext(activeProject), null, 2);
}
