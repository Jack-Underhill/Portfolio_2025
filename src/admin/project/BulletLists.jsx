import ListTech from "../ListTech";


function BulletLists({ projectId, features, metrics, improvements, handleFieldChange }) {
    return (
        <div className="space-y-3 pt-2 border-t border-slate-800">
            <p className="text-xs uppercase tracking-wide text-slate-400">Modal Lists</p>

            <ListTech
                idPrefix={`project-features-${projectId}`}
                label="Key features"
                values={features || ['']}
                onChange={(next) => handleFieldChange('features', next)}
            />

            <ListTech
                idPrefix={`project-metrics-${projectId}`}
                label="Metrics"
                values={metrics || ['']}
                onChange={(next) => handleFieldChange('metrics', next)}
            />

            <ListTech
                idPrefix={`project-improvements-${projectId}`}
                label="Improvements"
                values={improvements || ['']}
                onChange={(next) => handleFieldChange('improvements', next)}
            />
        </div>
    );
};

export default BulletLists;