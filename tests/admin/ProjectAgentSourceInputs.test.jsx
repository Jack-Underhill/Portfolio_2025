import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ProjectAgentSourceInputs, {
  ProjectAgentSourceContextTray,
} from '../../src/admin/projects/ProjectAgentSourceInputs.jsx';
import { createSucceededProjectAgentSourcePreview } from '../../src/admin/projects/projectAgentSourcePreviewState.js';

describe('ProjectAgentSourceInputs', () => {
  it('renders the default context trigger and expanded local source file accept list', () => {
    const html = renderToStaticMarkup(
      <ProjectAgentSourceInputs
        id="project-agent-source-files"
        sourceTextId="project-agent-source-material"
        githubRepoUrlId="project-agent-github-repo-url"
        sourceFiles={[]}
        canPreviewSources={false}
      />,
    );

    expect(html).toContain('Add source context');
    expect(html).toContain('No context');
    expect(html).toContain('accept="');
    expect(html).toContain('.java');
    expect(html).toContain('.go');
    expect(html).toContain('.rs');
    expect(html).toContain('.vue');
    expect(html).toContain('.svelte');
    expect(html).toContain('.astro');
    expect(html).toContain('.graphql');
    expect(html).toContain('.proto');
    expect(html).toContain('.dockerfile');
    expect(html).toContain('Dockerfile');
    expect(html).toContain('.env.example');
    expect(html).toContain('.pdf');
    expect(html).toContain('.zip');
    expect(html).not.toContain('id="project-agent-github-repo-url"');
    expect(html).not.toContain('id="project-agent-source-material"');
  });

  it('keeps selected source file details out of the toolbar source controls', () => {
    const html = renderToStaticMarkup(
      <ProjectAgentSourceInputs
        id="project-agent-source-files"
        sourceTextId="project-agent-source-material"
        githubRepoUrlId="project-agent-github-repo-url"
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
      />,
    );

    expect(html).toContain('2 files');
    expect(html).toContain('Clear files');
    expect(html).toContain('Clear uploaded files');
    expect(html).not.toContain('report.pdf');
    expect(html).not.toContain('bundle.zip');
    expect(html).not.toContain('Selected source files');
    expect(html).not.toContain('Preview context');
  });

  it('renders optional context rows as disabled while source controls are disabled', () => {
    const html = renderToStaticMarkup(
      <ProjectAgentSourceInputs
        id="project-agent-source-files"
        sourceTextId="project-agent-source-material"
        githubRepoUrlId="project-agent-github-repo-url"
        sourceText="Evidence copied from the local notes."
        sourceFiles={[]}
        githubRepoUrl="https://github.com/example/portfolio"
        isSourceTextInputVisible
        isGithubRepoUrlInputVisible
        disabled
      />,
    );

    expect(html).toContain('id="project-agent-source-material"');
    expect(html).toContain('Source material');
    expect(html).toContain('Evidence copied from the local notes.');
    expect(html).toContain('id="project-agent-github-repo-url"');
    expect(html).toContain('GitHub repository URL');
    expect(html).toContain('value="https://github.com/example/portfolio"');
    expect(html).toContain('disabled=""');
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
      <ProjectAgentSourceContextTray
        sourceText="Notes copied from the owner workspace."
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
    expect(html).toContain('Uploaded files');
    expect(html).toContain('2 selected');
    expect(html).toContain('Pasted notes');
    expect(html).toContain('Hide preview');
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('Remove source file report.pdf');
    expect(html).toContain('bundle.zip / src/App.jsx');
    expect(html).toContain('bundle.zip / dist/app.js');
    expect(html).toContain('Included');
    expect(html).toContain('Skipped');
    expect(html).toContain('mixed');
    expect(html).toContain('Skipped ignored build output.');
    expect(html).not.toContain('accepted raw zip entry text must not render');
    expect(html).not.toContain('raw extracted source text must not render');
    expect(html).not.toContain('ignored raw zip entry text must not render');
    expect(html.indexOf('Uploaded files')).toBeLessThan(html.indexOf('Hide preview'));
  });

  it('renders the preview context action below uploaded files before preview data exists', () => {
    const html = renderToStaticMarkup(
      <ProjectAgentSourceContextTray
        sourceFiles={[
          {
            name: 'report.pdf',
            size: 4096,
            type: 'application/pdf',
            lastModified: 10,
          },
        ]}
        canPreviewSources
      />,
    );

    expect(html).toContain('Uploaded files');
    expect(html).toContain('Preview context');
    expect(html.indexOf('Uploaded files')).toBeLessThan(html.indexOf('Preview context'));
  });

  it('renders GitHub source preview metadata generically without raw fetched text', () => {
    const sourcePreview = createSucceededProjectAgentSourcePreview({
      manifest: [
        {
          id: 'source-1',
          kind: 'github-file',
          label: 'example/portfolio:src/App.jsx',
          repo: 'example/portfolio',
          ref: 'main',
          path: 'src/App.jsx',
          sourceUrl: 'https://github.com/example/portfolio/blob/main/src/App.jsx',
          bytes: 2048,
          included: true,
          warnings: [],
          text: 'raw fetched repository text must not render',
        },
      ],
      warnings: [],
      sourceCount: 1,
      manifestCount: 1,
      warningCount: 0,
    }, 'signature');

    const html = renderToStaticMarkup(
      <ProjectAgentSourceContextTray
        sourceFiles={[]}
        githubRepoUrl="https://github.com/example/portfolio"
        sourcePreview={sourcePreview}
        canPreviewSources
      />,
    );

    expect(html).toContain('example/portfolio:src/App.jsx');
    expect(html).toContain('github-file');
    expect(html).toContain('GitHub repo');
    expect(html).toContain('Hide preview');
    expect(html).not.toContain('raw fetched repository text must not render');
  });
});
