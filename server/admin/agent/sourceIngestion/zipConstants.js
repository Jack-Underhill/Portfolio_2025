export {
  PROJECT_AGENT_SOURCE_ZIP_ENTRY_MAX_BYTES,
  PROJECT_AGENT_SOURCE_ZIP_MAX_BYTES,
  PROJECT_AGENT_SOURCE_ZIP_MAX_ENTRIES,
  PROJECT_AGENT_SOURCE_ZIP_MAX_INCLUDED_FILES,
  PROJECT_AGENT_SOURCE_ZIP_TOTAL_EXTRACTED_BYTES,
} from './sourceLimits.js';
export { PROJECT_AGENT_SOURCE_ZIP_MEDIA_TYPE } from './sourceMediaTypes.js';

export const PROJECT_AGENT_SOURCE_ZIP_EXTENSION = '.zip';

export const IGNORED_ZIP_PATH_SEGMENTS = new Set([
  '.git',
  '.vs',
  'node_modules',
  'bin',
  'obj',
  'dist',
  'build',
  'generated',
  'coverage',
  'testresults',
  '.next',
  '.cache',
  '.venv',
  'venv',
  '__pycache__',
]);
