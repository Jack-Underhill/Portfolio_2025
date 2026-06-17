import { ADMIN_ROUTES } from '../routing/adminRoutes.js';
import { adminShell, adminUi, cx } from '../../styles/recipes';
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

                    return (
                        <a
                            key={route.id}
                            href={route.path}
                            onClick={(event) => onNavigate(event, route)}
                            aria-current={isActive ? 'page' : undefined}
                            className={cx(adminShell.navLink, isActive && adminShell.navLinkActive)}
                        >
                            <AdminNavIcon icon={route.icon} />
                            <span>{route.label}</span>
                        </a>
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
