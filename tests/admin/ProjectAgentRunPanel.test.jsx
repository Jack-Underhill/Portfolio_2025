import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ProjectAgentRunPanel from '../../src/admin/projects/ProjectAgentRunPanel.jsx';

describe('ProjectAgentRunPanel', () => {
  it('renders passed validation preflight copy when present', () => {
    const html = renderToStaticMarkup(
      <ProjectAgentRunPanel
        agentRun={{
          status: 'succeeded',
          intent: 'revise',
          runPlan: 'revise-current-case-study',
          notes: [],
          warnings: [],
          validationPreflight: {
            status: 'passed',
            message: 'Validation preflight passed for the revised draft.',
            errors: [],
          },
        }}
      />,
    );

    expect(html).toContain('Validation preflight');
    expect(html).toContain('Validation preflight passed for the revised draft.');
    expect(html).not.toContain('Validation preflight errors');
  });

  it('renders failed validation preflight errors as draft feedback', () => {
    const html = renderToStaticMarkup(
      <ProjectAgentRunPanel
        agentRun={{
          status: 'succeeded',
          intent: 'revise',
          runPlan: 'revise-current-case-study',
          notes: [],
          warnings: [],
          validationPreflight: {
            status: 'failed',
            message: 'Validation preflight found an issue to fix before Save.',
            errors: ['Project 1 URL must be a valid URL.'],
          },
        }}
      />,
    );

    expect(html).toContain('Validation preflight found an issue to fix before Save.');
    expect(html).toContain('Project 1 URL must be a valid URL.');
    expect(html).not.toContain('Codex did not update the draft.');
  });

  it('does not render validation preflight for old or skipped run results', () => {
    const oldResultHtml = renderToStaticMarkup(
      <ProjectAgentRunPanel
        agentRun={{
          status: 'succeeded',
          intent: 'review',
          runPlan: 'review-current-case-study',
          notes: [],
          warnings: [],
        }}
      />,
    );
    const skippedResultHtml = renderToStaticMarkup(
      <ProjectAgentRunPanel
        agentRun={{
          status: 'succeeded',
          intent: 'revise',
          runPlan: 'revise-current-case-study',
          notes: [],
          warnings: [],
          validationPreflight: {
            status: 'skipped',
            message: 'Validation preflight skipped because no revised draft patch was returned.',
            errors: [],
          },
        }}
      />,
    );

    expect(oldResultHtml).not.toContain('Validation preflight');
    expect(skippedResultHtml).not.toContain('Validation preflight');
  });

  it('groups long source manifest sections and hides duplicate GitHub skip warnings', () => {
    const sourceManifest = [
      ...Array.from({ length: 18 }, (_, index) => ({
        id: `source-${index + 1}`,
        kind: 'github-file',
        label: index === 0
          ? 'owner/repo / README.md'
          : `owner/repo / src/included-${index + 1}.jsx`,
        mediaType: 'text/plain',
        bytes: 128 + index,
        included: true,
        warnings: [],
      })),
      ...Array.from({ length: 6 }, (_, index) => ({
        id: `source-${index + 19}`,
        kind: 'github-file',
        label: `owner/repo / src/components/PanelRight/file-${index + 1}.jsx`,
        mediaType: 'text/plain',
        bytes: 256,
        included: false,
        warnings: [
          'GitHub source fetch failed because the unauthenticated GitHub API rate limit appears to be exhausted.',
        ],
      })),
    ];
    const html = renderToStaticMarkup(
      <ProjectAgentRunPanel
        agentRun={{
          status: 'succeeded',
          intent: 'revise',
          runPlan: 'revise-with-source-context',
          elapsedMs: 1200,
          patch: {},
          notes: [],
          warnings: [
            'No owner-provided role, timeline, motivation, screenshots, or deployment results were available.',
            'Skipped 6 GitHub source file(s) from "owner/repo" due to file fetch failures. Examples: owner/repo / src/components/PanelRight/file-1.jsx.',
          ],
          sourceManifest,
        }}
      />,
    );

    expect(html).toContain('owner/repo / README.md');
    expect(html).toContain('6 more included source files');
    expect(html).toContain('Examples: owner/repo / src/included-13.jsx');
    expect(html).not.toContain('owner/repo / src/included-18.jsx</span>');
    expect(html).toContain('6 skipped source files: file fetch failures');
    expect(html).toContain('Examples: owner/repo / src/components/PanelRight/file-1.jsx');
    expect(html).toContain('owner/repo / src/components/PanelRight/file-3.jsx');
    expect(html).not.toContain('owner/repo / src/components/PanelRight/file-4.jsx');
    expect(html).not.toContain('owner/repo / src/components/PanelRight/file-6.jsx');
    expect(html).toContain('No owner-provided role, timeline, motivation, screenshots, or deployment results were available.');
    expect(html).not.toContain('Skipped 6 GitHub source file(s) from &quot;owner/repo&quot; due to file fetch failures');
  });
});
