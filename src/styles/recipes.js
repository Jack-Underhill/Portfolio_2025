export const cx = (...classes) => classes.filter(Boolean).join(" ");

export const adminForm = {
  input:
    "w-full rounded-md border border-admin-border bg-admin-panel px-3 py-2 text-sm outline-none focus:border-admin-accent-hover focus-visible:ring-2 focus-visible:ring-admin-accent-text",
  textarea:
    "block w-full resize-none overflow-hidden rounded-md border border-admin-border bg-admin-panel px-3 py-2 text-sm outline-none focus:border-admin-accent-hover focus-visible:ring-2 focus-visible:ring-admin-accent-text",
  fileShell:
    "rounded-md border border-admin-border bg-admin-panel px-3 py-2 transition-colors cursor-pointer hover:border-admin-accent-hover hover:bg-admin-panel-hover focus-within:ring-2 focus-within:ring-admin-accent-text",
  fileInput:
    "block w-full text-xs text-admin-text-muted file:mr-2 file:rounded-md file:border-0 file:bg-admin-panel-hover file:px-2 file:py-1 file:text-xs file:text-admin-text cursor-pointer",
};

export const adminUi = {
  page: "space-y-10",
  primaryButton:
    "rounded-md bg-admin-accent px-4 py-2 text-sm font-medium hover:bg-admin-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent-text disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-admin-accent",
  secondaryButton:
    "rounded-md bg-admin-panel-hover px-4 py-2 text-sm hover:bg-admin-border focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent-text disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-admin-panel-hover",
  smallSecondaryButton:
    "rounded-md bg-admin-panel-hover px-2 py-1 text-xs hover:bg-admin-border focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent-text disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-admin-panel-hover",
  iconButton:
    "text-xs px-2 py-1 rounded-md border border-admin-border hover:bg-admin-panel-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent-text disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent",
  addLink: "text-xs text-admin-accent-text hover:text-admin-accent-text-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent-text",
  inlineLink: "underline underline-offset-2 text-admin-link focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent-text",
  sectionLabel: "text-xs uppercase tracking-wide text-admin-text-subtle",
  helperText: "text-xs text-admin-text-subtle",
  emptyText: "text-xs text-admin-text-faint",
  panel: "rounded-md border border-admin-border bg-admin-panel",
  panelDragOver: "ring-1 ring-admin-accent-hover bg-admin-panel/70",
  editorPanel: "border border-admin-border rounded-lg p-4 space-y-4",
  divider: "space-y-3 pt-2 border-t border-admin-border-subtle",
  imageBorder: "border border-admin-border",
  dangerLink: "text-xs text-admin-danger hover:text-admin-danger-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-danger-hover",
};

export const adminShell = {
  root: "min-h-screen bg-admin-page text-admin-text md:pl-47",
  sidebar:
    "flex md:min-h-screen flex-col border-r border-admin-border bg-admin-panel md:fixed md:inset-y-0 md:left-0 md:h-screen md:w-47",
  sidebarHeader: "shrink-0 space-y-2 border-b border-admin-border px-5 py-6",
  eyebrow: "text-xs uppercase tracking-wide text-admin-text-subtle",
  nav: "flex-1 flex flex-col overflow-y-auto px-3 py-4 gap-1",
  navLink:
    "flex items-center gap-3 rounded-md px-3 py-2.5 text-md font-medium text-admin-text-muted hover:bg-admin-panel-hover hover:text-admin-text focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent-text",
  navLinkActive:
    "bg-admin-panel-hover text-admin-text ring-1 ring-admin-border",
  savePanel:
    "shrink-0 space-y-3 border-t border-admin-border bg-admin-panel px-5 py-5",
  main: "min-h-screen px-5 py-8 sm:px-8 lg:px-10 xl:px-12",
  content: "mx-auto max-w-6xl space-y-10",
  statusBanner:
    "flex items-start justify-between gap-4 rounded-md border px-5 py-4 shadow-sm",
  statusBannerInfo:
    "border-admin-border bg-admin-panel text-admin-text",
  statusBannerError:
    "border-admin-danger/50 bg-admin-danger/10 text-admin-text",
  statusBannerText: "space-y-1",
  statusBannerTitle: "text-sm font-semibold",
  statusBannerDescription: "text-sm text-admin-text-muted",
  statusBannerClose:
    "shrink-0 rounded-md border border-admin-border px-3 py-1.5 text-xs font-medium text-admin-text-muted hover:bg-admin-panel-hover hover:text-admin-text focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent-text",
};
