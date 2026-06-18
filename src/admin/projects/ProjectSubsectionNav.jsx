import { adminShell, cx } from '../../styles/recipes';

function ProjectSubsectionNav({
  sections = [],
  activeSectionId,
  onSelectSection,
}) {
  return (
    <nav className="space-y-3" aria-label="Project subsections">
      <p className={cx(adminShell.eyebrow, 'px-2')}>Project subsection</p>

      <div className="flex flex-col gap-1">
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
      </div>
    </nav>
  );
}

export default ProjectSubsectionNav;
