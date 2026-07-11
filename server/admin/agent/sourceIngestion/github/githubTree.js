export function getSortedGitHubBlobEntries(tree) {
  return Array.isArray(tree)
    ? tree
      .filter((entry) => entry?.type === 'blob')
      .slice()
      .sort((left, right) => String(left.path || '').localeCompare(String(right.path || '')))
    : [];
}

export function getGitHubTreeWarnings({ repoLabel, treeResult, blobEntries, maxTreeEntries }) {
  const warnings = [];

  if (treeResult?.data?.truncated) {
    warnings.push(`GitHub repository "${repoLabel}" tree was truncated by GitHub before all files could be inspected.`);
  }

  if (blobEntries.length > maxTreeEntries) {
    warnings.push(`GitHub repository "${repoLabel}" has ${blobEntries.length} file entries; only the first ${maxTreeEntries} entries were inspected.`);
  }

  return warnings;
}
