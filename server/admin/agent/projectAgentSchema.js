import {
  AgentProjectDraftImportError,
  mapAgentProjectDraftToProjectPatch,
} from '../../../src/domain/projects/agentDraft.js';
import {
  PROJECT_AGENT_SOURCE_FILE_MAX_COUNT,
  PROJECT_AGENT_SOURCE_GITHUB_MAX_INCLUDED_FILES,
  PROJECT_AGENT_SOURCE_ZIP_MAX_INCLUDED_FILES,
} from './sourceBundle.js';

export const PROJECT_AGENT_INSTRUCTIONS_MAX_LENGTH = 4000;
export const PROJECT_AGENT_CONTEXT_MAX_LENGTH = 50000;

const SUMMARY_ARRAY_MAX_ITEMS = 20;
const SUMMARY_STRING_MAX_LENGTH = 500;
const REVIEW_PATCH_IGNORED_WARNING = 'Ignored draft fields returned during review.';
const SOURCE_BUNDLE_MAX_SOURCES = (PROJECT_AGENT_SOURCE_FILE_MAX_COUNT * PROJECT_AGENT_SOURCE_ZIP_MAX_INCLUDED_FILES)
  + PROJECT_AGENT_SOURCE_GITHUB_MAX_INCLUDED_FILES
  + 1;
const SOURCE_BUNDLE_WARNING_MAX_ITEMS = 25;
const SOURCE_BUNDLE_WARNING_MAX_LENGTH = 500;
const SOURCE_MANIFEST_STRING_METADATA_FIELDS = Object.freeze([
  'archiveLabel',
  'ignoredPathReason',
  'owner',
  'path',
  'ref',
  'repo',
  'sourceUrl',
]);
const SOURCE_MANIFEST_NUMBER_METADATA_FIELDS = Object.freeze(['pages', 'entryCount', 'extractedBytes']);
const SOURCE_MANIFEST_BOOLEAN_METADATA_FIELDS = Object.freeze(['truncated']);

export class ProjectAgentSchemaError extends Error {
  constructor(type, message, details = {}) {
    super(message);
    this.name = 'ProjectAgentSchemaError';
    this.type = type;
    this.details = details;
  }
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getSerializedLength(value) {
  try {
    return JSON.stringify(value).length;
  } catch {
    throw new ProjectAgentSchemaError(
      'invalid_input',
      'Project context must be JSON serializable.',
    );
  }
}

function normalizeSummaryArray(value, field) {
  if (value == null) return [];

  if (!Array.isArray(value)) {
    throw new ProjectAgentSchemaError('malformed_wrapper', `${field} must be an array of strings.`);
  }

  if (value.length > SUMMARY_ARRAY_MAX_ITEMS) {
    throw new ProjectAgentSchemaError(
      'malformed_wrapper',
      `${field} must contain ${SUMMARY_ARRAY_MAX_ITEMS} or fewer items.`,
    );
  }

  return value
    .map((item, index) => {
      if (typeof item !== 'string') {
        throw new ProjectAgentSchemaError(
          'malformed_wrapper',
          `${field} item ${index + 1} must be a string.`,
        );
      }

      const text = item.trim();
      return text.length > SUMMARY_STRING_MAX_LENGTH
        ? `${text.slice(0, SUMMARY_STRING_MAX_LENGTH).trimEnd()}...`
        : text;
    })
    .filter(Boolean);
}

function normalizeSourceWarnings(value, field) {
  if (value == null) return [];

  if (!Array.isArray(value)) {
    throw new ProjectAgentSchemaError('invalid_input', `${field} must be an array of strings.`);
  }

  if (value.length > SOURCE_BUNDLE_WARNING_MAX_ITEMS) {
    throw new ProjectAgentSchemaError(
      'invalid_input',
      `${field} must contain ${SOURCE_BUNDLE_WARNING_MAX_ITEMS} or fewer items.`,
    );
  }

  return value
    .map((item, index) => {
      if (typeof item !== 'string') {
        throw new ProjectAgentSchemaError(
          'invalid_input',
          `${field} item ${index + 1} must be a string.`,
        );
      }

      const text = item.trim();
      return text.length > SOURCE_BUNDLE_WARNING_MAX_LENGTH
        ? `${text.slice(0, SOURCE_BUNDLE_WARNING_MAX_LENGTH).trimEnd()}...`
        : text;
    })
    .filter(Boolean);
}

function normalizeSourceManifestEntry(entry, index) {
  if (!isPlainObject(entry)) {
    throw new ProjectAgentSchemaError(
      'invalid_input',
      `sourceBundle manifest entry ${index + 1} must be an object.`,
    );
  }

  const id = typeof entry.id === 'string' ? entry.id.trim() : '';
  const kind = typeof entry.kind === 'string' ? entry.kind.trim() : '';
  const label = typeof entry.label === 'string' ? entry.label.trim() : '';
  const mediaType = typeof entry.mediaType === 'string' ? entry.mediaType.trim() : undefined;
  const bytes = Number.isFinite(entry.bytes) && entry.bytes >= 0 ? entry.bytes : 0;

  if (!id || !kind || !label) {
    throw new ProjectAgentSchemaError(
      'invalid_input',
      `sourceBundle manifest entry ${index + 1} must include id, kind, and label.`,
    );
  }

  const normalized = {
    id,
    kind,
    label,
    bytes,
    included: entry.included === true,
    warnings: normalizeSourceWarnings(
      entry.warnings,
      `sourceBundle manifest entry ${index + 1} warnings`,
    ),
  };

  if (mediaType) {
    normalized.mediaType = mediaType;
  }

  for (const field of SOURCE_MANIFEST_STRING_METADATA_FIELDS) {
    const value = typeof entry[field] === 'string' ? entry[field].trim() : '';
    if (value) normalized[field] = value;
  }

  for (const field of SOURCE_MANIFEST_NUMBER_METADATA_FIELDS) {
    const value = entry[field];
    if (Number.isFinite(value) && value >= 0) normalized[field] = value;
  }

  for (const field of SOURCE_MANIFEST_BOOLEAN_METADATA_FIELDS) {
    if (entry[field] === true) normalized[field] = true;
  }

  return normalized;
}

function normalizeSourceItem(source, index) {
  if (!isPlainObject(source)) {
    throw new ProjectAgentSchemaError(
      'invalid_input',
      `sourceBundle source ${index + 1} must be an object.`,
    );
  }

  const id = typeof source.id === 'string' ? source.id.trim() : '';
  const kind = typeof source.kind === 'string' ? source.kind.trim() : '';
  const label = typeof source.label === 'string' ? source.label.trim() : '';
  const mediaType = typeof source.mediaType === 'string' ? source.mediaType.trim() : 'text/plain';
  const text = typeof source.text === 'string' ? source.text.trim() : '';
  const bytes = Number.isFinite(source.bytes) && source.bytes >= 0 ? source.bytes : 0;

  if (!id || !kind || !label || !text) {
    throw new ProjectAgentSchemaError(
      'invalid_input',
      `sourceBundle source ${index + 1} must include id, kind, label, and text.`,
    );
  }

  return {
    id,
    kind,
    label,
    mediaType,
    bytes,
    text,
  };
}

function normalizeProjectAgentSourceBundle(sourceBundle) {
  if (sourceBundle == null) return null;

  if (!isPlainObject(sourceBundle)) {
    throw new ProjectAgentSchemaError('invalid_input', 'sourceBundle must be an object.');
  }

  const rawSources = sourceBundle.sources == null ? [] : sourceBundle.sources;
  const rawManifest = sourceBundle.manifest == null ? [] : sourceBundle.manifest;

  if (!Array.isArray(rawSources)) {
    throw new ProjectAgentSchemaError('invalid_input', 'sourceBundle sources must be an array.');
  }

  if (!Array.isArray(rawManifest)) {
    throw new ProjectAgentSchemaError('invalid_input', 'sourceBundle manifest must be an array.');
  }

  if (rawSources.length > SOURCE_BUNDLE_MAX_SOURCES) {
    throw new ProjectAgentSchemaError(
      'invalid_input',
      `sourceBundle sources must contain ${SOURCE_BUNDLE_MAX_SOURCES} or fewer items.`,
    );
  }

  const sources = rawSources.map(normalizeSourceItem);
  const manifest = rawManifest.map(normalizeSourceManifestEntry);
  const warnings = normalizeSourceWarnings(sourceBundle.warnings, 'sourceBundle warnings');

  return {
    hasSourceContext: sources.length > 0,
    sources,
    manifest,
    warnings,
  };
}

export function validateProjectAgentRunInput(input) {
  if (!isPlainObject(input)) {
    throw new ProjectAgentSchemaError('invalid_input', 'Project agent input must be an object.');
  }

  const intent = typeof input.intent === 'string' ? input.intent.trim() : '';
  if (!intent) {
    throw new ProjectAgentSchemaError('invalid_intent', 'Project agent intent is required.');
  }

  const instructions = typeof input.instructions === 'string' ? input.instructions.trim() : '';
  const sourceBundle = normalizeProjectAgentSourceBundle(input.sourceBundle);

  if (instructions.length > PROJECT_AGENT_INSTRUCTIONS_MAX_LENGTH) {
    throw new ProjectAgentSchemaError(
      'invalid_input',
      `Project agent instructions must be ${PROJECT_AGENT_INSTRUCTIONS_MAX_LENGTH} characters or fewer.`,
    );
  }

  if (!instructions && sourceBundle?.hasSourceContext !== true) {
    throw new ProjectAgentSchemaError(
      'invalid_input',
      'Project agent instructions or source material are required.',
    );
  }

  if (!isPlainObject(input.projectContext)) {
    throw new ProjectAgentSchemaError(
      'invalid_input',
      'Project agent projectContext must be an object.',
    );
  }

  if (!isPlainObject(input.projectContext.projectContext) || !isPlainObject(input.projectContext.draft)) {
    throw new ProjectAgentSchemaError(
      'invalid_input',
      'Project agent projectContext must include projectContext and draft objects.',
    );
  }

  const contextLength = getSerializedLength(input.projectContext);
  if (contextLength > PROJECT_AGENT_CONTEXT_MAX_LENGTH) {
    throw new ProjectAgentSchemaError(
      'invalid_input',
      `Project agent projectContext must serialize to ${PROJECT_AGENT_CONTEXT_MAX_LENGTH} characters or fewer.`,
    );
  }

  return {
    intent,
    instructions,
    projectContext: input.projectContext,
    sourceBundle,
  };
}

function hasPatchFields(patch) {
  return Object.keys(patch).length > 0;
}

export function validateProjectAgentOutput(json, { ignorePatch = false } = {}) {
  if (!isPlainObject(json)) {
    throw new ProjectAgentSchemaError('malformed_wrapper', 'Project agent output must be an object.');
  }

  if (!isPlainObject(json.patch)) {
    throw new ProjectAgentSchemaError('malformed_wrapper', 'Project agent output patch must be an object.');
  }

  const notes = normalizeSummaryArray(json.notes, 'notes');
  const codexWarnings = normalizeSummaryArray(json.warnings, 'warnings');

  if (ignorePatch) {
    return {
      patch: {},
      notes,
      warnings: hasPatchFields(json.patch)
        ? [...codexWarnings, REVIEW_PATCH_IGNORED_WARNING]
        : codexWarnings,
      appliedFields: [],
    };
  }

  let mapped;

  try {
    mapped = mapAgentProjectDraftToProjectPatch(json.patch);
  } catch (error) {
    if (error instanceof AgentProjectDraftImportError) {
      throw new ProjectAgentSchemaError('invalid_patch', error.message);
    }

    throw error;
  }

  return {
    patch: mapped.patch,
    notes,
    warnings: [...codexWarnings, ...mapped.warnings],
    appliedFields: mapped.appliedFields,
  };
}
