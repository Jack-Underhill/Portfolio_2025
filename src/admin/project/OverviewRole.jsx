import InputTextArea from "../InputTextArea";


function OverviewRole({ projectId, overview, role, handleFieldChange }) {
    return (
        <div className="space-y-3 pt-2 border-t border-slate-800">
            <p className="text-xs uppercase tracking-wide text-slate-400">Modal</p>

            <InputTextArea
                id={`project-overview-${projectId}`}
                label="Overview"
                value={overview || ''}
                onChange={(value) => handleFieldChange('overview', value)}
            />

            <InputTextArea
                id={`project-role-${projectId}`}
                label="Role"
                value={role || ''}
                onChange={(value) => handleFieldChange('role', value)}
            />
        </div>
    );
};

export default OverviewRole;