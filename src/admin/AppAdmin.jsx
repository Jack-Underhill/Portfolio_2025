import { useState, useEffect, useCallback } from 'react';
import { loadAdminData, saveAdminData } from './api/adminClient';
import AdminShell                     from './shell/AdminShell.jsx';
import AboutAdminPage                 from './pages/AboutAdminPage.jsx';
import ProjectsAdminPage              from './pages/ProjectsAdminPage.jsx';
import EducationAdminPage             from './pages/EducationAdminPage.jsx';
import CertificationsAdminPage        from './pages/CertificationsAdminPage.jsx';
import SkillsAdminPage                from './pages/SkillsAdminPage.jsx';
import ContactAdminPage               from './pages/ContactAdminPage.jsx';
import ProjectSubsectionNav           from './projects/ProjectSubsectionNav.jsx';
import { PROJECT_EDITOR_SECTIONS }    from './projects/projectEditorSections.js';
import { ADMIN_ROUTE_IDS, ADMIN_ROUTES } from './routing/adminRoutes.js';
import useAdminScrollspy             from './routing/useAdminScrollspy.js';
import useAdminRoute                  from './routing/useAdminRoute.js';
import useUnsavedAdminWarning         from './routing/useUnsavedAdminWarning.js';
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

const TOP_LEVEL_ADMIN_SECTION_IDS = ADMIN_ROUTES.map((route) => route.id);

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
    const [activeProjectSectionId, setActiveProjectSectionId] = useState(PROJECT_EDITOR_SECTIONS[0].id);
    const [error, setError] = useState(null);
    const [errorVersion, setErrorVersion] = useState(0);
    const [dismissedStatusKey, setDismissedStatusKey] = useState(null);
    const {
        activeRoute,
        activeProjectSubsectionId,
        pushAdminRoute,
        replaceAdminRoute,
        routeNavigationAction,
    } = useAdminRoute();
    useUnsavedAdminWarning(hasUnsavedChanges);

    const handleActiveAdminSectionChange = useCallback((sectionId) => {
        const route = ADMIN_ROUTES.find((adminRoute) => adminRoute.id === sectionId);
        if (route) {
            replaceAdminRoute(route);
        }
    }, [replaceAdminRoute]);

    const { scrollToSection: scrollToAdminSection } = useAdminScrollspy({
        activeSectionId: activeRoute.id,
        onActiveSectionChange: handleActiveAdminSectionChange,
        sectionIds: TOP_LEVEL_ADMIN_SECTION_IDS,
    });

    const handleAdminNavigate = useCallback((event, route) => {
        event?.preventDefault();
        pushAdminRoute(route);
        scrollToAdminSection(route.id);
    }, [pushAdminRoute, scrollToAdminSection]);

    const routeProjectSectionId = PROJECT_EDITOR_SECTIONS.some((section) => section.id === activeProjectSubsectionId)
        ? activeProjectSubsectionId
        : null;
    const resolvedProjectSectionId = PROJECT_EDITOR_SECTIONS.some((section) => section.id === activeProjectSectionId)
        ? activeProjectSectionId
        : PROJECT_EDITOR_SECTIONS[0].id;

    useEffect(() => {
        if (routeProjectSectionId) {
            setActiveProjectSectionId((currentSectionId) => (
                currentSectionId === routeProjectSectionId
                    ? currentSectionId
                    : routeProjectSectionId
            ));
        }
    }, [routeProjectSectionId]);

    useEffect(() => {
        if (activeProjectSectionId !== resolvedProjectSectionId) {
            setActiveProjectSectionId(resolvedProjectSectionId);
        }
    }, [activeProjectSectionId, resolvedProjectSectionId]);

    useEffect(() => {
        if (routeNavigationAction && !['initial', 'popstate'].includes(routeNavigationAction)) {
            return;
        }

        scrollToAdminSection(activeRoute.id);
    }, [activeRoute.id, routeNavigationAction, scrollToAdminSection]);

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

    const handleProjectBioChange = useCallback((projectBio) => {
        setHasUnsavedChanges(true);
        setProjectsState((currentState) => ({
            ...currentState,
            projectBio,
        }));
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

    const pageProps = {
        aboutState,
        projectBio: projectsState.projectBio,
        projectsState,
        credentialsState,
        skillsState,
        contactState,
        onAboutChange: markDirty(setAboutState),
        onProjectBioChange: handleProjectBioChange,
        onProjectsChange: markDirty(setProjectsState),
        onCredentialsChange: markDirty(setCredentialsState),
        onSkillsChange: markDirty(setSkillsState),
        onContactChange: markDirty(setContactState),
        isSaveInFlight: isSaving,
        onValidationBusyChange: setIsProjectValidationInFlight,
        activeProjectSectionId: resolvedProjectSectionId,
    };
    const secondaryNav = activeRoute.id === ADMIN_ROUTE_IDS.PROJECTS && projectsState.projects.length > 0
        ? (
            <ProjectSubsectionNav
                sections={PROJECT_EDITOR_SECTIONS}
                activeSectionId={resolvedProjectSectionId}
                onSelectSection={setActiveProjectSectionId}
            />
        )
        : null;

    return (
        <AdminShell
            activeRoute={activeRoute}
            onNavigate={handleAdminNavigate}
            onSave={handleSave}
            saveLabel={saveLabel}
            saveStatus={saveStatus}
            isSaveDisabled={isSaveDisabled}
            isSaving={isSaving}
            statusMessage={visibleStatusMessage}
            onDismissStatus={dismissStatusMessage}
            secondaryNav={secondaryNav}
        >
            <div className={adminUi.page}>
                <AboutAdminPage {...pageProps} />
                <ProjectsAdminPage {...pageProps} />
                <EducationAdminPage {...pageProps} />
                <CertificationsAdminPage {...pageProps} />
                <SkillsAdminPage {...pageProps} />
                <ContactAdminPage {...pageProps} />
            </div>
        </AdminShell>
    );
}

export default AppAdmin;
