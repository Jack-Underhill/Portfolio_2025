import AdminPageWrapper from '../shell/AdminPageWrapper';
import ProjectsSection from '../sections/ProjectsSection';

function ProjectsAdminPage({
    projectsState,
    onProjectsChange,
    isSaveInFlight,
    onValidationBusyChange,
}) {
    return (
        <AdminPageWrapper
            name="Projects"
            desc="Edit project cards, media, links, draft context, and validation before publishing changes."
            component={
                <ProjectsSection
                    state={projectsState}
                    onChange={onProjectsChange}
                    isSaveInFlight={isSaveInFlight}
                    onValidationBusyChange={onValidationBusyChange}
                />
            }
        />
    );
}

export default ProjectsAdminPage;
