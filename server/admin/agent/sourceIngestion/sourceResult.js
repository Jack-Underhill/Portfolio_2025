export function normalizeSourceWarnings(warnings) {
  if (Array.isArray(warnings)) {
    return warnings.filter((warning) => typeof warning === 'string' && warning);
  }

  return typeof warnings === 'string' && warnings ? [warnings] : [];
}

export function stripSourceTextFromManifest(manifest = {}) {
  const metadataOnlyManifest = { ...manifest };
  delete metadataOnlyManifest.text;
  return metadataOnlyManifest;
}

export function createSourceManifest({
  id,
  kind,
  label,
  mediaType,
  bytes = 0,
  included,
  warnings = [],
  metadata = {},
}) {
  return stripSourceTextFromManifest({
    ...metadata,
    id,
    kind,
    label,
    ...(mediaType == null ? {} : { mediaType }),
    bytes: Number.isFinite(bytes) ? bytes : 0,
    included: Boolean(included),
    warnings: normalizeSourceWarnings(warnings),
  });
}

export function createIncludedSourceResult({
  id,
  kind,
  label,
  mediaType,
  bytes = 0,
  text,
  warnings = [],
  manifestWarnings = warnings,
  itemMetadata = {},
  manifestMetadata = {},
}) {
  const normalizedWarnings = normalizeSourceWarnings(warnings);
  const normalizedBytes = Number.isFinite(bytes) ? bytes : 0;

  return {
    item: {
      id,
      kind,
      label,
      ...(mediaType == null ? {} : { mediaType }),
      bytes: normalizedBytes,
      ...itemMetadata,
      text,
    },
    manifest: createSourceManifest({
      id,
      kind,
      label,
      mediaType,
      bytes: normalizedBytes,
      included: true,
      warnings: manifestWarnings,
      metadata: manifestMetadata,
    }),
    warnings: normalizedWarnings,
  };
}

export function createSkippedSourceResult({
  id,
  kind,
  label,
  mediaType,
  bytes = 0,
  warning,
  warnings = warning,
  manifestWarnings = warnings,
  manifestMetadata = {},
}) {
  const normalizedWarnings = normalizeSourceWarnings(warnings);

  return {
    item: null,
    manifest: createSourceManifest({
      id,
      kind,
      label,
      mediaType,
      bytes,
      included: false,
      warnings: manifestWarnings,
      metadata: manifestMetadata,
    }),
    warnings: normalizedWarnings,
  };
}

export function createSourceResultEntry(result) {
  return {
    item: result?.item ?? null,
    manifest: stripSourceTextFromManifest(result?.manifest ?? {}),
  };
}

export function createSkippedSourceEntriesResult(options) {
  const result = createSkippedSourceResult(options);

  return {
    entries: [createSourceResultEntry(result)],
    warnings: result.warnings,
  };
}
