import TechListEditor from "../../lists/TechListEditor";
import { adminUi } from '../../../styles/recipes';


function ProjectListFields({ projectId, features, metrics, improvements, headingId, handleFieldChange }) {
    return (
        <div className={adminUi.divider}>
            <h2 id={headingId} className={adminUi.sectionLabel}>Lists</h2>
            
            <TechListEditor
                idPrefix={`project-features-${projectId}`}
                label="Key features"
                values={features || ['']}
                onChange={(next) => handleFieldChange('features', next)}
            />

            <div className="grid gap-4 md:grid-cols-2">

                <TechListEditor
                    idPrefix={`project-metrics-${projectId}`}
                    label="Metrics"
                    values={metrics || ['']}
                    onChange={(next) => handleFieldChange('metrics', next)}
                />

                <TechListEditor
                    idPrefix={`project-improvements-${projectId}`}
                    label="Improvements"
                    values={improvements || ['']}
                    onChange={(next) => handleFieldChange('improvements', next)}
                />
            </div>
        </div>
    );
};

export default ProjectListFields;
