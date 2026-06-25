export const cx = (...classes) => classes.filter(Boolean).join(" ");

export const adminForm = {
  input:
    "w-full rounded-md border border-admin-border bg-admin-control px-3 py-2 text-sm outline-none focus:border-admin-accent-hover focus-visible:ring-2 focus-visible:ring-admin-accent-text",
  textarea:
    "block w-full resize-none overflow-hidden rounded-md border border-admin-border bg-admin-control px-3 py-2 text-sm outline-none focus:border-admin-accent-hover focus-visible:ring-2 focus-visible:ring-admin-accent-text",
  fileShell:
    "relative inline-flex min-h-9 w-full items-center rounded-md border border-admin-border bg-admin-control px-3 py-2 transition-colors cursor-pointer hover:border-admin-accent-hover hover:bg-admin-panel-hover focus-within:ring-2 focus-within:ring-admin-accent-text",
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
  editorPanel:
    "space-y-4 rounded-lg border border-admin-border-subtle bg-admin-panel p-4 shadow-subtle-highlight",
  editorRow: "rounded-md bg-admin-row",
  projectEditorSection: "scroll-mt-[14rem] lg:scroll-mt-[13rem]",
  divider: "space-y-3 pt-2 border-t border-admin-border-subtle",
  imageBorder: "border border-admin-border",
  dangerLink: "text-xs text-admin-danger hover:text-admin-danger-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-danger-hover",
};

export const adminMasthead = {
  surface:
    "relative isolate overflow-hidden border-y border-[var(--admin-section-masthead-border)] bg-[radial-gradient(circle_at_14%_0%,var(--admin-section-masthead-glow),transparent_38%),linear-gradient(135deg,var(--admin-shell-gradient-start),var(--admin-shell-gradient-mid)_58%,var(--admin-shell-gradient-end))] py-4 shadow-subtle-highlight sm:py-5",
  inner:
    "mx-auto flex w-[calc(100%_-_2.5rem)] max-w-6xl min-w-0 flex-col gap-4 sm:w-[calc(100%_-_4rem)] sm:flex-row sm:items-start lg:w-[calc(100%_-_5rem)] xl:w-[calc(100%_-_6rem)]",
  iconBadge:
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[var(--admin-section-badge-border)] bg-[var(--admin-section-badge-bg)] text-[var(--admin-section-badge-text)] shadow-subtle-highlight",
  copy: "min-w-0 space-y-1.5",
  title: "text-2xl font-semibold leading-tight tracking-normal text-admin-text sm:text-3xl",
  description: "max-w-3xl text-sm leading-6 text-admin-text-muted",
  accentRule:
    "mt-5 h-px w-full bg-[linear-gradient(90deg,transparent,var(--admin-section-masthead-rule)_14%,var(--admin-section-masthead-rule)_86%,transparent)]",
  accents: {
    sky: {
      vars: {
        "--admin-section-accent-rgb": "56 189 248",
      },
    },
    cyan: {
      vars: {
        "--admin-section-accent-rgb": "34 211 238",
      },
    },
    indigo: {
      vars: {
        "--admin-section-accent-rgb": "129 140 248",
      },
    },
    violet: {
      vars: {
        "--admin-section-accent-rgb": "167 139 250",
      },
    },
    teal: {
      vars: {
        "--admin-section-accent-rgb": "45 212 191",
      },
    },
    blue: {
      vars: {
        "--admin-section-accent-rgb": "96 165 250",
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
    "min-h-screen bg-admin-page text-admin-text md:[--admin-primary-sidebar-width:14.4rem] md:pl-[var(--admin-primary-sidebar-width)]",
  sidebar:
    "flex md:min-h-screen flex-col border-r border-admin-border bg-[linear-gradient(180deg,var(--admin-shell-gradient-mid),var(--admin-shell-gradient-start))] md:fixed md:inset-y-0 md:left-0 md:h-screen md:w-[var(--admin-primary-sidebar-width)]",
  sidebarHeader: "shrink-0 space-y-2 border-b border-admin-border px-5 py-6",
  eyebrow: "text-xs uppercase tracking-wide text-admin-text-subtle",
  nav: "flex-1 flex flex-col overflow-y-auto px-3 py-4 gap-1",
  navLink:
    "flex min-w-0 items-center gap-3 rounded-md px-1.5 py-2.5 text-md font-medium leading-snug text-admin-text-muted hover:bg-admin-panel-hover hover:text-admin-text focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent-text",
  navDisclosureSlot:
    "flex h-4 w-4 shrink-0 items-center justify-center text-admin-text-subtle",
  navChevron:
    "h-4 w-4 shrink-0 text-admin-text-muted transition-transform duration-200 ease-out motion-reduce:transition-none",
  navChevronExpanded: "rotate-90",
  navIcon:
    "flex h-6 w-6 shrink-0 items-center justify-center",
  navIconInactive: "text-admin-text-muted",
  navIconActive: "text-admin-accent-text",
  navLinkLabel: "min-w-0 flex-1 break-words",
  navCurrentLabel: "admin-current-location-label",
  navAncestorLabel: "text-admin-accent-text",
  navStatusSlot:
    "flex h-5 w-5 shrink-0 items-center justify-center",
  navStatusIndicator:
    "flex h-5 w-5 items-center justify-center",
  navStatusIcon: "h-4 w-4",
  navStatusDirtyDot: "h-2.5 w-2.5 rounded-full bg-current",
  navStatusIndicatorStates: {
    dirty: "text-amber-400",
    validating: "text-admin-accent-text",
    valid: "text-green-400",
    invalid: "text-admin-danger",
  },
  navLinkActive:
    "bg-admin-panel-hover text-admin-text ring-1 ring-admin-border",
  navGroup: "min-w-0",
  navChildDisclosure:
    "grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none",
  navChildDisclosureExpanded: "grid-rows-[1fr] opacity-100",
  navChildDisclosureCollapsed:
    "pointer-events-none grid-rows-[0fr] opacity-0",
  navChildDisclosureInner: "min-h-0 overflow-hidden",
  navChildList:
    "mt-1.5 ml-[2.8rem] space-y-0.5 border-l border-admin-border-subtle pl-3",
  navChildLink:
    "flex min-w-0 items-center gap-2 rounded-md px-2.5 py-1.5 text-sm font-medium leading-snug text-admin-text-muted hover:bg-admin-panel-hover hover:text-admin-text focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent-text",
  navChildLinkLabel: "min-w-0 flex-1 break-words",
  navChildLinkActive:
    "bg-admin-panel-hover text-admin-text shadow-[inset_2px_0_0_var(--color-admin-accent-text)]",
  savePanel:
    "shrink-0 space-y-3 border-t border-admin-border px-5 py-5",
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
