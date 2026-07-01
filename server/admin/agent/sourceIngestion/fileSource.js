import {
  normalizeUploadedTextSourceFile,
  PROJECT_AGENT_SOURCE_ALLOWED_EXTENSIONS,
} from './textSource.js';

export { PROJECT_AGENT_SOURCE_ALLOWED_EXTENSIONS };

export async function normalizeUploadedSourceFile(file, options) {
  return normalizeUploadedTextSourceFile(file, options);
}
