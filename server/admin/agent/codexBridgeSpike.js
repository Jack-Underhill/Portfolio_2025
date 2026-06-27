import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { CodexBridgeError, runCodexExecJson } from './codexBridge.js';
import { validateProjectPatchSpikeJson } from './projectPatchSpikeSchema.js';

const DEFAULT_TIMEOUT_MS = 120000;
const dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(dirname, '../../..');

function parsePositiveInteger(value, fallback) {
  if (value == null || value === '') return fallback;

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function createCodexArgs() {
  return [
    'exec',
    '--cd',
    repoRoot,
    '--sandbox',
    'read-only',
    '--ephemeral',
    '--color',
    'never',
    '-',
  ];
}

function validateFakeSpikeJson(json) {
  if (json.status !== 'ok') {
    throw new Error('Fake schema status must be "ok".');
  }

  if (!Array.isArray(json.items) || json.items.length === 0) {
    throw new Error('Fake schema items must be a non-empty array.');
  }

  if (!json.items.every((item) => typeof item === 'string' && item.trim())) {
    throw new Error('Fake schema items must contain only non-empty strings.');
  }

  return {
    itemCount: json.items.length,
  };
}

function createFakePrompt() {
  return [
    'Return only strict JSON. Do not include markdown fences, commentary, or trailing text.',
    'Produce exactly this shape with real string values:',
    '{ "status": "ok", "items": ["one concise local Codex bridge check"] }',
  ].join('\n');
}

function createProjectPatchPrompt() {
  return [
    'Return only strict JSON. Do not include markdown fences, commentary, or trailing text.',
    'Produce a portfolio project draft patch object using only these supported fields:',
    'title, description, features, metrics, techStack, projectType, labels, published, featuredRank.',
    'Use this basic type contract:',
    '- title and description: strings',
    '- features, metrics, and labels: arrays of strings',
    '- techStack: object with any of frontend, backend, data, infrastructure arrays of strings',
    '- projectType: one of school, internship, competition, personal, client, open-source',
    '- published: boolean',
    '- featuredRank: integer or empty string',
    'Return a small plausible patch for a backend-only Local Codex bridge spike.',
  ].join('\n');
}

function formatMs(ms) {
  return `${ms} ms`;
}

function printRunSuccess(label, result) {
  console.log(`${label}: passed in ${formatMs(result.elapsedMs)}`);

  if (result.validationResult?.fields) {
    console.log(`${label} fields: ${result.validationResult.fields.join(', ')}`);
  }

  if (result.validationResult?.itemCount) {
    console.log(`${label} items: ${result.validationResult.itemCount}`);
  }

  if (result.stderr.trim()) {
    console.log(`${label} stderr warning: ${result.stderr.trim()}`);
  }
}

function printFailure(error) {
  if (error instanceof CodexBridgeError) {
    console.error(`Failure: ${error.type} - ${error.message}`);

    if (error.details?.elapsedMs != null) {
      console.error(`Elapsed: ${formatMs(error.details.elapsedMs)}`);
    }

    if (error.details?.stderr) {
      console.error(`stderr: ${error.details.stderr}`);
    }

    if (error.details?.stdout) {
      console.error(`stdout: ${error.details.stdout}`);
    }

    return;
  }

  console.error(`Failure: ${error instanceof Error ? error.message : String(error)}`);
}

async function runSpike() {
  const command = process.env.CODEX_BRIDGE_COMMAND || 'codex';
  const timeoutMs = parsePositiveInteger(process.env.CODEX_BRIDGE_TIMEOUT_MS, DEFAULT_TIMEOUT_MS);
  const args = createCodexArgs();

  console.log('Local Codex bridge spike');
  console.log(`Command: ${command}`);
  console.log(`Arguments: ${args.join(' ')}`);
  console.log(`Timeout: ${timeoutMs} ms`);

  const fakeResult = await runCodexExecJson({
    prompt: createFakePrompt(),
    timeoutMs,
    cwd: repoRoot,
    command,
    args,
    validateJson: validateFakeSpikeJson,
  });

  printRunSuccess('Fake schema', fakeResult);

  const projectPatchResult = await runCodexExecJson({
    prompt: createProjectPatchPrompt(),
    timeoutMs,
    cwd: repoRoot,
    command,
    args,
    validateJson: validateProjectPatchSpikeJson,
  });

  printRunSuccess('Project patch schema', projectPatchResult);
}

runSpike().catch((error) => {
  printFailure(error);
  process.exitCode = 1;
});
