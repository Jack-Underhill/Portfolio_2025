import { ADMIN_ROUTES } from '../routing/adminRoutes.js';
import { adminShell, adminUi, cx } from '../../styles/recipes';
import AdminNavChevron from './AdminNavChevron.jsx';
import AdminNavIcon from './AdminNavIcon.jsx';

function AdminSidebar({
    activeRoute,
    onNavigate,
    onSave,
    saveLabel,
    saveStatus,
    isSaveDisabled,
    isSaving,
}) {
    return (
        <aside className={adminShell.sidebar}>
            <div className={adminShell.sidebarHeader}>
                <p className={adminShell.eyebrow}>Development CMS</p>
                <h1 className="text-xl font-semibold">Portfolio Admin</h1>
            </div>

            <nav className={adminShell.nav} aria-label="Admin pages">
                {ADMIN_ROUTES.map((route) => {
                    const isActive = activeRoute?.id === route.id;
                    const childRoutes = route.children || [];
                    const isExpandable = childRoutes.length > 0;
                    const childListId = isExpandable ? `admin-nav-${route.id}-children` : undefined;

                    return (
                        <div key={route.id} className={isExpandable ? adminShell.navGroup : undefined}>
                            <a
                                href={route.path}
                                onClick={(event) => onNavigate(event, route)}
                                aria-current={isActive ? 'location' : undefined}
                                aria-expanded={isExpandable ? isActive : undefined}
                                aria-controls={isExpandable ? childListId : undefined}
                                className={cx(adminShell.navLink, isActive && adminShell.navLinkActive)}
                            >
                                <AdminNavIcon icon={route.icon} />
                                <span className={adminShell.navLinkLabel}>{route.label}</span>
                                {isExpandable && <AdminNavChevron isExpanded={isActive} />}
                            </a>

                            {isExpandable && isActive && (
                                <div id={childListId} className={adminShell.navChildList}>
                                    {childRoutes.map((childRoute) => (
                                        <a
                                            key={childRoute.id}
                                            href={childRoute.path}
                                            className={adminShell.navChildLink}
                                        >
                                            {childRoute.title}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            <div className={adminShell.savePanel}>
                <button
                    type="button"
                    onClick={onSave}
                    disabled={isSaveDisabled}
                    aria-busy={isSaving || undefined}
                    className={cx(adminUi.primaryButton, 'w-full')}
                >
                    {saveLabel}
                </button>
                <p className="text-xs text-admin-text-subtle text-center" role="status" aria-live="polite">
                    {saveStatus}
                </p>
            </div>
        </aside>
    );
}

export default AdminSidebar;
