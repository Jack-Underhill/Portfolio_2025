import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { CodexBridgeError, runCodexExecJson } from './codexBridge.js';
import { getProjectAgentMode, ProjectAgentModeError } from './projectAgentModes.js';
import { buildProjectAgentPrompt } from './projectAgentPrompt.js';
import {
  ProjectAgentSchemaError,
  validateProjectAgentOutput,
  validateProjectAgentRunInput,
} from './projectAgentSchema.js';

const DEFAULT_TIMEOUT_MS = 120000;
const dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(dirname, '../../..');

export class ProjectAgentRunError extends Error {
  constructor(type, message, details = {}) {
    super(message);
    this.name = 'ProjectAgentRunError';
    this.type = type;
    this.details = details;
  }
}

export function createProjectAgentCodexArgs(root = repoRoot) {
  return [
    'exec',
    '--cd',
    root,
    '--sandbox',
    'read-only',
    '--ephemeral',
    '--color',
    'never',
    '-',
  ];
}

function normalizeRunError(error) {
  if (error instanceof ProjectAgentRunError) {
    return error;
  }

  if (error instanceof ProjectAgentModeError) {
    return new ProjectAgentRunError('invalid_mode', error.message);
  }

  if (error instanceof ProjectAgentSchemaError) {
    return new ProjectAgentRunError(error.type, error.message, error.details);
  }

  if (error instanceof CodexBridgeError) {
    return new ProjectAgentRunError(
      'bridge_failure',
      `Local Codex run failed: ${error.message}`,
      {
        bridgeType: error.type,
        elapsedMs: error.details?.elapsedMs,
      },
    );
  }

  return new ProjectAgentRunError(
    'unknown_failure',
    error instanceof Error ? error.message : 'Project agent run failed.',
  );
}

function getBridgeJson(bridgeResult) {
  if (bridgeResult && Object.prototype.hasOwnProperty.call(bridgeResult, 'json')) {
    return bridgeResult.json;
  }

  return bridgeResult;
}

export async function runProjectAgent({
  mode,
  instructions,
  projectContext,
  codexBridge = runCodexExecJson,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  cwd = repoRoot,
  command = 'codex',
  args = createProjectAgentCodexArgs(cwd),
} = {}) {
  const startedAt = performance.now();

  try {
    const input = validateProjectAgentRunInput({ mode, instructions, projectContext });
    getProjectAgentMode(input.mode);

    const prompt = buildProjectAgentPrompt(input);
    const bridgeResult = await codexBridge({
      prompt,
      timeoutMs,
      cwd,
      command,
      args,
    });
    const output = validateProjectAgentOutput(getBridgeJson(bridgeResult));

    return {
      ...output,
      elapsedMs: Number.isFinite(bridgeResult?.elapsedMs)
        ? bridgeResult.elapsedMs
        : Math.round(performance.now() - startedAt),
    };
  } catch (error) {
    throw normalizeRunError(error);
  }
}
