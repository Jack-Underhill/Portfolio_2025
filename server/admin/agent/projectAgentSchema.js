import {
  AgentProjectDraftImportError,
  mapAgentProjectDraftToProjectPatch,
} from '../../../src/domain/projects/agentDraft.js';

export const PROJECT_AGENT_INSTRUCTIONS_MAX_LENGTH = 4000;
export const PROJECT_AGENT_CONTEXT_MAX_LENGTH = 50000;

const SUMMARY_ARRAY_MAX_ITEMS = 20;
const SUMMARY_STRING_MAX_LENGTH = 500;

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

export function validateProjectAgentRunInput(input) {
  if (!isPlainObject(input)) {
    throw new ProjectAgentSchemaError('invalid_input', 'Project agent input must be an object.');
  }

  const intent = typeof input.intent === 'string' ? input.intent.trim() : '';
  if (!intent) {
    throw new ProjectAgentSchemaError('invalid_intent', 'Project agent intent is required.');
  }

  const instructions = typeof input.instructions === 'string' ? input.instructions.trim() : '';
  if (!instructions) {
    throw new ProjectAgentSchemaError('invalid_input', 'Project agent instructions are required.');
  }

  if (instructions.length > PROJECT_AGENT_INSTRUCTIONS_MAX_LENGTH) {
    throw new ProjectAgentSchemaError(
      'invalid_input',
      `Project agent instructions must be ${PROJECT_AGENT_INSTRUCTIONS_MAX_LENGTH} characters or fewer.`,
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
  };
}

export function validateProjectAgentOutput(json) {
  if (!isPlainObject(json)) {
    throw new ProjectAgentSchemaError('malformed_wrapper', 'Project agent output must be an object.');
  }

  if (!isPlainObject(json.patch)) {
    throw new ProjectAgentSchemaError('malformed_wrapper', 'Project agent output patch must be an object.');
  }

  const notes = normalizeSummaryArray(json.notes, 'notes');
  const codexWarnings = normalizeSummaryArray(json.warnings, 'warnings');

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
