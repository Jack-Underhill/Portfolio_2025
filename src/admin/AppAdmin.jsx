import { useState, useEffect, useCallback } from 'react';
import AboutSection                   from './sections/AboutSection';
import ProjectsSection                from './sections/ProjectsSection';
import ContactSection                 from './sections/ContactSection';
import SkillsSection                  from './sections/SkillsSection';
import CredentialsSection             from './sections/CredentialsSection';
import { loadAdminData, saveAdminData } from './api/adminClient';
import AdminShell                     from './shell/AdminShell.jsx';
import useAdminRoute                  from './routing/useAdminRoute.js';
import { adminUi }          from '../styles/recipes';

const initialAboutState = {
    profileImageFile:   null,
    profileImageUrl:    '',
    professionTitle:    '',
    professionBio:      '',
    resumeFile:         null,
    resumeUrl:          '',
};

const initialProjectsState = {
    projectBio: '',
    projects:   [],
};

const initialContactState = {
    socialLinks:        [],
};

const initialSkillsState = {
    groups: [],
};

const initialCredentialsState = {
    education: [],
    certifications: [],
};

function AppAdmin() {
    const [aboutState, setAboutState] = useState(initialAboutState);
    const [projectsState, setProjectsState] = useState(initialProjectsState);
    const [contactState, setContactState] = useState(initialContactState);
    const [skillsState, setSkillsState] = useState(initialSkillsState);
    const [credentialsState, setCredentialsState] = useState(initialCredentialsState);
    const [isSaving, setIsSaving] = useState(false);
    const [isProjectValidationInFlight, setIsProjectValidationInFlight] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [error, setError] = useState(null);
    const { activeRoute, navigateToRouteId } = useAdminRoute();

    useEffect(() => {
        (async () => {
            try {
                const { about, projects, contact, skills, credentials } = await loadAdminData();
                setAboutState(about);
                setProjectsState(projects);
                setContactState(contact);
                setSkillsState(skills || initialSkillsState);
                setCredentialsState(credentials || initialCredentialsState);
                setHasUnsavedChanges(false);
            } catch (err) {
                console.error(err);
                setError(err);
            }
        })();
    }, []);

    const markDirty = useCallback((setter) => (nextState) => {
        setHasUnsavedChanges(true);
        setter(nextState);
    }, []);

    const handleSave = async () => {
        if (isSaving || isProjectValidationInFlight || !hasUnsavedChanges) return;

        try {
        setIsSaving(true);
        setError(null);

        const { about, projects, contact, skills, credentials } = await saveAdminData({
            aboutState,
            projectsState,
            contactState,
            skillsState,
            credentialsState,
        });
        setAboutState(about);
        setProjectsState(projects);
        setContactState(contact);
        setSkillsState(skills || initialSkillsState);
        setCredentialsState(credentials || initialCredentialsState);
        setHasUnsavedChanges(false);

        } catch (err) {
            console.error(err);
            setError(err);
        } finally {
            setIsSaving(false);
        }
    };

    const isSaveDisabled = isSaving || isProjectValidationInFlight || !hasUnsavedChanges;
    const saveLabel = isSaving
        ? 'Saving...'
        : isProjectValidationInFlight
            ? 'Review pending validation'
            : hasUnsavedChanges
                ? 'Save changes'
                : 'Saved';
    const saveStatus = isSaving
        ? 'Saving changes...'
        : isProjectValidationInFlight
            ? 'Project draft validation is running.'
            : hasUnsavedChanges
                ? 'Unsaved draft changes'
                : 'All changes saved';

    return (
        <AdminShell
            activeRoute={activeRoute}
            onNavigate={navigateToRouteId}
            onSave={handleSave}
            saveLabel={saveLabel}
            saveStatus={saveStatus}
            isSaveDisabled={isSaveDisabled}
            isSaving={isSaving}
        >
            <div className={adminUi.page}>
                {error && (
                    <p className="text-sm text-admin-danger-hover" role="alert">
                        {error.message || 'Admin request failed'}
                    </p>
                )}

                <div className="space-y-16">
                    <section id="about" aria-labelledby="admin-about-heading">
                        <AboutSection state={aboutState} onChange={markDirty(setAboutState)} />
                    </section>

                    <section id="projects" aria-labelledby="admin-projects-heading">
                        <ProjectsSection
                            state={projectsState}
                            onChange={markDirty(setProjectsState)}
                            isSaveInFlight={isSaving}
                            onValidationBusyChange={setIsProjectValidationInFlight}
                        />
                    </section>

                    <section id="credentials" aria-labelledby="admin-credentials-heading">
                        <CredentialsSection
                            state={credentialsState}
                            onChange={markDirty(setCredentialsState)}
                        />
                    </section>

                    <section id="skills" aria-labelledby="admin-skills-heading">
                        <SkillsSection
                            state={skillsState}
                            onChange={markDirty(setSkillsState)}
                        />
                    </section>

                    <section id="contact" aria-labelledby="admin-contact-heading">
                        <ContactSection
                            state={contactState}
                            onChange={markDirty(setContactState)}
                        />
                    </section>
                </div>
            </div>
        </AdminShell>
    );
}

export default AppAdmin;
