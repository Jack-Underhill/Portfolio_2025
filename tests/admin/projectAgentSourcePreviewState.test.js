import { describe, expect, it } from 'vitest';

import {
  createFailedProjectAgentSourcePreview,
  createIdleProjectAgentSourcePreview,
  createLoadingProjectAgentSourcePreview,
  createProjectAgentSourceInputSignature,
  createSucceededProjectAgentSourcePreview,
  getSourceFilePreviewStatus,
  getSourcePreviewSummary,
  hasProjectAgentSourceInput,
} from '../../src/admin/projects/projectAgentSourcePreviewState.js';

describe('project agent source preview state', () => {
  it('detects whether source input is previewable', () => {
    expect(hasProjectAgentSourceInput()).toBe(false);
    expect(hasProjectAgentSourceInput({ sourceText: '   ', sourceFiles: [] })).toBe(false);
    expect(hasProjectAgentSourceInput({ sourceText: 'Launch notes' })).toBe(true);
    expect(hasProjectAgentSourceInput({ sourceFiles: [{ name: 'report.pdf' }] })).toBe(true);
  });

  it('creates signatures that change when pasted source text or selected files change', () => {
    const file = {
      name: 'report.pdf',
      size: 128,
      type: 'application/pdf',
      lastModified: 10,
    };

    const original = createProjectAgentSourceInputSignature({
      sourceText: 'Launch notes',
      sourceFiles: [file],
    });

    expect(createProjectAgentSourceInputSignature({
      sourceText: 'Launch notes updated',
      sourceFiles: [file],
    })).not.toBe(original);

    expect(createProjectAgentSourceInputSignature({
      sourceText: 'Launch notes',
      sourceFiles: [{ ...file, name: 'bundle.zip' }],
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
