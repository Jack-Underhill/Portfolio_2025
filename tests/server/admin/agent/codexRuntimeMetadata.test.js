import path from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  getCodexRuntimeMetadata,
  parseCodexRuntimeConfig,
} from '../../../../server/admin/agent/codexRuntimeMetadata.js';

function createFakeFs({ configPath, content, exists = true } = {}) {
  const readPaths = [];

  return {
    readPaths,
    existsSync(candidatePath) {
      return exists && candidatePath === configPath;
    },
    readFileSync(candidatePath) {
      readPaths.push(candidatePath);
      if (candidatePath !== configPath) {
        throw new Error(`Unexpected read: ${candidatePath}`);
      }

      return content;
    },
  };
}

describe('Codex runtime metadata', () => {
  it('returns explicit browser-safe model metadata from user config', () => {
    const homeDir = path.join('C:', 'Users', 'owner');
    const configPath = path.join(homeDir, '.codex', 'config.toml');
    const fakeFs = createFakeFs({
      configPath,
      content: 'model = "gpt-5.5"\nmodel_reasoning_effort = "high"\n',
    });

    expect(getCodexRuntimeMetadata({
      env: {},
      homeDir,
      existsSync: fakeFs.existsSync,
      readFileSync: fakeFs.readFileSync,
    })).toEqual({
      model: 'gpt-5.5',
      modelReasoningEffort: 'high',
      modelLabel: 'gpt-5.5',
      modelSource: 'user-config',
      modelSourceLabel: 'Codex user config',
      isModelExplicit: true,
    });
  });

  it('supports explicit reasoning effort without exposing raw config content', () => {
    const metadata = getCodexRuntimeMetadata({
      env: {},
      homeDir: '/home/owner',
      existsSync: () => true,
      readFileSync: () => 'model = "gpt-5"\nmodel_reasoning_effort = "medium"\napi_key = "sk-hidden"\n',
    });

    expect(metadata.modelReasoningEffort).toBe('medium');
    expect(Object.values(metadata)).not.toContain('sk-hidden');
    expect(Object.keys(metadata)).toEqual([
      'model',
      'modelReasoningEffort',
      'modelLabel',
      'modelSource',
      'modelSourceLabel',
      'isModelExplicit',
    ]);
  });

  it('does not expose environment values or local config paths', () => {
    const homeDir = '/home/owner';
    const codexHome = '/private/codex-home';
    const configPath = path.join(codexHome, 'config.toml');
    const fakeFs = createFakeFs({
      configPath,
      content: 'model = "gpt-5"\nmodel_reasoning_effort = "high"\n',
    });

    const metadata = getCodexRuntimeMetadata({
      env: {
        CODEX_HOME: codexHome,
        OPENAI_API_KEY: 'sk-env-hidden',
      },
      homeDir,
      existsSync: fakeFs.existsSync,
      readFileSync: fakeFs.readFileSync,
    });

    expect(Object.values(metadata)).not.toContain(codexHome);
    expect(Object.values(metadata)).not.toContain(configPath);
    expect(Object.values(metadata)).not.toContain('sk-env-hidden');
  });

  it('returns Codex default metadata when config is missing', () => {
    expect(getCodexRuntimeMetadata({
      env: {},
      homeDir: '/home/owner',
      existsSync: () => false,
      readFileSync: () => {
        throw new Error('should not read missing config');
      },
    })).toEqual({
      model: null,
      modelReasoningEffort: null,
      modelLabel: 'Codex default',
      modelSource: 'default',
      modelSourceLabel: 'Codex built-in default',
      isModelExplicit: false,
    });
  });

  it('returns Codex default metadata for empty config', () => {
    expect(getCodexRuntimeMetadata({
      env: {},
      homeDir: '/home/owner',
      existsSync: () => true,
      readFileSync: () => '\n# no model here\n',
    }).modelLabel).toBe('Codex default');
  });

  it('ignores comments and parses supported top-level string assignments', () => {
    expect(parseCodexRuntimeConfig(`
      # Codex settings
      model = "gpt-5" # inline comment
      model_reasoning_effort = 'low'
    `)).toEqual({
      model: 'gpt-5',
      modelReasoningEffort: 'low',
    });
  });

  it('falls back when the model assignment uses unsupported syntax', () => {
    expect(getCodexRuntimeMetadata({
      env: {},
      homeDir: '/home/owner',
      existsSync: () => true,
      readFileSync: () => 'model = gpt-5\nmodel_reasoning_effort = "high"\n',
    })).toMatchObject({
      model: null,
      modelReasoningEffort: null,
      modelLabel: 'Codex default',
      isModelExplicit: false,
    });
  });

  it('uses CODEX_HOME when resolving the injected config location', () => {
    const configPath = path.join('/tmp/custom-codex-home', 'config.toml');
    const fakeFs = createFakeFs({
      configPath,
      content: 'model = "gpt-5-mini"\n',
    });

    const metadata = getCodexRuntimeMetadata({
      env: { CODEX_HOME: '/tmp/custom-codex-home' },
      homeDir: '/home/owner',
      existsSync: fakeFs.existsSync,
      readFileSync: fakeFs.readFileSync,
    });

    expect(metadata.model).toBe('gpt-5-mini');
    expect(fakeFs.readPaths).toEqual([configPath]);
  });

  it('does not read auth files while resolving runtime metadata', () => {
    const homeDir = '/home/owner';
    const configPath = path.join(homeDir, '.codex', 'config.toml');
    const fakeFs = createFakeFs({
      configPath,
      content: 'model = "gpt-5"\n',
    });

    getCodexRuntimeMetadata({
      env: {},
      homeDir,
      existsSync: fakeFs.existsSync,
      readFileSync: fakeFs.readFileSync,
    });

    expect(fakeFs.readPaths).toEqual([configPath]);
    expect(fakeFs.readPaths.some((readPath) => readPath.endsWith('auth.json'))).toBe(false);
  });
});
