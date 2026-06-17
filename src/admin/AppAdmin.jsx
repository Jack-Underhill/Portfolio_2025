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

function getAdminStatusMessage({
    error,
    errorVersion,
    isSaving,
    isProjectValidationInFlight,
    hasUnsavedChanges,
}) {
    if (error) {
        return {
            key: `error:${errorVersion}`,
            tone: 'error',
            title: 'Admin request failed',
            description: error.message || 'Admin request failed. Please try again.',
        };
    }

    if (isSaving) {
        return {
            key: 'saving',
            tone: 'info',
            title: 'Saving changes',
            description: 'Your portfolio updates are being saved.',
        };
    }

    if (isProjectValidationInFlight) {
        return {
            key: 'project-validation',
            tone: 'info',
            title: 'Save temporarily blocked',
            description: 'Project draft validation is still running. Save is temporarily blocked until validation completes.',
        };
    }

    if (hasUnsavedChanges) {
        return {
            key: 'unsaved-changes',
            tone: 'info',
            title: 'Unsaved changes',
            description: 'You have draft edits that have not been saved yet.',
        };
    }

    return null;
}

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
    const [errorVersion, setErrorVersion] = useState(0);
    const [dismissedStatusKey, setDismissedStatusKey] = useState(null);
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
                setErrorVersion((version) => version + 1);
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
            setErrorVersion((version) => version + 1);
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
            ? 'Save blocked'
            : hasUnsavedChanges
                ? 'Unsaved changes'
                : 'All changes saved';
    const currentStatusMessage = getAdminStatusMessage({
        error,
        errorVersion,
        isSaving,
        isProjectValidationInFlight,
        hasUnsavedChanges,
    });
    const visibleStatusMessage = currentStatusMessage?.key === dismissedStatusKey
        ? null
        : currentStatusMessage;
    const dismissStatusMessage = () => {
        if (!currentStatusMessage) return;
        setDismissedStatusKey(currentStatusMessage.key);
    };

    return (
        <AdminShell
            activeRoute={activeRoute}
            onNavigate={navigateToRouteId}
            onSave={handleSave}
            saveLabel={saveLabel}
            saveStatus={saveStatus}
            isSaveDisabled={isSaveDisabled}
            isSaving={isSaving}
            statusMessage={visibleStatusMessage}
            onDismissStatus={dismissStatusMessage}
        >
            <div className={adminUi.page}>
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
