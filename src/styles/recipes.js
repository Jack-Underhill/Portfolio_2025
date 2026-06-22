export const cx = (...classes) => classes.filter(Boolean).join(" ");

export const adminForm = {
  input:
    "w-full rounded-md border border-admin-border bg-admin-panel px-3 py-2 text-sm outline-none focus:border-admin-accent-hover focus-visible:ring-2 focus-visible:ring-admin-accent-text",
  textarea:
    "block w-full resize-none overflow-hidden rounded-md border border-admin-border bg-admin-panel px-3 py-2 text-sm outline-none focus:border-admin-accent-hover focus-visible:ring-2 focus-visible:ring-admin-accent-text",
  fileShell:
    "relative inline-flex min-h-9 w-full items-center rounded-md border border-admin-border bg-admin-panel px-3 py-2 transition-colors cursor-pointer hover:border-admin-accent-hover hover:bg-admin-panel-hover focus-within:ring-2 focus-within:ring-admin-accent-text",
  fileInput:
    "absolute inset-0 size-full cursor-pointer opacity-0",
  fileAction:
    "pointer-events-none rounded-md bg-admin-panel-hover px-2 py-1 text-xs text-admin-text",
};

export const adminUi = {
  page: "space-y-10",
  pageSection: "scroll-mt-8 space-y-7",
  sectionContent:
    "mx-auto w-[calc(100%_-_2.5rem)] max-w-6xl sm:w-[calc(100%_-_4rem)] lg:w-[calc(100%_-_5rem)] xl:w-[calc(100%_-_6rem)]",
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
  projectEditorSection: "scroll-mt-[14rem] lg:scroll-mt-[13rem]",
  divider: "space-y-3 pt-2 border-t border-admin-border-subtle",
  imageBorder: "border border-admin-border",
  dangerLink: "text-xs text-admin-danger hover:text-admin-danger-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-danger-hover",
};

export const adminMasthead = {
  surface:
    "relative isolate overflow-hidden border-y border-admin-border-subtle bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(15,23,42,0.68)_58%,rgba(30,41,59,0.5))] py-4 shadow-subtle-highlight sm:py-5",
  inner:
    "mx-auto flex w-[calc(100%_-_2.5rem)] max-w-6xl min-w-0 flex-col gap-4 sm:w-[calc(100%_-_4rem)] sm:flex-row sm:items-start lg:w-[calc(100%_-_5rem)] xl:w-[calc(100%_-_6rem)]",
  iconBadge:
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-md border shadow-subtle-highlight",
  copy: "min-w-0 space-y-1.5",
  title: "text-2xl font-semibold leading-tight tracking-normal text-admin-text sm:text-3xl",
  description: "max-w-3xl text-sm leading-6 text-admin-text-muted",
  accentRule: "mt-5 h-0.5 w-full",
  accents: {
    sky: {
      badge: "border-sky-400/30 bg-sky-400/10 text-sky-200",
      rule: "bg-sky-400/35",
      vars: {
        "--admin-section-toolbar-rule": "rgb(56 189 248 / 0.45)",
        "--admin-section-toolbar-shadow": "rgb(56 189 248 / 0.34)",
      },
    },
    cyan: {
      badge: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
      rule: "bg-cyan-400/35",
      vars: {
        "--admin-section-toolbar-rule": "rgb(103 232 249 / 0.45)",
        "--admin-section-toolbar-shadow": "rgb(34 211 238 / 0.34)",
      },
    },
    indigo: {
      badge: "border-indigo-300/30 bg-indigo-400/10 text-indigo-200",
      rule: "bg-indigo-300/35",
      vars: {
        "--admin-section-toolbar-rule": "rgb(165 180 252 / 0.45)",
        "--admin-section-toolbar-shadow": "rgb(129 140 248 / 0.34)",
      },
    },
    violet: {
      badge: "border-violet-300/30 bg-violet-400/10 text-violet-200",
      rule: "bg-violet-300/35",
      vars: {
        "--admin-section-toolbar-rule": "rgb(196 181 253 / 0.45)",
        "--admin-section-toolbar-shadow": "rgb(167 139 250 / 0.34)",
      },
    },
    teal: {
      badge: "border-teal-300/30 bg-teal-400/10 text-teal-200",
      rule: "bg-teal-300/35",
      vars: {
        "--admin-section-toolbar-rule": "rgb(94 234 212 / 0.45)",
        "--admin-section-toolbar-shadow": "rgb(45 212 191 / 0.34)",
      },
    },
    blue: {
      badge: "border-blue-300/30 bg-blue-400/10 text-blue-200",
      rule: "bg-blue-300/35",
      vars: {
        "--admin-section-toolbar-rule": "rgb(147 197 253 / 0.45)",
        "--admin-section-toolbar-shadow": "rgb(96 165 250 / 0.34)",
      },
    },
  },
};

export const adminSectionToolbar = {
  shell:
    "sticky top-0 z-20 isolate rounded-md bg-admin-panel/95 shadow-[0_1px_0_var(--admin-section-toolbar-shadow),0_18px_30px_-22px_rgba(0,0,0,0.95)] ring-1 ring-admin-border-subtle backdrop-blur-md after:pointer-events-none after:absolute after:inset-x-1 after:bottom-0 after:h-px after:rounded-b-md after:bg-[var(--admin-section-toolbar-rule)] after:content-['']",
  body: "space-y-3",
  primary: "min-w-0",
  actions:
    "flex flex-wrap items-center gap-2 border-t border-admin-border-subtle pt-3",
  actionsOnly: "border-t-0 pt-0",
};

export const adminShell = {
  root:
    "min-h-screen bg-admin-page text-admin-text md:[--admin-primary-sidebar-width:11.75rem] md:[--admin-secondary-sidebar-width:8.5rem] md:pl-[var(--admin-primary-sidebar-width)]",
  rootWithSecondary:
    "md:pl-[calc(var(--admin-primary-sidebar-width)+var(--admin-secondary-sidebar-width))]",
  sidebar:
    "flex md:min-h-screen flex-col border-r border-admin-border bg-admin-panel md:fixed md:inset-y-0 md:left-0 md:h-screen md:w-[var(--admin-primary-sidebar-width)]",
  secondarySidebar:
    "border-b border-admin-border bg-admin-panel px-5 py-4 md:fixed md:inset-y-0 md:left-[var(--admin-primary-sidebar-width)] md:z-10 md:h-screen md:w-[var(--admin-secondary-sidebar-width)] md:overflow-y-auto md:border-b-0 md:border-r md:px-3 md:py-6",
  sidebarHeader: "shrink-0 space-y-2 border-b border-admin-border px-5 py-6",
  eyebrow: "text-xs uppercase tracking-wide text-admin-text-subtle",
  nav: "flex-1 flex flex-col overflow-y-auto px-3 py-4 gap-1",
  navLink:
    "flex min-w-0 items-center gap-3 rounded-md px-3 py-2.5 text-md font-medium text-admin-text-muted hover:bg-admin-panel-hover hover:text-admin-text focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent-text",
  navLinkActive:
    "bg-admin-panel-hover text-admin-text ring-1 ring-admin-border",
  savePanel:
    "shrink-0 space-y-3 border-t border-admin-border bg-admin-panel px-5 py-5",
  main: "min-h-screen py-8",
  content: "w-full space-y-10",
  statusBanner:
    "mx-auto flex w-[calc(100%_-_2.5rem)] max-w-6xl items-start justify-between gap-4 rounded-md border px-5 py-4 shadow-sm sm:w-[calc(100%_-_4rem)] lg:w-[calc(100%_-_5rem)] xl:w-[calc(100%_-_6rem)]",
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
