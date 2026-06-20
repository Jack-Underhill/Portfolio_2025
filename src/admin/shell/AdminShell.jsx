import { adminShell } from '../../styles/recipes';
import AdminSidebar from './AdminSidebar.jsx';
import AdminStatusBanner from './AdminStatusBanner.jsx';

function AdminShell({
    activeRoute,
    children,
    onNavigate,
    onSave,
    saveLabel,
    saveStatus,
    isSaveDisabled,
    isSaving,
    statusMessage,
    onDismissStatus,
    secondaryNav,
}) {
    const hasSecondaryNav = Boolean(secondaryNav);

    return (
        <div className={adminShell.root}>
            <AdminSidebar
                activeRoute={activeRoute}
                onNavigate={onNavigate}
                onSave={onSave}
                saveLabel={saveLabel}
                saveStatus={saveStatus}
                isSaveDisabled={isSaveDisabled}
                isSaving={isSaving}
            />

            {hasSecondaryNav && (
                <aside className={adminShell.secondarySidebar}>
                    {secondaryNav}
                </aside>
            )}

            <main className={adminShell.main}>
                <div className={adminShell.content}>
                    <AdminStatusBanner
                        message={statusMessage}
                        onDismiss={onDismissStatus}
                    />
                    {children}
                </div>
            </main>
        </div>
    );
}

export default AdminShell;
