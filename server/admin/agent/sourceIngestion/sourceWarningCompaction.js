const DEFAULT_EXAMPLE_LIMIT = 3;

export function createSourceWarningCompaction() {
  return new Map();
}

export function addCompactSourceWarning(compaction, {
  reason,
  label = '',
  exampleLimit = DEFAULT_EXAMPLE_LIMIT,
} = {}) {
  if (!reason) return;

  const existing = compaction.get(reason) || {
    reason,
    count: 0,
    examples: [],
  };

  existing.count += 1;
  if (label && existing.examples.length < exampleLimit) existing.examples.push(label);
  compaction.set(reason, existing);
}

export function getCompactSourceWarningSummaries(compaction) {
  return Array.from(compaction.values()).map((summary) => ({
    reason: summary.reason,
    count: summary.count,
    examples: [...summary.examples],
  }));
}
