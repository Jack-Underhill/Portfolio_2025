import { spawn } from 'node:child_process';

const DEFAULT_TIMEOUT_MS = 120000;
const DIAGNOSTIC_LIMIT = 2000;

function trimDiagnostic(value) {
  const text = String(value ?? '').trim();

  if (text.length <= DIAGNOSTIC_LIMIT) {
    return text;
  }

  return `${text.slice(0, DIAGNOSTIC_LIMIT)}...`;
}

function isJsonObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function normalizeValidationError(error) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error || 'JSON validation failed.');
}

export class CodexBridgeError extends Error {
  constructor(type, message, details = {}) {
    super(message);
    this.name = 'CodexBridgeError';
    this.type = type;
    this.details = details;
  }
}

export async function runCodexExecJson({
  prompt,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  cwd,
  command = 'codex',
  args = ['exec'],
  validateJson,
} = {}) {
  if (typeof command !== 'string' || command.trim() === '') {
    throw new TypeError('runCodexExecJson requires a command.');
  }

  if (!Array.isArray(args)) {
    throw new TypeError('runCodexExecJson args must be an array.');
  }

  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new TypeError('runCodexExecJson timeoutMs must be a positive number.');
  }

  const startedAt = performance.now();
  const child = spawn(command, args, {
    cwd,
    stdio: ['pipe', 'pipe', 'pipe'],
    windowsHide: true,
  });

  let stdout = '';
  let stderr = '';
  let timedOut = false;
  let settled = false;

  const childResult = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, timeoutMs);

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');

    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });

    child.on('error', (error) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeout);
      reject(new CodexBridgeError('spawn_failure', `Failed to start ${command}.`, {
        command,
        args,
        cause: error.message,
      }));
    });

    child.on('close', (exitCode, signal) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeout);
      resolve({ exitCode, signal });
    });
  });

  if (prompt != null) {
    child.stdin.end(String(prompt));
  } else {
    child.stdin.end();
  }

  const { exitCode, signal } = await childResult;
  const elapsedMs = Math.round(performance.now() - startedAt);
  const diagnostics = {
    command,
    args,
    exitCode,
    signal,
    elapsedMs,
    stdout: trimDiagnostic(stdout),
    stderr: trimDiagnostic(stderr),
  };

  if (timedOut) {
    throw new CodexBridgeError('timeout', `Command timed out after ${timeoutMs} ms.`, {
      ...diagnostics,
      timeoutMs,
    });
  }

  if (exitCode !== 0) {
    throw new CodexBridgeError('nonzero_exit', `Command exited with code ${exitCode}.`, diagnostics);
  }

  let json;

  try {
    json = JSON.parse(stdout);
  } catch (error) {
    throw new CodexBridgeError('malformed_json', 'Command stdout was not valid JSON.', {
      ...diagnostics,
      cause: error.message,
    });
  }

  if (!isJsonObject(json)) {
    throw new CodexBridgeError('non_object_json', 'Command stdout JSON must be an object.', diagnostics);
  }

  let validationResult;

  if (typeof validateJson === 'function') {
    try {
      validationResult = await validateJson(json);
    } catch (error) {
      throw new CodexBridgeError('validation_failure', normalizeValidationError(error), {
        ...diagnostics,
        json,
      });
    }

    if (validationResult === false) {
      throw new CodexBridgeError('validation_failure', 'JSON validation failed.', {
        ...diagnostics,
        json,
      });
    }
  }

  return {
    ok: true,
    json,
    validationResult,
    stdout,
    stderr,
    elapsedMs,
    command,
    args,
  };
}
