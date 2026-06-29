import { getCodexRuntimeMetadata } from '../agent/codexRuntimeMetadata.js';
import { ProjectAgentRunError, runProjectAgent } from '../agent/projectAgentRun.js';
import { createProjectAgentSourceBundle } from '../agent/sourceBundle.js';
import {
  BadRequestError,
  assertPlainObject,
  getMultipartFiles,
  parseAdminRequest,
} from './requestBody.js';
import { sendJson, sendRouteError } from './responses.js';

function getContentType(req) {
  const value = req.headers?.['content-type'];
  return (Array.isArray(value) ? value.join(', ') : String(value || '')).toLowerCase();
}

function hasProjectAgentRunContentType(req) {
  const contentType = getContentType(req);
  return contentType.includes('application/json') || contentType.includes('multipart/form-data');
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
    payload.sourceBundle = await createProjectAgentSourceBundle({
      sourceText,
      sourceFiles,
    });
  }

  return payload;
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
export const handleProjectsAgentRuntime = createProjectsAgentRuntimeHandler();
