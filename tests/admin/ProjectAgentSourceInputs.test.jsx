import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ProjectAgentSourceInputs from '../../src/admin/projects/ProjectAgentSourceInputs.jsx';
import { createSucceededProjectAgentSourcePreview } from '../../src/admin/projects/projectAgentSourcePreviewState.js';

describe('ProjectAgentSourceInputs', () => {
  it('renders the expanded local source file accept list', () => {
    const html = renderToStaticMarkup(
      <ProjectAgentSourceInputs
        id="project-agent-source-files"
        sourceFiles={[]}
        canPreviewSources={false}
      />,
    );

    expect(html).toContain('accept=".txt,.md,.markdown,.json,.csv,.log,.html,.css,.js,.jsx,.ts,.tsx,.py,.sql,.yaml,.yml,.toml,.xml,.ipynb,.pdf,.zip"');
    expect(html).toContain('.pdf');
    expect(html).toContain('.zip');
  });

  it('renders source preview metadata without raw extracted text', () => {
    const sourcePreview = createSucceededProjectAgentSourcePreview({
      manifest: [
        {
          id: 'source-1',
          kind: 'pdf',
          label: 'report.pdf',
          bytes: 4096,
          pages: 2,
          included: true,
          warnings: [],
          text: 'raw extracted source text must not render',
        },
        {
          id: 'source-2',
          kind: 'text',
          label: 'bundle.zip / src/App.jsx',
          archiveLabel: 'bundle.zip',
          bytes: 1024,
          included: true,
          warnings: [],
          text: 'accepted raw zip entry text must not render',
        },
        {
          id: 'source-3',
          kind: 'text',
          label: 'bundle.zip / dist/app.js',
          archiveLabel: 'bundle.zip',
          bytes: 2048,
          included: false,
          warnings: ['Skipped ignored build output.'],
          text: 'ignored raw zip entry text must not render',
        },
      ],
      warnings: ['Skipped 1 source file beyond the limit.'],
      sourceCount: 2,
      manifestCount: 3,
      warningCount: 1,
    }, 'signature');

    const html = renderToStaticMarkup(
      <ProjectAgentSourceInputs
        id="project-agent-source-files"
        sourceFiles={[
          {
            name: 'report.pdf',
            size: 4096,
            type: 'application/pdf',
            lastModified: 10,
          },
          {
            name: 'bundle.zip',
            size: 8192,
            type: 'application/zip',
            lastModified: 20,
          },
        ]}
        sourcePreview={sourcePreview}
        canPreviewSources
      />,
    );

    expect(html).toContain('report.pdf');
    expect(html).toContain('bundle.zip / src/App.jsx');
    expect(html).toContain('bundle.zip / dist/app.js');
    expect(html).toContain('Included');
    expect(html).toContain('Skipped');
    expect(html).toContain('mixed');
    expect(html).toContain('Skipped ignored build output.');
    expect(html).not.toContain('accepted raw zip entry text must not render');
    expect(html).not.toContain('raw extracted source text must not render');
    expect(html).not.toContain('ignored raw zip entry text must not render');
  });
});
