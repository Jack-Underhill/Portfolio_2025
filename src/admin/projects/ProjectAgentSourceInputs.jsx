import { useRef } from 'react';

import {
  getSourceFilePreviewStatus,
  getSourcePreviewSummary,
} from './projectAgentSourcePreviewState';
import {
  PROJECT_AGENT_SOURCE_ALLOWED_EXTENSIONS,
  PROJECT_AGENT_SOURCE_ALLOWED_FILENAMES,
} from '../../domain/projectAgentSourcePolicy';
import { adminForm, adminUi } from '../../styles/recipes';

const PROJECT_AGENT_SOURCE_FILE_EXTENSIONS = Object.freeze([
  ...PROJECT_AGENT_SOURCE_ALLOWED_EXTENSIONS,
  '.pdf',
  '.zip',
]);
const PROJECT_AGENT_SOURCE_FILE_NAME_EXAMPLES = PROJECT_AGENT_SOURCE_ALLOWED_FILENAMES;

const PROJECT_AGENT_SOURCE_FILE_ACCEPT = PROJECT_AGENT_SOURCE_FILE_EXTENSIONS.join(',');
const PROJECT_AGENT_SOURCE_FILE_TYPE_LABEL = [
  ...PROJECT_AGENT_SOURCE_FILE_EXTENSIONS,
  ...PROJECT_AGENT_SOURCE_FILE_NAME_EXAMPLES,
].join(', ');

function formatSourceFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return 'unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizeItems(items = []) {
  return items
    .map((item) => String(item).trim())
    .filter(Boolean);
}

function formatManifestEntryMetadata(entry) {
  const metadata = [];
  const kind = String(entry?.kind || '').trim();

  if (kind) metadata.push(kind);
  if (Number.isFinite(entry?.pages)) {
    metadata.push(`${entry.pages} page${entry.pages === 1 ? '' : 's'}`);
  }
  if (Number.isFinite(entry?.entryCount)) {
    metadata.push(`${entry.entryCount} entries`);
  }
  if (Number.isFinite(entry?.bytes)) {
    metadata.push(formatSourceFileSize(entry.bytes));
  }
  if (entry?.truncated) {
    metadata.push('truncated');
  }

  return metadata.join(' · ');
}

function getPreviewToneClasses(tone) {
  if (tone === 'success') {
    return 'border-admin-accent/40 bg-admin-accent/10 text-admin-accent-text';
  }

  if (tone === 'warning') {
    return 'border-amber-400/40 bg-amber-400/10 text-amber-100';
  }

  return 'border-admin-border-subtle bg-admin-row text-admin-text-muted';
}

function SourcePreviewStatusPill({ status }) {
  if (!status) return null;

  return (
    <span
      className={`shrink-0 rounded-sm border px-1.5 py-0.5 text-[0.68rem] leading-4 ${getPreviewToneClasses(status.tone)}`}
    >
      {status.label}
    </span>
  );
}

function SourcePreviewManifest({ sourcePreview }) {
  const entries = Array.isArray(sourcePreview?.manifest) ? sourcePreview.manifest : [];
  const warnings = normalizeItems(sourcePreview?.warnings);

  if (sourcePreview?.status !== 'succeeded' || (entries.length === 0 && warnings.length === 0)) {
    return null;
  }

  return (
    <div className="basis-full space-y-2 rounded-md border border-admin-border-subtle bg-admin-row/60 p-2">
      {entries.length > 0 && (
        <ul className="space-y-1.5" aria-label="Source preview manifest">
          {entries.map((entry, index) => {
            const id = String(entry?.id || `preview-source-${index + 1}`);
            const label = String(entry?.label || id).trim();
            const entryWarnings = normalizeItems(entry?.warnings);
            const statusLabel = entry?.included ? 'Included' : 'Skipped';
            const toneClasses = entry?.included
              ? 'border-admin-border-subtle bg-admin-control text-admin-text-muted'
              : 'border-amber-400/40 bg-amber-400/10 text-amber-100';
            const metadata = formatManifestEntryMetadata(entry);

            return (
              <li
                key={`${id}-${index}`}
                className={`rounded-md border px-2.5 py-2 text-xs leading-5 ${toneClasses}`}
              >
                <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-medium text-admin-text">{statusLabel}</span>
                  <span className="min-w-0 break-words">{label}</span>
                  {metadata && (
                    <span className="text-admin-text-subtle">{metadata}</span>
                  )}
                </div>
                {entryWarnings.length > 0 && (
                  <ul className="mt-1 space-y-1 text-admin-text-subtle">
                    {entryWarnings.map((warning, warningIndex) => (
                      <li key={`${id}-warning-${warningIndex}`}>{warning}</li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {warnings.length > 0 && (
        <ul className="space-y-1 text-xs leading-5 text-admin-text-subtle" aria-label="Source preview warnings">
          {warnings.map((warning, index) => (
            <li key={`source-preview-warning-${index}`}>{warning}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProjectAgentSourceInputs({
  id,
  githubRepoUrlId,
  sourceFiles,
  githubRepoUrl = '',
  disabled = false,
  sourcePreview,
  canPreviewSources = false,
  isPreviewingSources = false,
  onAddFiles,
  onGithubRepoUrlChange,
  onRemoveFile,
  onPreviewSources,
}) {
  const inputRef = useRef(null);
  const files = Array.isArray(sourceFiles) ? sourceFiles : [];
  const previewSummary = getSourcePreviewSummary(sourcePreview);

  const handleOpenFilePicker = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const nextFiles = Array.from(event.target.files ?? []);
    if (nextFiles.length > 0) {
      onAddFiles?.(nextFiles);
    }
    event.target.value = '';
  };

  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
      <label htmlFor={githubRepoUrlId} className="sr-only">GitHub repository URL</label>
      <input
        id={githubRepoUrlId}
        type="text"
        inputMode="url"
        value={githubRepoUrl}
        disabled={disabled}
        onChange={(event) => onGithubRepoUrlChange?.(event.target.value)}
        placeholder="GitHub repo URL"
        aria-label="GitHub repository URL"
        title="GitHub repository URL"
        className={`${adminForm.input} min-h-9 min-w-0 flex-[1_1_16rem] py-1.5 text-sm`}
      />

      <input
        ref={inputRef}
        id={id}
        type="file"
        multiple
        accept={PROJECT_AGENT_SOURCE_FILE_ACCEPT}
        disabled={disabled}
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />

      <button
        type="button"
        onClick={handleOpenFilePicker}
        disabled={disabled}
        aria-label={`Add source files. Allowed file types: ${PROJECT_AGENT_SOURCE_FILE_TYPE_LABEL}`}
        title={`Add source files (${PROJECT_AGENT_SOURCE_FILE_TYPE_LABEL})`}
        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-admin-border bg-admin-control text-admin-text-muted hover:border-admin-accent-hover hover:bg-admin-panel-hover hover:text-admin-text focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent-text disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-admin-border disabled:hover:bg-admin-control disabled:hover:text-admin-text-muted"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="size-4.5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.75"
        >
          <path d="M10 5v10" />
          <path d="M5 10h10" />
        </svg>
      </button>

      {files.length > 0 && (
        <ul className="flex min-w-0 flex-1 flex-wrap items-center gap-2" aria-label="Selected source files">
          {files.map((file, index) => {
            const filePreviewStatus = getSourceFilePreviewStatus(file, sourcePreview);

            return (
              <li
                key={`${file.name}-${file.size}-${file.lastModified ?? 0}-${index}`}
                className="flex min-h-9 max-w-full min-w-0 items-center gap-2 rounded-md border border-admin-border bg-admin-control px-2 py-1 text-xs text-admin-text-muted"
              >
                <span className="min-w-0 truncate text-admin-text" title={file.name}>
                  {file.name}
                </span>
                <span className="shrink-0 text-admin-text-subtle">
                  {formatSourceFileSize(file.size)}
                </span>
                <SourcePreviewStatusPill status={filePreviewStatus} />
                <button
                  type="button"
                  onClick={() => onRemoveFile?.(index)}
                  disabled={disabled}
                  aria-label={`Remove source file ${file.name}`}
                  title={`Remove ${file.name}`}
                  className={`${adminUi.iconButton} shrink-0 px-1.5 py-0.5`}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    className="size-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.75"
                  >
                    <path d="M6 6l8 8" />
                    <path d="M14 6l-8 8" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={onPreviewSources}
        disabled={!canPreviewSources}
        aria-label="Preview source manifest"
        className={adminUi.secondaryButton}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.75"
        >
          <path d="M2.5 10s2.75-5 7.5-5 7.5 5 7.5 5-2.75 5-7.5 5-7.5-5-7.5-5Z" />
          <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
        </svg>
        <span>{isPreviewingSources ? 'Previewing' : 'Preview'}</span>
      </button>

      {previewSummary && (
        <p
          className={`rounded-md border px-2.5 py-2 text-xs leading-5 ${getPreviewToneClasses(previewSummary.tone)}`}
          role={previewSummary.tone === 'warning' ? 'alert' : 'status'}
          aria-live="polite"
        >
          {previewSummary.message}
        </p>
      )}

      <SourcePreviewManifest sourcePreview={sourcePreview} />
    </div>
  );
}

export default ProjectAgentSourceInputs;
