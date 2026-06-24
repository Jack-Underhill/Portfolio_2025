import AdminPageWrapper from '../shell/AdminPageWrapper';
import ProjectsSection from '../sections/ProjectsSection';

function ProjectsAdminPage({
    projectsState,
    onProjectsChange,
    isSaveInFlight,
    onValidationBusyChange,
    onAdminSectionMount,
    onProjectSectionMount,
    onProjectRecordChangeStart,
    onProjectWorkspaceReturn,
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
                    onProjectSectionMount={onProjectSectionMount}
                    onProjectRecordChangeStart={onProjectRecordChangeStart}
                    onProjectWorkspaceReturn={onProjectWorkspaceReturn}
                />
            }
        />
    );
}

export default ProjectsAdminPage;
