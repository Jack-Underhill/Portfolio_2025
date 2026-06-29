import { useRef } from 'react';

import { adminUi } from '../../styles/recipes';

export const PROJECT_AGENT_SOURCE_FILE_ACCEPT = '.txt,.md,.markdown,.json,.csv,.log';

function formatSourceFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return 'unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ProjectAgentSourceInputs({
  id,
  sourceFiles,
  disabled = false,
  onAddFiles,
  onRemoveFile,
}) {
  const inputRef = useRef(null);
  const files = Array.isArray(sourceFiles) ? sourceFiles : [];
  const allowedFileTypesLabel = PROJECT_AGENT_SOURCE_FILE_ACCEPT.split(',').join(', ');

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
    <>
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
        aria-label={`Add source files. Allowed file types: ${allowedFileTypesLabel}`}
        title={`Add source files (${allowedFileTypesLabel})`}
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
          {files.map((file, index) => (
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
          ))}
        </ul>
      )}
    </>
  );
}

export default ProjectAgentSourceInputs;
