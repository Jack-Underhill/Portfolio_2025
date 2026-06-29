import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CONFIG_FILE_NAME = 'config.toml';
const USER_CONFIG_SOURCE = 'user-config';
const USER_CONFIG_SOURCE_LABEL = 'Codex user config';
const DEFAULT_MODEL_LABEL = 'Codex default';
const DEFAULT_MODEL_SOURCE = 'default';
const DEFAULT_MODEL_SOURCE_LABEL = 'Codex built-in default';

function getHomeDir(env = process.env) {
  return env.USERPROFILE || os.homedir();
}

function getCodexConfigPath({ env = process.env, homeDir = getHomeDir(env) } = {}) {
  const codexHome = typeof env.CODEX_HOME === 'string' ? env.CODEX_HOME.trim() : '';
  const configRoot = codexHome || path.join(homeDir, '.codex');

  return path.join(configRoot, CONFIG_FILE_NAME);
}

function createFallbackMetadata() {
  return {
    model: null,
    modelReasoningEffort: null,
    modelLabel: DEFAULT_MODEL_LABEL,
    modelSource: DEFAULT_MODEL_SOURCE,
    modelSourceLabel: DEFAULT_MODEL_SOURCE_LABEL,
    isModelExplicit: false,
  };
}

function stripInlineComment(value) {
  let quote = null;

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    const previous = value[index - 1];

    if ((character === '"' || character === "'") && previous !== '\\') {
      quote = quote === character ? null : quote || character;
      continue;
    }

    if (character === '#' && quote == null) {
      return value.slice(0, index).trim();
    }
  }

  return value.trim();
}

function parseTomlString(value) {
  const trimmed = stripInlineComment(value);
  const match = trimmed.match(/^"([^"\\]*(?:\\.[^"\\]*)*)"$/)
    ?? trimmed.match(/^'([^']*)'$/);

  if (!match) return null;

  if (trimmed.startsWith("'")) {
    return match[1];
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

export function parseCodexRuntimeConfig(content) {
  const values = {
    model: null,
    modelReasoningEffort: null,
  };

  for (const rawLine of String(content).split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    if (line.startsWith('[')) break;

    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (key !== 'model' && key !== 'model_reasoning_effort') continue;

    const parsedValue = parseTomlString(rawValue);
    if (parsedValue == null || parsedValue.trim() === '') continue;

    if (key === 'model') {
      values.model = parsedValue;
    } else {
      values.modelReasoningEffort = parsedValue;
    }
  }

  return values;
}

function normalizeRuntimeMetadata(configValues) {
  if (!configValues?.model) {
    return createFallbackMetadata();
  }

  return {
    model: configValues.model,
    modelReasoningEffort: configValues.modelReasoningEffort || null,
    modelLabel: configValues.model,
    modelSource: USER_CONFIG_SOURCE,
    modelSourceLabel: USER_CONFIG_SOURCE_LABEL,
    isModelExplicit: true,
  };
}

export function getCodexRuntimeMetadata({
  env = process.env,
  homeDir = getHomeDir(env),
  existsSync = fs.existsSync,
  readFileSync = fs.readFileSync,
} = {}) {
  const configPath = getCodexConfigPath({ env, homeDir });

  try {
    if (!existsSync(configPath)) {
      return createFallbackMetadata();
    }

    const content = readFileSync(configPath, 'utf8');
    return normalizeRuntimeMetadata(parseCodexRuntimeConfig(content));
  } catch {
    return createFallbackMetadata();
  }
}
