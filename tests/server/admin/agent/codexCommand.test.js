import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  CodexCommandResolutionError,
  findLatestCodexCommand,
} from '../../../../server/admin/agent/codexCommand.js';

const tempRoots = [];

function createTempRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-command-test-'));
  tempRoots.push(root);
  return root;
}

function createCodexInstall(extensionRoot, name) {
  const command = path.join(
    extensionRoot,
    name,
    'bin',
    'windows-x86_64',
    'codex.exe',
  );

  fs.mkdirSync(path.dirname(command), { recursive: true });
  fs.writeFileSync(command, '');

  return command;
}

describe('Codex command resolution', () => {
  afterEach(() => {
    for (const root of tempRoots.splice(0)) {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('selects the newest installed OpenAI extension Codex executable', () => {
    const extensionRoot = createTempRoot();
    createCodexInstall(extensionRoot, 'openai.chatgpt-26.623.31921-win32-x64');
    const latestCommand = createCodexInstall(
      extensionRoot,
      'openai.chatgpt-26.623.42026-win32-x64',
    );
    createCodexInstall(extensionRoot, 'openai.chatgpt-25.999.99999-win32-x64');

    expect(findLatestCodexCommand({ extensionRoots: [extensionRoot] })).toBe(latestCommand);
  });

  it('ignores extension folders without a Codex executable', () => {
    const extensionRoot = createTempRoot();
    fs.mkdirSync(
      path.join(extensionRoot, 'openai.chatgpt-99.999.99999-win32-x64'),
      { recursive: true },
    );
    const fallbackCommand = createCodexInstall(
      extensionRoot,
      'openai.chatgpt-26.623.42026-win32-x64',
    );

    expect(findLatestCodexCommand({ extensionRoots: [extensionRoot] })).toBe(fallbackCommand);
  });

  it('reports when no local OpenAI extension Codex executable is available', () => {
    const extensionRoot = createTempRoot();

    expect(() => findLatestCodexCommand({ extensionRoots: [extensionRoot] }))
      .toThrow(CodexCommandResolutionError);
  });
});
