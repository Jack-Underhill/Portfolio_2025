import { useState, useEffect }        from 'react';
import AboutSection                   from './sections/AboutSection';
import ProjectsSection                from './sections/ProjectsSection';
import ContactSection                 from './sections/ContactSection';
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
    proficientTechs:    [''],
    experiencingTechs:  [''],
    socialLinks:        [],
};

function AppAdmin() {
    const [aboutState, setAboutState]       = useState(initialAboutState);
    const [projectsState, setProjectsState] = useState(initialProjectsState);
    const [contactState, setContactState]   = useState(initialContactState);
    const [isSaving, setIsSaving]           = useState(false);
    const [error, setError]                 = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const { about, projects, contact } = await loadAdminData();
                setAboutState(about);
                setProjectsState(projects);
                setContactState(contact);
            } catch (err) {
                console.error(err);
                setError(err);
            }
        })();
    }, []);

    const handleSave = async () => {
        try {
        setIsSaving(true);
        setError(null);

        const { about, projects, contact } = await saveAdminData({
            aboutState,
            projectsState,
            contactState,
        });
        setAboutState(about);
        setProjectsState(projects);
        setContactState(contact);

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
                    <nav className="flex gap-4 text-sm">
                        <a href="#about">About</a>
                        <a href="#projects">Projects</a>
                        <a href="#contact">Contact</a>
                    </nav>
                </header>

                <main className="space-y-16">
                    <section id="about">
                        <AboutSection state={aboutState} onChange={setAboutState} />
                    </section>

                    <section id="projects">
                        <ProjectsSection
                            state={projectsState}
                            onChange={setProjectsState}
                        />
                    </section>

                    <section id="contact">
                        <ContactSection
                            state={contactState}
                            onChange={setContactState}
                        />
                    </section>
                </main>

                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className={adminUi.primaryButton}
                >
                    {isSaving ? 'Saving...' : 'Save'}
                </button>
                {error && (
                    <p className="text-sm text-admin-danger-hover">
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
