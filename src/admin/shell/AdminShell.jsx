import { adminShell } from '../../styles/recipes';
import AdminSidebar from './AdminSidebar.jsx';

function AdminShell({
    activeRoute,
    children,
    onNavigate,
    onSave,
    saveLabel,
    saveStatus,
    isSaveDisabled,
    isSaving,
}) {
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

            <main className={adminShell.main}>
                <div className={adminShell.content}>
                    {children}
                </div>
            </main>
        </div>
    );
}

export default AdminShell;
