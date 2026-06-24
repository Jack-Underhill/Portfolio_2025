import { useState, useEffect, useCallback } from 'react';
import { loadAdminData, saveAdminData } from './api/adminClient';
import AdminShell                     from './shell/AdminShell.jsx';
import AboutAdminPage                 from './pages/AboutAdminPage.jsx';
import ProjectsAdminPage              from './pages/ProjectsAdminPage.jsx';
import EducationAdminPage             from './pages/EducationAdminPage.jsx';
import CertificationsAdminPage        from './pages/CertificationsAdminPage.jsx';
import SkillsAdminPage                from './pages/SkillsAdminPage.jsx';
import ContactAdminPage               from './pages/ContactAdminPage.jsx';
import { PROJECT_EDITOR_SECTIONS }    from './projects/projectEditorSections.js';
import {
    ADMIN_OBSERVED_LEAVES,
    ADMIN_ROUTE_IDS,
    ADMIN_ROUTES,
    ADMIN_SCROLL_TARGET_TYPES,
    getProjectSubsectionPath,
} from './routing/adminRoutes.js';
import useAdminScrollspy, {
    useAdminScrollTargetRegistry,
} from './routing/useAdminScrollspy.js';
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

const PROJECT_SCROLLSPY_TOP_OFFSET_PX = 208;
const TOP_LEVEL_ADMIN_SCROLL_LOCATIONS = ADMIN_ROUTES.map((route) => ({
    id: route.id,
    observationTarget: route.scrollTarget,
    scrollTarget: route.scrollTarget,
}));
const PROJECT_SCROLL_LOCATIONS = ADMIN_OBSERVED_LEAVES
    .filter((leaf) => leaf.routeId === ADMIN_ROUTE_IDS.PROJECTS)
    .map((leaf) => ({
        id: leaf.projectSubsectionId,
        observationTarget: leaf.observationTarget,
        scrollTarget: leaf.scrollTarget,
    }));

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
    const {
        getTargetElement,
        setTargetRef,
    } = useAdminScrollTargetRegistry();

    const routeProjectSectionId = PROJECT_EDITOR_SECTIONS.some((section) => section.id === activeProjectSubsectionId)
        ? activeProjectSubsectionId
        : null;
    const resolvedProjectSectionId = PROJECT_EDITOR_SECTIONS.some((section) => section.id === activeProjectSectionId)
        ? activeProjectSectionId
        : PROJECT_EDITOR_SECTIONS[0].id;

    const handleActiveAdminSectionChange = useCallback((sectionId) => {
        const route = ADMIN_ROUTES.find((adminRoute) => adminRoute.id === sectionId);
        if (route) {
            replaceAdminRoute(route);
        }
    }, [replaceAdminRoute]);

    const { scrollToSection: scrollToAdminSection } = useAdminScrollspy({
        activeSectionId: activeRoute.id,
        getTargetElement,
        locations: TOP_LEVEL_ADMIN_SCROLL_LOCATIONS,
        onActiveSectionChange: handleActiveAdminSectionChange,
    });

    const handleActiveProjectSectionChange = useCallback((sectionId) => {
        const isKnownProjectSection = PROJECT_EDITOR_SECTIONS.some((section) => section.id === sectionId);
        if (!isKnownProjectSection) return;

        setActiveProjectSectionId(sectionId);
        replaceAdminRoute(getProjectSubsectionPath(sectionId));
    }, [replaceAdminRoute]);

    const {
        scrollToSection: scrollToProjectSection,
    } = useAdminScrollspy({
        activeSectionId: resolvedProjectSectionId,
        enabled: activeRoute.id === ADMIN_ROUTE_IDS.PROJECTS && projectsState.projects.length > 0,
        getTargetElement,
        locations: PROJECT_SCROLL_LOCATIONS,
        onActiveSectionChange: handleActiveProjectSectionChange,
        viewportTopOffset: PROJECT_SCROLLSPY_TOP_OFFSET_PX,
    });

    const setAdminSectionRef = useCallback((sectionId, element) => {
        setTargetRef({
            type: ADMIN_SCROLL_TARGET_TYPES.ROOT_SECTION,
            id: sectionId,
        }, element);
    }, [setTargetRef]);

    const setProjectSectionRef = useCallback((sectionId, element) => {
        setTargetRef({
            type: ADMIN_SCROLL_TARGET_TYPES.PROJECT_SUBSECTION,
            id: sectionId,
        }, element);
    }, [setTargetRef]);

    const handleAdminNavigate = useCallback((event, route) => {
        event?.preventDefault();
        pushAdminRoute(route);
        scrollToAdminSection(route.id);
    }, [pushAdminRoute, scrollToAdminSection]);

    const handleProjectSubsectionNavigate = useCallback((event, section) => {
        event?.preventDefault();
        setActiveProjectSectionId(section.id);
        pushAdminRoute(getProjectSubsectionPath(section.id));
        scrollToProjectSection(section.id);
    }, [pushAdminRoute, scrollToProjectSection]);

    const handleProjectRecordSelect = useCallback((sectionId) => {
        const isKnownProjectSection = PROJECT_EDITOR_SECTIONS.some((section) => section.id === sectionId);
        const nextSectionId = isKnownProjectSection
            ? sectionId
            : PROJECT_EDITOR_SECTIONS[0].id;

        setActiveProjectSectionId(nextSectionId);
        scrollToProjectSection(nextSectionId, { skipIfVisible: true });
    }, [scrollToProjectSection]);

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

        if (activeRoute.id === ADMIN_ROUTE_IDS.PROJECTS && routeProjectSectionId) {
            const didScrollToProjectSection = scrollToProjectSection(routeProjectSectionId);
            if (didScrollToProjectSection) return;
        }

        scrollToAdminSection(activeRoute.id);
    }, [
        activeRoute.id,
        projectsState.projects.length,
        routeNavigationAction,
        routeProjectSectionId,
        scrollToAdminSection,
        scrollToProjectSection,
    ]);

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
        onAdminSectionMount: setAdminSectionRef,
        onProjectSectionMount: setProjectSectionRef,
        onProjectRecordSelect: handleProjectRecordSelect,
    };

    return (
        <AdminShell
            activeRoute={activeRoute}
            activeProjectSubsectionId={resolvedProjectSectionId}
            onNavigate={handleAdminNavigate}
            onProjectSubsectionNavigate={handleProjectSubsectionNavigate}
            onSave={handleSave}
            saveLabel={saveLabel}
            saveStatus={saveStatus}
            isSaveDisabled={isSaveDisabled}
            isSaving={isSaving}
            statusMessage={visibleStatusMessage}
            onDismissStatus={dismissStatusMessage}
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
