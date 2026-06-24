import AdminPageWrapper from '../shell/AdminPageWrapper';
import ProjectBioEditor from '../projects/ProjectBioEditor';
import AboutSection from '../sections/AboutSection';

function AboutAdminPage({
    aboutState,
    projectBio,
    onAboutChange,
    onProjectBioChange,
    onAdminSectionMount,
}) {
    return (
        <AdminPageWrapper
            name="About"
            desc="Manage the profile content, resume, and primary introduction shown across the portfolio."
            onSectionMount={onAdminSectionMount}
            component={
                <div className="space-y-8">
                    <AboutSection
                        state={aboutState}
                        onChange={onAboutChange}
                    />

                    <ProjectBioEditor
                        value={projectBio}
                        onChange={onProjectBioChange}
                    />
                </div>
            }
        />
    );
}

export default AboutAdminPage;
