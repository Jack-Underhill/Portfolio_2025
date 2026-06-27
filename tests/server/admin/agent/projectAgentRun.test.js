import { describe, expect, it } from 'vitest';

import { CodexBridgeError } from '../../../../server/admin/agent/codexBridge.js';
import { runProjectAgent } from '../../../../server/admin/agent/projectAgentRun.js';
import { validateProjectAgentOutput } from '../../../../server/admin/agent/projectAgentSchema.js';

const projectContext = {
  projectContext: {
    id: 42,
    title: 'Current title',
    permalink: 'current-title',
    projectType: 'personal',
    labels: ['Portfolio'],
  },
  draft: {
    title: 'Current title',
    description: 'Current card copy',
  },
};

describe('project agent run helpers', () => {
  it('validates and normalizes a fake Codex wrapper response', async () => {
    const result = await runProjectAgent({
      mode: 'revise-current-case-study',
      instructions: 'Update the title.',
      projectContext,
      codexBridge: async ({ prompt }) => {
        expect(prompt).toContain('Update the title.');

        return {
          json: {
            patch: {
              title: ' Revised case study ',
              id: 999,
            },
            notes: [' Trimmed the title. ', ''],
            warnings: [' Review the final title. '],
          },
          elapsedMs: 12,
        };
      },
    });

    expect(result).toEqual({
      patch: { title: 'Revised case study' },
      notes: ['Trimmed the title.'],
      warnings: [
        'Review the final title.',
        'Ignored unsupported project draft field "id".',
      ],
      appliedFields: ['title'],
      elapsedMs: 12,
    });
  });

  it('normalizes missing notes and warnings to empty arrays', () => {
    expect(validateProjectAgentOutput({
      patch: {
        description: ' New card copy ',
      },
    })).toEqual({
      patch: {
        description: 'New card copy',
      },
      notes: [],
      warnings: [],
      appliedFields: ['description'],
    });
  });

  it('reports malformed wrapper output with a structured error', async () => {
    await expect(runProjectAgent({
      mode: 'revise-current-case-study',
      instructions: 'Update the title.',
      projectContext,
      codexBridge: async () => ({
        json: {
          patch: [],
          notes: [],
          warnings: [],
        },
      }),
    })).rejects.toMatchObject({
      name: 'ProjectAgentRunError',
      type: 'malformed_wrapper',
      message: 'Project agent output patch must be an object.',
    });
  });

  it('rejects invalid notes and warnings instead of coercing non-strings', async () => {
    await expect(runProjectAgent({
      mode: 'revise-current-case-study',
      instructions: 'Update the title.',
      projectContext,
      codexBridge: async () => ({
        json: {
          patch: {},
          notes: ['ok', 42],
          warnings: [],
        },
      }),
    })).rejects.toMatchObject({
      type: 'malformed_wrapper',
      message: 'notes item 2 must be a string.',
    });
  });

  it('keeps unsupported-only patches as warnings without applying fields', async () => {
    await expect(runProjectAgent({
      mode: 'revise-current-case-study',
      instructions: 'Try changing identity.',
      projectContext,
      codexBridge: async () => ({
        json: {
          patch: {
            permalink: 'new-slug',
          },
          notes: [],
          warnings: [],
        },
      }),
    })).resolves.toMatchObject({
      patch: {},
      warnings: ['Ignored unsupported project draft field "permalink".'],
      appliedFields: [],
    });
  });

  it('reports invalid patch fields through the project draft contract', async () => {
    await expect(runProjectAgent({
      mode: 'revise-current-case-study',
      instructions: 'Update features.',
      projectContext,
      codexBridge: async () => ({
        json: {
          patch: {
            features: 'not an array',
          },
          notes: [],
          warnings: [],
        },
      }),
    })).rejects.toMatchObject({
      type: 'invalid_patch',
      message: 'features must be an array.',
    });
  });

  it('reports invalid mode and invalid request input before invoking the bridge', async () => {
    let calls = 0;
    const codexBridge = async () => {
      calls += 1;
      return { json: { patch: {} } };
    };

    await expect(runProjectAgent({
      mode: 'review-current-case-study',
      instructions: 'Review this.',
      projectContext,
      codexBridge,
    })).rejects.toMatchObject({
      type: 'invalid_mode',
    });

    await expect(runProjectAgent({
      mode: 'revise-current-case-study',
      instructions: ' ',
      projectContext,
      codexBridge,
    })).rejects.toMatchObject({
      type: 'invalid_input',
      message: 'Project agent instructions are required.',
    });

    expect(calls).toBe(0);
  });

  it('normalizes Codex bridge failures without exposing raw diagnostics', async () => {
    await expect(runProjectAgent({
      mode: 'revise-current-case-study',
      instructions: 'Update the title.',
      projectContext,
      codexBridge: async () => {
        throw new CodexBridgeError('timeout', 'Command timed out after 120000 ms.', {
          stdout: 'large raw output',
          stderr: 'large raw stderr',
          elapsedMs: 120000,
        });
      },
    })).rejects.toMatchObject({
      type: 'bridge_failure',
      message: 'Local Codex run failed: Command timed out after 120000 ms.',
      details: {
        bridgeType: 'timeout',
        elapsedMs: 120000,
      },
    });
  });
});
