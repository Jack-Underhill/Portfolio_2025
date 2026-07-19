import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { CodexBridgeError, runCodexExecJson } from './codexBridge.js';
import { CodexCommandResolutionError, findLatestCodexCommand } from './codexCommand.js';
import { buildProjectAgentPrompt } from './projectAgentPrompt.js';
import {
  createProjectAgentRunPlan,
  getProjectAgentIntent,
  ProjectAgentIntentError,
} from './projectAgentRunPlan.js';
import {
  ProjectAgentSchemaError,
  validateProjectAgentOutput,
  validateProjectAgentRunInput,
} from './projectAgentSchema.js';
import { createProjectAgentValidationPreflight } from './projectAgentValidationPreflight.js';

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

function parsePositiveInteger(value, fallback) {
  if (value == null || value === '') return fallback;

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getDefaultTimeoutMs() {
  return parsePositiveInteger(process.env.CODEX_BRIDGE_TIMEOUT_MS, DEFAULT_TIMEOUT_MS);
}

function normalizeRunError(error) {
  if (error instanceof ProjectAgentRunError) {
    return error;
  }

  if (error instanceof ProjectAgentIntentError) {
    return new ProjectAgentRunError('invalid_intent', error.message);
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

  if (error instanceof CodexCommandResolutionError) {
    return new ProjectAgentRunError(
      'bridge_failure',
      `Local Codex run failed: ${error.message}`,
      {
        bridgeType: 'command_resolution_failure',
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

function getSourceDiagnosticContext(sourceBundle) {
  const manifest = Array.isArray(sourceBundle?.manifest) ? sourceBundle.manifest : [];
  const sourceCount = Array.isArray(sourceBundle?.sources) ? sourceBundle.sources.length : 0;

  return {
    hasSourceContext: sourceBundle?.hasSourceContext === true,
    sourceCount,
    sourceManifestCount: manifest.length,
    sourceWarningCount: Array.isArray(sourceBundle?.warnings) ? sourceBundle.warnings.length : 0,
  };
}

export async function runProjectAgent({
  intent,
  instructions,
  projectContext,
  sourceBundle,
  codexBridge = runCodexExecJson,
  timeoutMs = getDefaultTimeoutMs(),
  cwd = repoRoot,
  command,
  commandResolver = findLatestCodexCommand,
  args = createProjectAgentCodexArgs(cwd),
} = {}) {
  const startedAt = performance.now();
  let diagnosticContext = {};

  try {
    const input = validateProjectAgentRunInput({
      intent,
      instructions,
      projectContext,
      sourceBundle,
    });
    const ownerIntent = getProjectAgentIntent(input.intent);
    const runPlan = createProjectAgentRunPlan({
      intent: ownerIntent.id,
      projectContext: input.projectContext,
      hasSourceContext: input.sourceBundle?.hasSourceContext === true,
    });
    diagnosticContext = {
      intent: ownerIntent.id,
      runPlan: runPlan.id,
      ...getSourceDiagnosticContext(input.sourceBundle),
    };

    const prompt = buildProjectAgentPrompt({
      ...input,
      runPlan: runPlan.id,
    });
    const resolvedCommand = command ?? commandResolver();
    const bridgeResult = await codexBridge({
      prompt,
      timeoutMs,
      cwd,
      command: resolvedCommand,
      args,
    });
    const output = validateProjectAgentOutput(getBridgeJson(bridgeResult), {
      ignorePatch: ownerIntent.id === 'review',
    });
    const validationPreflight = ownerIntent.id === 'revise'
      ? createProjectAgentValidationPreflight({
        intent: ownerIntent.id,
        projectContext: input.projectContext,
        patch: output.patch,
      })
      : undefined;

    return {
      ...output,
      ...(validationPreflight ? { validationPreflight } : {}),
      warnings: [
        ...output.warnings,
        ...(input.sourceBundle?.warnings ?? []),
      ],
      intent: ownerIntent.id,
      runPlan: runPlan.id,
      sourceManifest: input.sourceBundle?.manifest ?? [],
      elapsedMs: Number.isFinite(bridgeResult?.elapsedMs)
        ? bridgeResult.elapsedMs
        : Math.round(performance.now() - startedAt),
    };
  } catch (error) {
    const normalizedError = normalizeRunError(error);
    normalizedError.details = {
      ...normalizedError.details,
      ...diagnosticContext,
    };
    throw normalizedError;
  }
}
