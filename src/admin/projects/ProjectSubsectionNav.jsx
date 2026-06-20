import { adminShell, cx } from '../../styles/recipes';
import { getProjectSubsectionPath } from '../routing/adminRoutes.js';

function ProjectSubsectionNav({
  sections = [],
  activeSectionId,
  onNavigate,
}) {
  return (
    <nav className="space-y-3" aria-label="Project subsections">
      <p className={cx(adminShell.eyebrow, 'px-2')}>Project subsection</p>

      <div className="flex flex-col gap-1">
        {sections.map((section) => {
          const isActive = section.id === activeSectionId;

          return (
            <a
              key={section.id}
              href={getProjectSubsectionPath(section.id)}
              aria-current={isActive ? 'location' : undefined}
              onClick={(event) => onNavigate(event, section)}
              className={cx(
                'rounded-md px-3 py-2 text-left text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent-text',
                isActive
                  ? 'bg-admin-panel-hover text-admin-text ring-1 ring-admin-border'
                  : 'text-admin-text-muted hover:bg-admin-panel-hover hover:text-admin-text',
              )}
            >
              {section.title}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

export default ProjectSubsectionNav;
