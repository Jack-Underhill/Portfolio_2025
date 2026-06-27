import { mapAgentProjectDraftToProjectPatch } from '../../../src/domain/projects/agentDraft.js';

const SUPPORTED_PROJECT_PATCH_FIELDS = Object.freeze([
  'title',
  'description',
  'overview',
  'role',
  'url',
  'sourceUrl',
  'writeupUrl',
  'videoPageUrl',
  'features',
  'metrics',
  'improvements',
  'challenges',
  'techStack',
  'projectType',
  'labels',
  'published',
  'featuredRank',
]);

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function assertProjectPatchRoot(json) {
  if (!isPlainObject(json)) {
    throw new Error('Project patch output must be a JSON object.');
  }
}

function assertOnlySupportedFields(json) {
  const supported = new Set(SUPPORTED_PROJECT_PATCH_FIELDS);
  const unsupportedFields = Object.keys(json).filter((field) => !supported.has(field));

  if (unsupportedFields.length > 0) {
    throw new Error(`Unsupported project patch fields: ${unsupportedFields.join(', ')}.`);
  }
}

export function validateProjectPatchSpikeJson(json) {
  assertProjectPatchRoot(json);
  assertOnlySupportedFields(json);

  const mapped = mapAgentProjectDraftToProjectPatch(json);

  if (mapped.warnings.length > 0) {
    throw new Error(mapped.warnings.join(' '));
  }

  if (mapped.appliedFields.length === 0) {
    throw new Error('Project patch output must include at least one supported field.');
  }

  return {
    fields: mapped.appliedFields,
    normalizedPatch: mapped.patch,
  };
}

export { SUPPORTED_PROJECT_PATCH_FIELDS };
