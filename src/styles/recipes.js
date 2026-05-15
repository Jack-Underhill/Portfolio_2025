export const cx = (...classes) => classes.filter(Boolean).join(" ");

export const adminForm = {
  input:
    "w-full rounded-md border border-admin-border bg-admin-panel px-3 py-2 text-sm outline-none focus:border-admin-accent-hover",
  textarea:
    "block w-full resize-none overflow-hidden rounded-md border border-admin-border bg-admin-panel px-3 py-2 text-sm outline-none focus:border-admin-accent-hover",
  fileShell:
    "rounded-md border border-admin-border bg-admin-panel px-3 py-2 transition-colors cursor-pointer hover:border-admin-accent-hover hover:bg-admin-panel-hover",
  fileInput:
    "block w-full text-xs text-admin-text-muted file:mr-2 file:rounded-md file:border-0 file:bg-admin-panel-hover file:px-2 file:py-1 file:text-xs file:text-admin-text cursor-pointer",
};

export const adminUi = {
  page: "min-h-screen px-5 sm:px-10 md:px-15 lg:px-25 xl:px-35 py-10 bg-admin-page text-admin-text space-y-10",
  primaryButton:
    "rounded-md bg-admin-accent px-4 py-2 text-sm font-medium hover:bg-admin-accent-hover",
  secondaryButton:
    "rounded-md bg-admin-panel-hover px-4 py-2 text-sm hover:bg-admin-border",
  smallSecondaryButton:
    "rounded-md bg-admin-panel-hover px-2 py-1 text-xs hover:bg-admin-border",
  iconButton:
    "text-xs px-2 py-1 rounded-md border border-admin-border hover:bg-admin-panel-hover",
  addLink: "text-xs text-admin-accent-text hover:text-admin-accent-text-hover",
  inlineLink: "underline underline-offset-2 text-admin-link",
  sectionLabel: "text-xs uppercase tracking-wide text-admin-text-subtle",
  helperText: "text-xs text-admin-text-subtle",
  emptyText: "text-xs text-admin-text-faint",
  panel: "rounded-md border border-admin-border bg-admin-panel",
  panelDragOver: "ring-1 ring-admin-accent-hover bg-admin-panel/70",
  editorPanel: "border border-admin-border rounded-lg p-4 space-y-4",
  divider: "space-y-3 pt-2 border-t border-admin-border-subtle",
  imageBorder: "border border-admin-border",
  dangerLink: "text-xs text-admin-danger hover:text-admin-danger-hover",
};
