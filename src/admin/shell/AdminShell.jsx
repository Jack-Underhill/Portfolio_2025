import { adminShell } from '../../styles/recipes';
import AdminSidebar from './AdminSidebar.jsx';
import AdminStatusBanner from './AdminStatusBanner.jsx';

function AdminShell({
    activeRouteId,
    activeProjectSubsectionId,
    expandedRouteIds,
    workflowState,
    children,
    onNavigate,
    onProjectSubsectionNavigate,
    onSave,
    saveLabel,
    saveStatus,
    isSaveDisabled,
    isSaving,
    statusMessage,
    onDismissStatus,
}) {
    return (
        <div className={adminShell.root}>
            <AdminSidebar
                activeRouteId={activeRouteId}
                activeProjectSubsectionId={activeProjectSubsectionId}
                expandedRouteIds={expandedRouteIds}
                workflowState={workflowState}
                onNavigate={onNavigate}
                onProjectSubsectionNavigate={onProjectSubsectionNavigate}
                onSave={onSave}
                saveLabel={saveLabel}
                saveStatus={saveStatus}
                isSaveDisabled={isSaveDisabled}
                isSaving={isSaving}
            />

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
