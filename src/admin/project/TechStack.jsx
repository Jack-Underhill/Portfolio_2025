import ListTech from '../ListTech';


function TechStack({ projectId, stack, handleFieldChange }) {
    const setTechStackCategory = (category, nextValues) => {
        const nextStack = { ...(stack || {}) };
        nextStack[category] = nextValues;
        handleFieldChange('techStack', nextStack);
    };

    return (
        <div className="space-y-3 pt-2 border-t border-slate-800">
            <p className="text-xs uppercase tracking-wide text-slate-400">Tech (categorized)</p>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <ListTech
                    idPrefix={`project-tech-frontend-${projectId}`}
                    label="Frontend"
                    values={stack?.frontend || ['']}
                    onChange={(next) => setTechStackCategory('frontend', next)}
                />

                <ListTech
                    idPrefix={`project-tech-backend-${projectId}`}
                    label="Backend"
                    values={stack?.backend || ['']}
                    onChange={(next) => setTechStackCategory('backend', next)}
                />

                <ListTech
                    idPrefix={`project-tech-data-${projectId}`}
                    label="Data"
                    values={stack?.data || ['']}
                    onChange={(next) => setTechStackCategory('data', next)}
                />

                <ListTech
                    idPrefix={`project-tech-infra-${projectId}`}
                    label="Infrastructure"
                    values={stack?.infrastructure || ['']}
                    onChange={(next) => setTechStackCategory('infrastructure', next)}
                />
            </div>
        </div>
    );
};

export default TechStack;