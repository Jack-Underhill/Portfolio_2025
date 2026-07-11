import { getSourceFileBaseName, isSafeRelativeSourcePath } from '../sourcePathUtils.js';
import {
  isGeneratedOrMinifiedWebSourcePath,
  isNoisyGeneratedSourcePath,
} from '../sourcePathPolicy.js';

export const GITHUB_IGNORED_PATH_SEGMENTS = new Set([
  '.git',
  '.github',
  '.next',
  '.nuxt',
  '.cache',
  '.parcel-cache',
  '.turbo',
  '.venv',
  'venv',
  'env',
  'node_modules',
  'bower_components',
  'vendor',
  'dist',
  'build',
  'coverage',
  'out',
  'target',
  'bin',
  'obj',
  '__pycache__',
]);

export function getGitHubPathIgnoreReason(path) {
  if (!isSafeRelativeSourcePath(path, { allowWindowsDrivePrefix: true })) return 'unsafe path';

  const parts = path.split('/');
  const ignoredSegment = parts.find((part) => GITHUB_IGNORED_PATH_SEGMENTS.has(part.toLowerCase()));

  if (ignoredSegment) return `ignored path segment "${ignoredSegment}"`;

  const baseName = getSourceFileBaseName(path).toLowerCase();

  if (isNoisyGeneratedSourcePath(baseName)) return `noisy generated file "${baseName}"`;
  if (isGeneratedOrMinifiedWebSourcePath(baseName)) {
    return `generated or minified file "${baseName}"`;
  }

  return '';
}
