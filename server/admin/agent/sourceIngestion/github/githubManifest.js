import {
  PROJECT_AGENT_SOURCE_GITHUB_FILE_KIND,
  PROJECT_AGENT_SOURCE_GITHUB_REPO_KIND,
} from '../sourceKinds.js';
import { PROJECT_AGENT_SOURCE_DEFAULT_MEDIA_TYPE } from '../sourceMediaTypes.js';
import {
  encodeSourcePathForUrl,
  joinSourceDisplayPath,
} from '../sourcePathUtils.js';
import {
  createSkippedSourceResult,
  createSourceResultEntry,
} from '../sourceResult.js';
import { GITHUB_HOST } from './githubUrl.js';

export function getGitHubRepoLabel({ owner, repo }) {
  return `${owner}/${repo}`;
}

export function getGitHubFileLabel({ repoLabel, path }) {
  return joinSourceDisplayPath(repoLabel, path);
}

export function getGitHubSourceUrl({ owner, repo, ref, path }) {
  return `https://${GITHUB_HOST}/${owner}/${repo}/blob/${encodeURIComponent(ref)}/${encodeSourcePathForUrl(path)}`;
}

export function getSkippedGitHubRepoEntry({ id, label, warning, metadata = {} }) {
  return createSourceResultEntry(createSkippedSourceResult({
    id,
    kind: PROJECT_AGENT_SOURCE_GITHUB_REPO_KIND,
    label,
    mediaType: PROJECT_AGENT_SOURCE_DEFAULT_MEDIA_TYPE,
    bytes: 0,
    warning,
    manifestMetadata: metadata,
  }));
}

export function getSkippedGitHubFileEntry({
  id,
  repoInfo,
  path,
  bytes = 0,
  warning,
  ignoredPathReason,
}) {
  const repoLabel = getGitHubRepoLabel(repoInfo);
  const metadata = {
    repo: repoLabel,
    owner: repoInfo.owner,
    ref: repoInfo.ref,
    path,
    sourceUrl: getGitHubSourceUrl({ ...repoInfo, path }),
  };

  if (ignoredPathReason) {
    metadata.ignoredPathReason = ignoredPathReason;
  }

  return createSourceResultEntry(createSkippedSourceResult({
    id,
    kind: PROJECT_AGENT_SOURCE_GITHUB_FILE_KIND,
    label: getGitHubFileLabel({ repoLabel, path }),
    mediaType: PROJECT_AGENT_SOURCE_DEFAULT_MEDIA_TYPE,
    bytes,
    warning,
    manifestMetadata: metadata,
  }));
}

export function withGitHubRepoMetadata(result, repoInfo, path) {
  const repoLabel = getGitHubRepoLabel(repoInfo);
  const metadata = {
    repo: repoLabel,
    owner: repoInfo.owner,
    ref: repoInfo.ref,
    path,
    sourceUrl: getGitHubSourceUrl({ ...repoInfo, path }),
  };

  return {
    item: result.item ? { ...result.item, ...metadata } : null,
    manifest: {
      ...result.manifest,
      ...metadata,
    },
  };
}
