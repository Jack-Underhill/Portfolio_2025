import TechListEditor from '../../lists/TechListEditor';
import { adminUi } from '../../../styles/recipes';


function ProjectTechStackFields({ projectId, stack, handleFieldChange }) {
    const setTechStackCategory = (category, nextValues) => {
        const nextStack = { ...(stack || {}) };
        nextStack[category] = nextValues;
        handleFieldChange('techStack', nextStack);
    };

    return (
        <div className={adminUi.divider}>
            <p className={adminUi.sectionLabel}>Tech (categorized)</p>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <TechListEditor
                    idPrefix={`project-tech-frontend-${projectId}`}
                    label="Frontend"
                    values={stack?.frontend || ['']}
                    onChange={(next) => setTechStackCategory('frontend', next)}
                />

                <TechListEditor
                    idPrefix={`project-tech-backend-${projectId}`}
                    label="Backend"
                    values={stack?.backend || ['']}
                    onChange={(next) => setTechStackCategory('backend', next)}
                />

                <TechListEditor
                    idPrefix={`project-tech-data-${projectId}`}
                    label="Data"
                    values={stack?.data || ['']}
                    onChange={(next) => setTechStackCategory('data', next)}
                />

                <TechListEditor
                    idPrefix={`project-tech-infra-${projectId}`}
                    label="Infrastructure"
                    values={stack?.infrastructure || ['']}
                    onChange={(next) => setTechStackCategory('infrastructure', next)}
                />
            </div>
        </div>
    );
};

export default ProjectTechStackFields;
