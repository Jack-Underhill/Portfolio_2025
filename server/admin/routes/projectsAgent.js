import { getCodexRuntimeMetadata } from '../agent/codexRuntimeMetadata.js';
import { ProjectAgentRunError, runProjectAgent } from '../agent/projectAgentRun.js';
import {
  createProjectAgentSourceBundle,
  PROJECT_AGENT_SOURCE_FILE_MAX_BYTES,
  PROJECT_AGENT_SOURCE_FILE_MAX_COUNT,
  PROJECT_AGENT_SOURCE_PDF_MAX_BYTES,
  PROJECT_AGENT_SOURCE_PDF_MAX_PAGES,
  PROJECT_AGENT_SOURCE_TEXT_MAX_LENGTH,
  PROJECT_AGENT_SOURCE_TOTAL_TEXT_MAX_LENGTH,
  PROJECT_AGENT_SOURCE_ZIP_ENTRY_MAX_BYTES,
  PROJECT_AGENT_SOURCE_ZIP_MAX_BYTES,
  PROJECT_AGENT_SOURCE_ZIP_MAX_ENTRIES,
  PROJECT_AGENT_SOURCE_ZIP_MAX_INCLUDED_FILES,
  PROJECT_AGENT_SOURCE_ZIP_TOTAL_EXTRACTED_BYTES,
} from '../agent/sourceBundle.js';
import {
  BadRequestError,
  assertPlainObject,
  getMultipartFiles,
  parseAdminRequest,
} from './requestBody.js';
import { sendJson, sendRouteError } from './responses.js';

const SOURCE_PREVIEW_LIMITS = {
  fileMaxCount: PROJECT_AGENT_SOURCE_FILE_MAX_COUNT,
  fileMaxBytes: PROJECT_AGENT_SOURCE_FILE_MAX_BYTES,
  sourceTextMaxLength: PROJECT_AGENT_SOURCE_TEXT_MAX_LENGTH,
  totalTextMaxLength: PROJECT_AGENT_SOURCE_TOTAL_TEXT_MAX_LENGTH,
  pdfMaxBytes: PROJECT_AGENT_SOURCE_PDF_MAX_BYTES,
  pdfMaxPages: PROJECT_AGENT_SOURCE_PDF_MAX_PAGES,
  zipMaxBytes: PROJECT_AGENT_SOURCE_ZIP_MAX_BYTES,
  zipMaxEntries: PROJECT_AGENT_SOURCE_ZIP_MAX_ENTRIES,
  zipMaxIncludedFiles: PROJECT_AGENT_SOURCE_ZIP_MAX_INCLUDED_FILES,
  zipEntryMaxBytes: PROJECT_AGENT_SOURCE_ZIP_ENTRY_MAX_BYTES,
  zipTotalExtractedBytes: PROJECT_AGENT_SOURCE_ZIP_TOTAL_EXTRACTED_BYTES,
};

function getContentType(req) {
  const value = req.headers?.['content-type'];
  return (Array.isArray(value) ? value.join(', ') : String(value || '')).toLowerCase();
}

function hasProjectAgentRunContentType(req) {
  const contentType = getContentType(req);
  return contentType.includes('application/json') || contentType.includes('multipart/form-data');
}

async function getProjectAgentSourceBundle(body, form) {
  const sourceText = body.sourceText;
  const sourceFiles = getMultipartFiles(form, ['sourceFiles']);

  return createProjectAgentSourceBundle({
    sourceText,
    sourceFiles,
  });
}

async function getProjectAgentRunPayload(body, form) {
  assertPlainObject(body, 'Project agent run request body');

  const payload = {
    intent: body.intent,
    instructions: body.instructions,
    projectContext: body.projectContext,
  };
  const sourceText = body.sourceText;
  const sourceFiles = getMultipartFiles(form, ['sourceFiles']);

  if ((typeof sourceText === 'string' && sourceText.trim()) || sourceFiles.length > 0) {
    payload.sourceBundle = await getProjectAgentSourceBundle(body, form);
  }

  return payload;
}

function createProjectAgentSourcePreview(bundle) {
  return {
    hasSourceContext: bundle.hasSourceContext,
    manifest: bundle.manifest,
    warnings: bundle.warnings,
    sourceCount: bundle.sources.length,
    manifestCount: bundle.manifest.length,
    warningCount: bundle.warnings.length,
    limits: SOURCE_PREVIEW_LIMITS,
  };
}

function normalizeRunError(error) {
  if (!(error instanceof ProjectAgentRunError)) {
    return error;
  }

  if (error.type === 'invalid_input' || error.type === 'invalid_intent') {
    const badRequest = new BadRequestError(error.message);
    badRequest.type = error.type;
    badRequest.clientDetails = createClientRunErrorDetails(error, badRequest.message);
    return badRequest;
  }

  const routeError = new Error(getBrowserFacingRunMessage(error));
  routeError.statusCode = 500;
  routeError.type = error.type;
  routeError.details = error.details;
  routeError.clientDetails = createClientRunErrorDetails(error, routeError.message);
  return routeError;
}

function createClientRunErrorDetails(error, browserMessage) {
  const details = error?.details && typeof error.details === 'object' ? error.details : {};
  const clientDetails = {
    type: error.type || 'unknown_failure',
    message: error.message || browserMessage,
  };

  for (const key of [
    'runPlan',
    'intent',
    'hasSourceContext',
    'sourceCount',
    'sourceManifestCount',
    'sourceWarningCount',
    'bridgeType',
    'elapsedMs',
  ]) {
    if (details[key] != null) {
      clientDetails[key] = details[key];
    }
  }

  return clientDetails;
}

function getBrowserFacingRunMessage(error) {
  if (error.type === 'bridge_failure') {
    return error.message || 'Local Codex run failed.';
  }

  if (error.type === 'malformed_wrapper') {
    return 'Local Codex returned an invalid response shape.';
  }

  if (error.type === 'invalid_patch') {
    return 'Local Codex returned an invalid project patch.';
  }

  return 'Project agent run failed.';
}

export function createProjectsAgentRunHandler({ runAgent = runProjectAgent } = {}) {
  return async function handleProjectsAgentRun(req, res) {
    try {
      if (!hasProjectAgentRunContentType(req)) {
        throw new BadRequestError(
          'Project agent run requests must use application/json or multipart/form-data.',
        );
      }

      const { body, form } = await parseAdminRequest(req);
      const payload = await getProjectAgentRunPayload(body, form);
      const result = await runAgent(payload);

      sendJson(res, 200, result);
    } catch (error) {
      sendRouteError(res, normalizeRunError(error));
    }
  };
}

export function createProjectsAgentSourcePreviewHandler({
  createSourceBundle = createProjectAgentSourceBundle,
} = {}) {
  return async function handleProjectsAgentSourcePreview(req, res) {
    try {
      if (!hasProjectAgentRunContentType(req)) {
        throw new BadRequestError(
          'Project agent source preview requests must use application/json or multipart/form-data.',
        );
      }

      const { body, form } = await parseAdminRequest(req);
      assertPlainObject(body, 'Project agent source preview request body');

      const sourceText = body.sourceText;
      const sourceFiles = getMultipartFiles(form, ['sourceFiles']);
      const bundle = await createSourceBundle({ sourceText, sourceFiles });

      sendJson(res, 200, createProjectAgentSourcePreview(bundle));
    } catch (error) {
      sendRouteError(res, error);
    }
  };
}

export function createProjectsAgentRuntimeHandler({
  getRuntimeMetadata = getCodexRuntimeMetadata,
} = {}) {
  return function handleProjectsAgentRuntime(req, res) {
    try {
      sendJson(res, 200, getRuntimeMetadata());
    } catch {
      const routeError = new Error('Project agent runtime metadata could not be loaded.');
      routeError.statusCode = 500;
      sendRouteError(res, routeError);
    }
  };
}

export const handleProjectsAgentRun = createProjectsAgentRunHandler();
export const handleProjectsAgentSourcePreview = createProjectsAgentSourcePreviewHandler();
export const handleProjectsAgentRuntime = createProjectsAgentRuntimeHandler();
