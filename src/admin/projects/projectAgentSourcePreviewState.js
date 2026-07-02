export function createIdleProjectAgentSourcePreview() {
  return {
    status: 'idle',
    signature: '',
    manifest: [],
    warnings: [],
    error: '',
    sourceCount: 0,
    manifestCount: 0,
    warningCount: 0,
    limits: null,
  };
}

export function createLoadingProjectAgentSourcePreview(signature) {
  return {
    ...createIdleProjectAgentSourcePreview(),
    status: 'loading',
    signature,
  };
}

export function createSucceededProjectAgentSourcePreview(result, signature) {
  return {
    status: 'succeeded',
    signature,
    manifest: Array.isArray(result?.manifest) ? result.manifest : [],
    warnings: Array.isArray(result?.warnings) ? result.warnings : [],
    error: '',
    sourceCount: Number.isFinite(result?.sourceCount) ? result.sourceCount : 0,
    manifestCount: Number.isFinite(result?.manifestCount) ? result.manifestCount : 0,
    warningCount: Number.isFinite(result?.warningCount) ? result.warningCount : 0,
    limits: result?.limits && typeof result.limits === 'object' ? result.limits : null,
  };
}

export function createFailedProjectAgentSourcePreview(error, signature) {
  return {
    ...createIdleProjectAgentSourcePreview(),
    status: 'failed',
    signature,
    error: getPreviewErrorMessage(error),
  };
}

export function hasProjectAgentSourceInput({ sourceText, sourceFiles } = {}) {
  return String(sourceText || '').trim().length > 0
    || (Array.isArray(sourceFiles) && sourceFiles.length > 0);
}

export function createProjectAgentSourceInputSignature({
  sourceText,
  sourceFiles,
} = {}) {
  const files = Array.isArray(sourceFiles) ? sourceFiles : [];

  return JSON.stringify({
    text: createTextSignature(sourceText),
    files: files.map(createSourceFileSignature),
  });
}

export function getSourcePreviewSummary(sourcePreview) {
  if (!sourcePreview || sourcePreview.status === 'idle') return null;

  if (sourcePreview.status === 'loading') {
    return { tone: 'loading', message: 'Previewing sources...' };
  }

  if (sourcePreview.status === 'failed') {
    return {
      tone: 'warning',
      message: sourcePreview.error || 'Source preview failed.',
    };
  }

  const sourceCount = Number.isFinite(sourcePreview.sourceCount) ? sourcePreview.sourceCount : 0;
  const manifestCount = Number.isFinite(sourcePreview.manifestCount)
    ? sourcePreview.manifestCount
    : sourcePreview.manifest?.length ?? 0;
  const warningCount = Number.isFinite(sourcePreview.warningCount)
    ? sourcePreview.warningCount
    : sourcePreview.warnings?.length ?? 0;
  const warningSuffix = warningCount > 0
    ? `, ${warningCount} warning${warningCount === 1 ? '' : 's'}`
    : '';

  return {
    tone: warningCount > 0 ? 'warning' : 'success',
    message: `${sourceCount} included, ${manifestCount} reviewed${warningSuffix}.`,
  };
}

export function getSourceFilePreviewStatus(file, sourcePreview) {
  if (!file || sourcePreview?.status !== 'succeeded') return null;

  const fileName = String(file.name || '').trim();
  if (!fileName) return null;

  const entries = (Array.isArray(sourcePreview.manifest) ? sourcePreview.manifest : [])
    .filter((entry) => isManifestEntryForFile(entry, fileName));

  if (!entries.length) return null;

  const includedCount = entries.filter((entry) => entry?.included).length;
  const skippedCount = entries.length - includedCount;
  const warningCount = entries.reduce(
    (count, entry) => count + normalizeItems(entry?.warnings).length,
    0,
  );

  if (includedCount > 0 && skippedCount > 0) {
    return { tone: 'warning', label: 'mixed' };
  }

  if (warningCount > 0) {
    return { tone: 'warning', label: 'warning' };
  }

  if (includedCount > 0) {
    return { tone: 'success', label: 'included' };
  }

  return { tone: 'warning', label: 'skipped' };
}

function createTextSignature(value) {
  const text = String(value || '');
  return `${text.length}:${hashString(text)}`;
}

function createSourceFileSignature(file, index) {
  return {
    index,
    name: String(file?.name || ''),
    size: Number.isFinite(file?.size) ? file.size : null,
    type: String(file?.type || ''),
    lastModified: Number.isFinite(file?.lastModified) ? file.lastModified : null,
  };
}

function hashString(value) {
  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) + hash) ^ value.charCodeAt(index);
  }

  return (hash >>> 0).toString(36);
}

function isManifestEntryForFile(entry, fileName) {
  const label = String(entry?.label || '').trim();
  const archiveLabel = String(entry?.archiveLabel || '').trim();

  return label === fileName
    || label.startsWith(`${fileName} /`)
    || archiveLabel === fileName;
}

function getPreviewErrorMessage(error) {
  const message = String(error?.message || '').trim();
  return message || 'Source preview failed.';
}

function normalizeItems(items = []) {
  return items
    .map((item) => String(item).trim())
    .filter(Boolean);
}
