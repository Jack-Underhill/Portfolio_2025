import AdminPageWrapper from '../shell/AdminPageWrapper';
import ProjectsSection from '../sections/ProjectsSection';

function ProjectsAdminPage({
    projectsState,
    onProjectsChange,
    isSaveInFlight,
    onValidationBusyChange,
    activeProjectSectionId,
    onAdminSectionMount,
    onProjectSectionMount,
    onProjectRecordSelect,
}) {
    return (
        <AdminPageWrapper
            name="Projects"
            desc="Edit project cards, media, links, draft context, and validation before publishing changes."
            onSectionMount={onAdminSectionMount}
            component={
                <ProjectsSection
                    state={projectsState}
                    onChange={onProjectsChange}
                    isSaveInFlight={isSaveInFlight}
                    onValidationBusyChange={onValidationBusyChange}
                    activeSectionId={activeProjectSectionId}
                    onProjectSectionMount={onProjectSectionMount}
                    onProjectRecordSelect={onProjectRecordSelect}
                />
            }
        />
    );
}

export default ProjectsAdminPage;
