import { describe, expect, it } from 'vitest';

import {
  createFailedProjectAgentSourcePreview,
  createIdleProjectAgentSourcePreview,
  createLoadingProjectAgentSourcePreview,
  createProjectAgentSourceInputSignature,
  createSucceededProjectAgentSourcePreview,
  getProjectAgentSourceContextSummary,
  getSourceFilePreviewStatus,
  getSourcePreviewSummary,
  hasProjectAgentRunnableInput,
  hasProjectAgentSourceInput,
} from '../../src/admin/projects/projectAgentSourcePreviewState.js';

describe('project agent source preview state', () => {
  it('detects whether source input is previewable', () => {
    expect(hasProjectAgentSourceInput()).toBe(false);
    expect(hasProjectAgentSourceInput({
      sourceText: '   ',
      sourceFiles: [],
      githubRepoUrl: '   ',
    })).toBe(false);
    expect(hasProjectAgentSourceInput({ sourceText: 'Launch notes' })).toBe(true);
    expect(hasProjectAgentSourceInput({ sourceFiles: [{ name: 'report.pdf' }] })).toBe(true);
    expect(hasProjectAgentSourceInput({ githubRepoUrl: 'https://github.com/example/app' })).toBe(true);
  });

  it('detects whether the agent has runnable input', () => {
    expect(hasProjectAgentRunnableInput()).toBe(false);
    expect(hasProjectAgentRunnableInput({ instructions: '   ' })).toBe(false);
    expect(hasProjectAgentRunnableInput({ instructions: 'Revise the summary.' })).toBe(true);
    expect(hasProjectAgentRunnableInput({ sourceText: 'Launch notes' })).toBe(true);
    expect(hasProjectAgentRunnableInput({ sourceFiles: [{ name: 'report.pdf' }] })).toBe(true);
    expect(hasProjectAgentRunnableInput({
      githubRepoUrl: 'https://github.com/example/app',
    })).toBe(true);
  });

  it('creates signatures that change when pasted source text, selected files, or repo URL change', () => {
    const file = {
      name: 'report.pdf',
      size: 128,
      type: 'application/pdf',
      lastModified: 10,
    };

    const original = createProjectAgentSourceInputSignature({
      sourceText: 'Launch notes',
      sourceFiles: [file],
      githubRepoUrl: 'https://github.com/example/app',
    });

    expect(createProjectAgentSourceInputSignature({
      sourceText: 'Launch notes updated',
      sourceFiles: [file],
      githubRepoUrl: 'https://github.com/example/app',
    })).not.toBe(original);

    expect(createProjectAgentSourceInputSignature({
      sourceText: 'Launch notes',
      sourceFiles: [{ ...file, name: 'bundle.zip' }],
      githubRepoUrl: 'https://github.com/example/app',
    })).not.toBe(original);

    expect(createProjectAgentSourceInputSignature({
      sourceText: 'Launch notes',
      sourceFiles: [file],
      githubRepoUrl: 'https://github.com/example/api',
    })).not.toBe(original);
  });

  it('summarizes loading, success, and failure preview states', () => {
    expect(getSourcePreviewSummary(createIdleProjectAgentSourcePreview())).toBeNull();

    expect(getSourcePreviewSummary(createLoadingProjectAgentSourcePreview('signature'))).toEqual({
      tone: 'loading',
      message: 'Previewing sources...',
    });

    expect(getSourcePreviewSummary(createSucceededProjectAgentSourcePreview({
      manifest: [{ id: 'source-1', included: true }],
      warnings: ['Zip entry skipped.'],
      sourceCount: 1,
      manifestCount: 1,
      warningCount: 1,
    }, 'signature'))).toEqual({
      tone: 'warning',
      message: '1 included, 1 reviewed, 1 warning.',
    });

    expect(getSourcePreviewSummary(createFailedProjectAgentSourcePreview(
      new Error('Preview route failed.'),
      'signature',
    ))).toEqual({
      tone: 'warning',
      message: 'Preview route failed.',
    });
  });

  it('summarizes source context for the compact toolbar label', () => {
    expect(getProjectAgentSourceContextSummary()).toBe('No context');
    expect(getProjectAgentSourceContextSummary({
      sourceFiles: [{ name: 'report.pdf' }, { name: 'notes.md' }],
    })).toBe('2 files');
    expect(getProjectAgentSourceContextSummary({
      sourceText: 'Launch notes',
    })).toBe('pasted notes');
    expect(getProjectAgentSourceContextSummary({
      githubRepoUrl: 'https://github.com/example/app',
    })).toBe('1 repo');
    expect(getProjectAgentSourceContextSummary({
      sourceText: 'Launch notes',
      sourceFiles: [{ name: 'report.pdf' }],
      githubRepoUrl: 'https://github.com/example/app',
    })).toBe('1 file, 1 repo, pasted notes');
    expect(getProjectAgentSourceContextSummary({
      sourcePreview: createLoadingProjectAgentSourcePreview('signature'),
    })).toBe('Previewing context');
    expect(getProjectAgentSourceContextSummary({
      sourcePreview: createFailedProjectAgentSourcePreview(new Error('Nope.'), 'signature'),
    })).toBe('Preview failed');
    expect(getProjectAgentSourceContextSummary({
      sourcePreview: createSucceededProjectAgentSourcePreview({
        manifest: [{ id: 'source-1', included: true }, { id: 'source-2', included: false }],
        sourceCount: 1,
        manifestCount: 2,
        warningCount: 1,
      }, 'signature'),
    })).toBe('1 included, 1 skipped');
    expect(getProjectAgentSourceContextSummary({
      sourcePreview: createSucceededProjectAgentSourcePreview({
        manifest: [{ id: 'source-1', included: true }, { id: 'source-2', included: true }],
        sourceCount: 2,
        manifestCount: 2,
        warningCount: 0,
      }, 'signature'),
    })).toBe('2 included, 2 reviewed');
    expect(getProjectAgentSourceContextSummary({
      sourcePreview: createSucceededProjectAgentSourcePreview({
        manifest: [{ id: 'source-1', included: true }],
        sourceCount: 1,
        manifestCount: 1,
        warningCount: 2,
      }, 'signature'),
    })).toBe('1 included, 2 warnings');
  });

  it('derives per-file preview status from direct and archive manifest entries', () => {
    const sourcePreview = createSucceededProjectAgentSourcePreview({
      manifest: [
        {
          id: 'source-1',
          label: 'report.pdf',
          included: true,
          warnings: [],
        },
        {
          id: 'source-2',
          label: 'bundle.zip / src/App.jsx',
          archiveLabel: 'bundle.zip',
          included: true,
          warnings: [],
        },
        {
          id: 'source-3',
          label: 'bundle.zip / dist/app.js',
          archiveLabel: 'bundle.zip',
          included: false,
          warnings: ['Skipped ignored build output.'],
        },
      ],
      sourceCount: 2,
      manifestCount: 3,
      warningCount: 1,
    }, 'signature');

    expect(getSourceFilePreviewStatus({ name: 'report.pdf' }, sourcePreview)).toEqual({
      tone: 'success',
      label: 'included',
    });

    expect(getSourceFilePreviewStatus({ name: 'bundle.zip' }, sourcePreview)).toEqual({
      tone: 'warning',
      label: 'mixed',
    });

    expect(getSourceFilePreviewStatus({ name: 'missing.md' }, sourcePreview)).toBeNull();
  });
});
