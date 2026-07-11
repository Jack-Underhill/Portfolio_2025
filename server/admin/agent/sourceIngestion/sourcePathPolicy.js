import { getSourceFileBaseName } from './sourcePathUtils.js';

export const SOURCE_GENERATED_SOURCE_PATTERN = /(?:^|[._-])generated\.[a-z0-9]+$/i;
export const SOURCE_GENERATED_BUNDLE_PATTERN = /(?:^|[._-])(?:bundle|min)\.(?:cjs|css|js|mjs)$/i;
export const SOURCE_GENERATED_WEB_BUNDLE_PATTERN = /(?:^|[._-])(?:bundle|min)\.(?:css|js)$/i;

export const SOURCE_NOISY_GENERATED_FILENAMES = new Set([
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  'composer.lock',
  'poetry.lock',
  'cargo.lock',
  'go.sum',
]);

export function isGeneratedOrMinifiedSourcePath(path) {
  const baseName = getSourceFileBaseName(path).toLowerCase();
  return SOURCE_GENERATED_SOURCE_PATTERN.test(baseName)
    || SOURCE_GENERATED_BUNDLE_PATTERN.test(baseName);
}

export function isGeneratedOrMinifiedWebSourcePath(path) {
  const baseName = getSourceFileBaseName(path).toLowerCase();
  return SOURCE_GENERATED_SOURCE_PATTERN.test(baseName)
    || SOURCE_GENERATED_WEB_BUNDLE_PATTERN.test(baseName);
}

export function isNoisyGeneratedSourcePath(path) {
  return SOURCE_NOISY_GENERATED_FILENAMES.has(getSourceFileBaseName(path).toLowerCase());
}
