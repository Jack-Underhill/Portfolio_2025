import {
  AgentProjectDraftImportError,
  applyAgentProjectDraftPatch,
} from '../../../src/domain/projects/agentDraft.js';
import { BadRequestError } from '../routes/requestBody.js';
import { validateProjectsState } from '../routes/validation.js';

const PASSED_MESSAGE = 'Validation preflight passed for the revised draft.';
const FAILED_MESSAGE = 'Validation preflight found an issue to fix before Save.';
const REVIEW_SKIPPED_MESSAGE = 'Validation preflight skipped for review-only runs.';
const PATCH_SKIPPED_MESSAGE = 'Validation preflight skipped because no revised draft patch was returned.';
const UNAVAILABLE_SKIPPED_MESSAGE = 'Validation preflight was skipped because the revised draft could not be checked.';

export function createProjectAgentValidationPreflight({
  intent,
  projectContext,
  patch,
  validateProjects = validateProjectsState,
} = {}) {
  if (intent !== 'revise') {
    return createSkippedPreflight(REVIEW_SKIPPED_MESSAGE);
  }

  if (!isPlainObject(patch) || Object.keys(patch).length === 0) {
    return createSkippedPreflight(PATCH_SKIPPED_MESSAGE);
  }

  if (!isPlainObject(projectContext) || !isPlainObject(projectContext.draft)) {
    return createSkippedPreflight(UNAVAILABLE_SKIPPED_MESSAGE);
  }

  try {
    const { project } = applyAgentProjectDraftPatch(projectContext.draft, patch);
    const temporaryProject = mergeProjectContextMetadata(
      project,
      projectContext.projectContext,
    );

    validateProjects({
      projectBio: '',
      projects: [temporaryProject],
    });

    return {
      status: 'passed',
      message: PASSED_MESSAGE,
      errors: [],
    };
  } catch (error) {
    if (isExpectedValidationError(error)) {
      return {
        status: 'failed',
        message: FAILED_MESSAGE,
        errors: [sanitizeValidationMessage(error.message)],
      };
    }

    return createSkippedPreflight(UNAVAILABLE_SKIPPED_MESSAGE);
  }
}

function mergeProjectContextMetadata(project, context) {
  const temporaryProject = { ...project };
  const projectContext = isPlainObject(context) ? context : {};

  copyIfPresent(temporaryProject, projectContext, 'id');
  copyIfPresent(temporaryProject, projectContext, 'permalink');

  if (!temporaryProject.projectType && projectContext.projectType) {
    temporaryProject.projectType = projectContext.projectType;
  }

  if (
    (!Array.isArray(temporaryProject.labels) || temporaryProject.labels.length === 0)
    && Array.isArray(projectContext.labels)
  ) {
    temporaryProject.labels = projectContext.labels;
  }

  return temporaryProject;
}

function copyIfPresent(target, source, field) {
  if (!hasOwnValue(target, field) && hasOwnValue(source, field)) {
    target[field] = source[field];
  }
}

function createSkippedPreflight(message) {
  return {
    status: 'skipped',
    message,
    errors: [],
  };
}

function isExpectedValidationError(error) {
  return (
    error instanceof BadRequestError
    || error instanceof AgentProjectDraftImportError
    || error?.name === 'BadRequestError'
    || error?.name === 'AgentProjectDraftImportError'
    || error?.statusCode === 400
  );
}

function sanitizeValidationMessage(message) {
  const normalized = String(message || '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) return 'The revised draft did not pass validation.';
  if (normalized.length <= 240) return normalized;

  return `${normalized.slice(0, 237).trimEnd()}...`;
}

function hasOwnValue(object, field) {
  return Object.prototype.hasOwnProperty.call(object, field);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
