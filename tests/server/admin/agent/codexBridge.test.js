import process from 'node:process';
import { describe, expect, it } from 'vitest';

import {
  CodexBridgeError,
  runCodexExecJson,
} from '../../../../server/admin/agent/codexBridge.js';

const nodeArgs = (snippet) => ['-e', snippet];

function runFixture(snippet, options = {}) {
  return runCodexExecJson({
    command: process.execPath,
    args: nodeArgs(snippet),
    prompt: 'controlled prompt',
    timeoutMs: 1000,
    ...options,
  });
}

async function expectBridgeError(promise, type) {
  await expect(promise).rejects.toMatchObject({
    name: 'CodexBridgeError',
    type,
  });
}

describe('runCodexExecJson', () => {
  it('returns parsed JSON object output from a successful command', async () => {
    await expect(runFixture('process.stdout.write(JSON.stringify({ status: "ok" }))')).resolves
      .toMatchObject({
        ok: true,
        json: { status: 'ok' },
        stdout: '{"status":"ok"}',
        stderr: '',
      });
  });

  it('keeps stderr detail on success without failing the run', async () => {
    await expect(runFixture([
      'process.stderr.write("local warning\\n");',
      'process.stdout.write(JSON.stringify({ status: "ok" }));',
    ].join(''))).resolves.toMatchObject({
      ok: true,
      json: { status: 'ok' },
      stderr: 'local warning\n',
    });
  });

  it('fails malformed JSON output without extracting fenced or commentary text', async () => {
    await expectBridgeError(
      runFixture('process.stdout.write("```json\\\\n{\\\\\\"status\\\\\\":\\\\\\"ok\\\\\\"}\\\\n```")'),
      'malformed_json',
    );
  });

  it('fails valid JSON output when the root is not an object', async () => {
    await expectBridgeError(
      runFixture('process.stdout.write(JSON.stringify(["not", "an", "object"]))'),
      'non_object_json',
    );
  });

  it('fails when the validation callback throws', async () => {
    const promise = runFixture(
      'process.stdout.write(JSON.stringify({ status: "wrong" }))',
      {
        validateJson(json) {
          if (json.status !== 'ok') {
            throw new Error('status must be ok');
          }
        },
      },
    );

    await expectBridgeError(promise, 'validation_failure');
    await expect(promise).rejects.toMatchObject({
      message: 'status must be ok',
    });
  });

  it('fails when the validation callback returns false', async () => {
    await expectBridgeError(
      runFixture('process.stdout.write(JSON.stringify({ status: "wrong" }))', {
        validateJson: () => false,
      }),
      'validation_failure',
    );
  });

  it('fails nonzero exits with exit diagnostics', async () => {
    const promise = runFixture([
      'process.stdout.write("partial output");',
      'process.stderr.write("nope");',
      'process.exit(7);',
    ].join(''));

    await expectBridgeError(promise, 'nonzero_exit');
    await expect(promise).rejects.toMatchObject({
      details: {
        exitCode: 7,
        stdout: 'partial output',
        stderr: 'nope',
      },
    });
  });

  it('fails commands that do not start', async () => {
    await expectBridgeError(
      runCodexExecJson({
        command: 'definitely-not-a-real-codex-bridge-command',
        args: [],
        timeoutMs: 1000,
      }),
      'spawn_failure',
    );
  });

  it('kills and reports a command that exceeds the timeout', async () => {
    await expectBridgeError(
      runFixture('setTimeout(() => process.stdout.write("{}"), 5000);', {
        timeoutMs: 20,
      }),
      'timeout',
    );
  });

  it('passes the prompt to stdin for controlled Codex-style invocation', async () => {
    await expect(runFixture([
      'let input = "";',
      'process.stdin.on("data", (chunk) => { input += chunk; });',
      'process.stdin.on("end", () => {',
      'process.stdout.write(JSON.stringify({ input }));',
      '});',
    ].join(''))).resolves.toMatchObject({
      json: { input: 'controlled prompt' },
    });
  });

  it('exports a typed error class for callers that need structured handling', () => {
    const error = new CodexBridgeError('example', 'Example failure.', { useful: true });

    expect(error).toBeInstanceOf(Error);
    expect(error).toMatchObject({
      name: 'CodexBridgeError',
      type: 'example',
      message: 'Example failure.',
      details: { useful: true },
    });
  });
});
