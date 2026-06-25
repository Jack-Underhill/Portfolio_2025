import { useState, useEffect, useCallback, useRef } from 'react';
import { loadAdminData, saveAdminData } from './api/adminClient';
import AdminShell                     from './shell/AdminShell.jsx';
import {
    getAdminStickyToolbarViewportOffset,
} from './shell/adminSectionToolbarGeometry.js';
import AboutAdminPage                 from './pages/AboutAdminPage.jsx';
import ProjectsAdminPage              from './pages/ProjectsAdminPage.jsx';
import EducationAdminPage             from './pages/EducationAdminPage.jsx';
import CertificationsAdminPage        from './pages/CertificationsAdminPage.jsx';
import SkillsAdminPage                from './pages/SkillsAdminPage.jsx';
import ContactAdminPage               from './pages/ContactAdminPage.jsx';
import {
    ADMIN_OBSERVED_LEAVES,
    ADMIN_PROJECTS_PATH,
    ADMIN_ROUTES,
    ADMIN_ROUTE_IDS,
    ADMIN_SCROLL_TARGET_TYPES,
    DEFAULT_PROJECT_SUBSECTION_ROUTE,
    getProjectSubsectionPath,
} from './routing/adminRoutes.js';
import useAdminScrollspy, {
    useAdminScrollTargetRegistry,
} from './routing/useAdminScrollspy.js';
import useAdminNavigationCoordinator from './routing/useAdminNavigationCoordinator.js';
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

const OBSERVED_LEAVES_BY_ID = new Map(
    ADMIN_OBSERVED_LEAVES.map((leaf) => [leaf.id, leaf]),
);
const PROJECTS_ROOT_ROUTE = ADMIN_ROUTES.find(
    (route) => route.id === ADMIN_ROUTE_IDS.PROJECTS,
);

function getRouteObservedLeafId(routeId, projectSubsectionId = null) {
    if (routeId !== ADMIN_ROUTE_IDS.PROJECTS) {
        return OBSERVED_LEAVES_BY_ID.has(routeId)
            ? routeId
            : ADMIN_OBSERVED_LEAVES[0].id;
    }

    if (!projectSubsectionId) {
        return ADMIN_OBSERVED_LEAVES[0].id;
    }

    const projectLeafId = `${ADMIN_ROUTE_IDS.PROJECTS}/${projectSubsectionId}`;
    return OBSERVED_LEAVES_BY_ID.has(projectLeafId)
        ? projectLeafId
        : ADMIN_OBSERVED_LEAVES[0].id;
}

function getRouteNavigationTarget(activeRoute, projectSubsectionId, source) {
    const projectLeaf = projectSubsectionId
        ? OBSERVED_LEAVES_BY_ID.get(`${ADMIN_ROUTE_IDS.PROJECTS}/${projectSubsectionId}`)
        : null;

    if (activeRoute.id === ADMIN_ROUTE_IDS.PROJECTS && projectLeaf) {
        return {
            source,
            path: projectLeaf.path,
            destinationId: projectLeaf.id,
            scrollTarget: projectLeaf.scrollTarget,
        };
    }

    return {
        source,
        path: activeRoute.path,
        destinationId: activeRoute.id,
        scrollTarget: activeRoute.scrollTarget,
    };
}

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
    const [isAdminDataReady, setIsAdminDataReady] = useState(false);
    const [isProjectValidationInFlight, setIsProjectValidationInFlight] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
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
    const [observedActiveLeafId, setObservedActiveLeafId] = useState(() => (
        getRouteObservedLeafId(activeRoute.id, activeProjectSubsectionId)
    ));
    const updateObservedActiveLeafRef = useRef(null);
    useUnsavedAdminWarning(hasUnsavedChanges);
    const {
        getTargetElement,
        setTargetRef,
    } = useAdminScrollTargetRegistry();

    const observedActiveLeaf = OBSERVED_LEAVES_BY_ID.get(observedActiveLeafId)
        || ADMIN_OBSERVED_LEAVES[0];

    const handleObservedActiveLeafVisualChange = useCallback((leafId) => {
        const leaf = OBSERVED_LEAVES_BY_ID.get(leafId);
        if (!leaf) return;

        setObservedActiveLeafId(leaf.id);
    }, []);

    const handleObservedRouteReplace = useCallback((leafId) => {
        const leaf = OBSERVED_LEAVES_BY_ID.get(leafId);
        if (!leaf) return;

        if (
            leaf.routeId === ADMIN_ROUTE_IDS.PROJECTS
            && projectsState.projects.length === 0
        ) {
            replaceAdminRoute(ADMIN_PROJECTS_PATH);
            return;
        }

        replaceAdminRoute(leaf.path);
    }, [projectsState.projects.length, replaceAdminRoute]);

    const handleNavigationSettled = useCallback(({ observedLeafId, target }) => {
        if (
            target?.destinationId !== ADMIN_ROUTE_IDS.PROJECTS
            || !isAdminDataReady
            || projectsState.projects.length === 0
        ) {
            return;
        }

        const observedLeaf = OBSERVED_LEAVES_BY_ID.get(observedLeafId);
        if (observedLeaf?.projectSubsectionId === DEFAULT_PROJECT_SUBSECTION_ROUTE.id) {
            replaceAdminRoute(observedLeaf.path);
        }
    }, [
        isAdminDataReady,
        projectsState.projects.length,
        replaceAdminRoute,
    ]);

    const {
        beginProjectRecordStabilization,
        handleObservedLeafChange,
        navigateToTarget,
        navigateToRouteTarget,
        navigationTarget,
    } = useAdminNavigationCoordinator({
        getTargetElement,
        initialObservedLeafId: observedActiveLeafId,
        onNavigateRoute: pushAdminRoute,
        onNavigationSettled: handleNavigationSettled,
        onObservedLeafChange: handleObservedActiveLeafVisualChange,
        onObservedRouteReplace: handleObservedRouteReplace,
        onProjectStabilizationSettled: () => {
            updateObservedActiveLeafRef.current?.();
        },
        onRouteTargetFallback: replaceAdminRoute,
    });

    const { updateActiveSection: updateObservedActiveLeaf } = useAdminScrollspy({
        observedLeafId: observedActiveLeafId,
        getTargetElement,
        locations: ADMIN_OBSERVED_LEAVES,
        onObservedLeafChange: handleObservedLeafChange,
        viewportTopOffset: getAdminStickyToolbarViewportOffset,
    });

    useEffect(() => {
        updateObservedActiveLeafRef.current = updateObservedActiveLeaf;
    }, [updateObservedActiveLeaf]);

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
        navigateToTarget({
            source: 'root-click',
            path: route.path,
            destinationId: route.id,
            scrollTarget: route.scrollTarget,
        });
    }, [navigateToTarget]);

    const handleProjectSubsectionNavigate = useCallback((event, section) => {
        event?.preventDefault();
        navigateToTarget({
            source: 'child-click',
            path: getProjectSubsectionPath(section.id),
            destinationId: `${ADMIN_ROUTE_IDS.PROJECTS}/${section.id}`,
            scrollTarget: section.scrollTarget,
        });
    }, [navigateToTarget]);

    const handleProjectWorkspaceReturn = useCallback(() => {
        navigateToTarget({
            source: 'project-action',
            path: PROJECTS_ROOT_ROUTE.path,
            destinationId: PROJECTS_ROOT_ROUTE.id,
            scrollTarget: PROJECTS_ROOT_ROUTE.scrollTarget,
        });
    }, [navigateToTarget]);

    const handleProjectRecordChangeStart = useCallback(() => {
        if (observedActiveLeaf.routeId !== ADMIN_ROUTE_IDS.PROJECTS) return;

        beginProjectRecordStabilization(observedActiveLeaf.scrollTarget);
    }, [beginProjectRecordStabilization, observedActiveLeaf]);

    useEffect(() => {
        if (routeNavigationAction && !['initial', 'popstate'].includes(routeNavigationAction)) {
            return;
        }

        const routeTarget = getRouteNavigationTarget(
            activeRoute,
            activeProjectSubsectionId,
            routeNavigationAction || 'initial',
        );
        const projectsParentTarget = getRouteNavigationTarget(
            activeRoute,
            null,
            routeNavigationAction || 'initial',
        );

        navigateToRouteTarget(routeTarget, {
            isReady: isAdminDataReady,
            fallbackTarget: activeProjectSubsectionId ? projectsParentTarget : null,
            shouldUseFallback: Boolean(
                activeProjectSubsectionId
                && isAdminDataReady
                && projectsState.projects.length === 0
            ),
        });
    }, [
        activeRoute,
        isAdminDataReady,
        navigateToRouteTarget,
        projectsState.projects.length,
        routeNavigationAction,
        activeProjectSubsectionId,
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
            } finally {
                setIsAdminDataReady(true);
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
        onAdminSectionMount: setAdminSectionRef,
        onProjectSectionMount: setProjectSectionRef,
        onProjectRecordChangeStart: handleProjectRecordChangeStart,
        onProjectWorkspaceReturn: handleProjectWorkspaceReturn,
    };

    return (
        <AdminShell
            activeRouteId={observedActiveLeaf.routeId}
            activeProjectSubsectionId={observedActiveLeaf.projectSubsectionId}
            isProjectsExpanded={
                observedActiveLeaf.routeId === ADMIN_ROUTE_IDS.PROJECTS
                || navigationTarget?.destinationId === ADMIN_ROUTE_IDS.PROJECTS
                || navigationTarget?.destinationId?.startsWith(`${ADMIN_ROUTE_IDS.PROJECTS}/`)
            }
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
