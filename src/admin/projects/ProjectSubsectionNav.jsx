import { adminShell, cx } from '../../styles/recipes';

function ProjectSubsectionNav({
  sections = [],
  activeSectionId,
  onSelectSection,
}) {
  return (
    <aside className="rounded-md border border-admin-border bg-admin-panel p-3">
      <p className={cx(adminShell.eyebrow, 'px-2 pb-3')}>Project subsection</p>

      <nav className="flex flex-col gap-1" aria-label="Project subsections">
        {sections.map((section) => {
          const isActive = section.id === activeSectionId;

          return (
            <button
              key={section.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelectSection(section.id)}
              className={cx(
                'rounded-md px-3 py-2 text-left text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent-text',
                isActive
                  ? 'bg-admin-panel-hover text-admin-text ring-1 ring-admin-border'
                  : 'text-admin-text-muted hover:bg-admin-panel-hover hover:text-admin-text',
              )}
            >
              {section.title}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default ProjectSubsectionNav;
