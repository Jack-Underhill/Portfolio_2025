import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const OPENAI_EXTENSION_PREFIX = 'openai.chatgpt-';
const WINDOWS_CODEX_EXE_RELATIVE_PATH = path.join('bin', 'windows-x86_64', 'codex.exe');

export class CodexCommandResolutionError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'CodexCommandResolutionError';
    this.details = details;
  }
}

function getHomeDir() {
  return process.env.USERPROFILE || os.homedir();
}

function getDefaultExtensionRoots() {
  const homeDir = getHomeDir();

  return [
    path.join(homeDir, '.vscode', 'extensions'),
    path.join(homeDir, '.vscode-insiders', 'extensions'),
  ];
}

function parseVersionSegments(extensionName) {
  const suffix = extensionName.startsWith(OPENAI_EXTENSION_PREFIX)
    ? extensionName.slice(OPENAI_EXTENSION_PREFIX.length)
    : extensionName;
  const versionMatch = suffix.match(/^(\d+(?:\.\d+)*)/);

  if (!versionMatch) {
    return [];
  }

  return versionMatch[1].split('.').map((segment) => Number(segment));
}

function compareVersionSegments(left, right) {
  const maxLength = Math.max(left.length, right.length);

  for (let index = 0; index < maxLength; index += 1) {
    const leftValue = left[index] ?? 0;
    const rightValue = right[index] ?? 0;

    if (leftValue !== rightValue) {
      return leftValue - rightValue;
    }
  }

  return 0;
}

export function findLatestCodexCommand({
  extensionRoots = getDefaultExtensionRoots(),
  existsSync = fs.existsSync,
  readdirSync = fs.readdirSync,
  statSync = fs.statSync,
} = {}) {
  const candidates = [];

  for (const extensionRoot of extensionRoots) {
    if (!existsSync(extensionRoot)) continue;

    const entries = readdirSync(extensionRoot, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() || !entry.name.startsWith(OPENAI_EXTENSION_PREFIX)) continue;

      const extensionPath = path.join(extensionRoot, entry.name);
      const command = path.join(extensionPath, WINDOWS_CODEX_EXE_RELATIVE_PATH);
      if (!existsSync(command)) continue;

      candidates.push({
        command,
        name: entry.name,
        version: parseVersionSegments(entry.name),
        mtimeMs: statSync(extensionPath).mtimeMs,
      });
    }
  }

  candidates.sort((left, right) => {
    const versionOrder = compareVersionSegments(right.version, left.version);
    if (versionOrder !== 0) return versionOrder;

    return right.mtimeMs - left.mtimeMs;
  });

  const selected = candidates[0]?.command;
  if (selected) {
    return selected;
  }

  throw new CodexCommandResolutionError(
    'Could not find a local Codex executable in the installed OpenAI VS Code extension folders.',
    { extensionRoots },
  );
}
