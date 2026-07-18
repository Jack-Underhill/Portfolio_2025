import { describe, expect, it } from 'vitest';

import {
  addCompactSourceWarning,
  createSourceWarningCompaction,
  getCompactSourceWarningSummaries,
} from '../../../../../server/admin/agent/sourceIngestion/sourceWarningCompaction.js';

describe('source warning compaction', () => {
  it('counts repeated skip reasons and keeps up to three examples in insertion order', () => {
    const compaction = createSourceWarningCompaction();

    addCompactSourceWarning(compaction, { reason: 'unsupported file types', label: 'repo / a.png' });
    addCompactSourceWarning(compaction, { reason: 'ignored paths', label: 'repo / dist/app.js' });
    addCompactSourceWarning(compaction, { reason: 'unsupported file types', label: 'repo / b.gif' });
    addCompactSourceWarning(compaction, { reason: 'unsupported file types', label: 'repo / c.jpg' });
    addCompactSourceWarning(compaction, { reason: 'unsupported file types', label: 'repo / d.ico' });
    addCompactSourceWarning(compaction, { reason: '', label: 'repo / skipped.md' });

    expect(getCompactSourceWarningSummaries(compaction)).toEqual([
      {
        reason: 'unsupported file types',
        count: 4,
        examples: ['repo / a.png', 'repo / b.gif', 'repo / c.jpg'],
      },
      {
        reason: 'ignored paths',
        count: 1,
        examples: ['repo / dist/app.js'],
      },
    ]);
  });
});
