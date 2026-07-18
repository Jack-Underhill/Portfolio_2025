import { validateTextSourceFileName } from '../validation/textValidation.js';
import { sortSourceEntriesByPathRank } from '../sourceEntryRanking.js';
import { getGitHubPathIgnoreReason } from './githubPathPolicy.js';

function getGitHubBlobPath(entry) {
  return typeof entry?.path === 'string' ? entry.path : '';
}

export function getSortedGitHubBlobEntries(tree) {
  return Array.isArray(tree)
    ? sortSourceEntriesByPathRank(
      tree.filter((entry) => entry?.type === 'blob'),
      {
        getPath: getGitHubBlobPath,
        getIgnoreReason: (entry) => getGitHubPathIgnoreReason(getGitHubBlobPath(entry)),
        isSupported: (entry) => validateTextSourceFileName(getGitHubBlobPath(entry)).ok,
      },
    )
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
