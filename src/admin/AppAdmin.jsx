import { useState, useEffect, useCallback } from 'react';
import AboutSection                   from './sections/AboutSection';
import ProjectsSection                from './sections/ProjectsSection';
import ContactSection                 from './sections/ContactSection';
import SkillsSection                  from './sections/SkillsSection';
import { loadAdminData, saveAdminData } from './api/adminClient';

import BackToTopButton      from "./navigation/BackToTopButton";
import BackToBottomButton   from './navigation/BackToBottomButton';
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

function AppAdmin() {
    const [aboutState, setAboutState]       = useState(initialAboutState);
    const [projectsState, setProjectsState] = useState(initialProjectsState);
    const [contactState, setContactState]   = useState(initialContactState);
    const [skillsState, setSkillsState]     = useState(initialSkillsState);
    const [isSaving, setIsSaving]           = useState(false);
    const [isProjectValidationInFlight, setIsProjectValidationInFlight] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [error, setError]                 = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const { about, projects, contact, skills } = await loadAdminData();
                setAboutState(about);
                setProjectsState(projects);
                setContactState(contact);
                setSkillsState(skills || initialSkillsState);
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

        const { about, projects, contact, skills } = await saveAdminData({
            aboutState,
            projectsState,
            contactState,
            skillsState,
        });
        setAboutState(about);
        setProjectsState(projects);
        setContactState(contact);
        setSkillsState(skills || initialSkillsState);
        setHasUnsavedChanges(false);

        } catch (err) {
            console.error(err);
            setError(err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className='relative w-full h-full'>

            <div className={adminUi.page}>
                <header className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Portfolio Admin</h1>
                    <nav className="flex gap-4 text-sm" aria-label="Admin sections">
                        <a href="#about">About</a>
                        <a href="#projects">Projects</a>
                        <a href="#skills">Skills</a>
                        <a href="#contact">Contact</a>
                    </nav>
                </header>

                <main className="space-y-16">
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
                </main>

                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving || isProjectValidationInFlight || !hasUnsavedChanges}
                    aria-busy={isSaving || undefined}
                    className={adminUi.primaryButton}
                >
                    {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save changes' : 'Saved'}
                </button>
                <p className="text-xs text-admin-text-subtle" role="status" aria-live="polite">
                    {isSaving
                        ? 'Saving changes...'
                        : isProjectValidationInFlight
                            ? 'Draft validation is running.'
                            : hasUnsavedChanges
                                ? 'Unsaved draft changes'
                                : 'All changes saved'}
                </p>
                {error && (
                    <p className="text-sm text-admin-danger-hover" role="alert">
                        {error.message || 'Admin request failed'}
                    </p>
                )}
            </div>

            <BackToTopButton    showAfter={500} />
            <BackToBottomButton showAfter={500} />
        </div>
    );
}

export default AppAdmin;
