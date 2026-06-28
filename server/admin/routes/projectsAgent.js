import { ProjectAgentRunError, runProjectAgent } from '../agent/projectAgentRun.js';
import { BadRequestError, assertPlainObject, parseAdminRequest } from './requestBody.js';
import { sendJson, sendRouteError } from './responses.js';

function hasJsonContentType(req) {
  const value = req.headers?.['content-type'];
  const contentType = Array.isArray(value) ? value.join(', ') : String(value || '');
  return contentType.toLowerCase().includes('application/json');
}

function getProjectAgentRunPayload(body) {
  assertPlainObject(body, 'Project agent run request body');

  return {
    intent: body.intent,
    instructions: body.instructions,
    projectContext: body.projectContext,
  };
}

function normalizeRunError(error) {
  if (!(error instanceof ProjectAgentRunError)) {
    return error;
  }

  if (error.type === 'invalid_input' || error.type === 'invalid_intent') {
    const badRequest = new BadRequestError(error.message);
    badRequest.type = error.type;
    return badRequest;
  }

  const routeError = new Error(getBrowserFacingRunMessage(error));
  routeError.statusCode = 500;
  routeError.type = error.type;
  routeError.details = error.details;
  return routeError;
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
      if (!hasJsonContentType(req)) {
        throw new BadRequestError('Project agent run requests must use application/json.');
      }

      const { body } = await parseAdminRequest(req);
      const payload = getProjectAgentRunPayload(body);
      const result = await runAgent(payload);

      sendJson(res, 200, result);
    } catch (error) {
      sendRouteError(res, normalizeRunError(error));
    }
  };
}

export const handleProjectsAgentRun = createProjectsAgentRunHandler();
