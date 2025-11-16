import { useState } from 'react';
import SectionAbout from './SectionAbout';
import SectionProjects from './SectionProjects';
import SectionContact from './SectionContact';

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
    proficientTechs: [''],
    experiencingTechs: [''],
    socialLinks: [
        { id: 'linkedin',   label: 'LinkedIn',  url: '', iconFile: null, iconUrl: '' },
        { id: 'github',     label: 'GitHub',    url: '', iconFile: null, iconUrl: '' },
        { id: 'fiverr',     label: 'Fiverr',    url: '', iconFile: null, iconUrl: '' },
        { id: 'upwork',     label: 'Upwork',    url: '', iconFile: null, iconUrl: '' },
        { id: 'handshake',  label: 'Handshake', url: '', iconFile: null, iconUrl: '' },
    ],
};

function AppAdmin() {
    const [aboutState, setAboutState]       = useState(initialAboutState);
    const [projectsState, setProjectsState] = useState(initialProjectsState);
    const [contactState, setContactState]   = useState(initialContactState);

    const handleSave = () => {
        // later: call Supabase helpers here
        console.log({
            about:      aboutState,
            projects:   projectsState,
            contact:    contactState,
        });
    };

    return (
        <div className="min-h-screen px-20 py-10 bg-slate-950 text-slate-50 p-6 space-y-10">
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
                    <SectionAbout state={aboutState} onChange={setAboutState} />
                </section>

                <section id="projects">
                    <SectionProjects
                        state={projectsState}
                        onChange={setProjectsState}
                    />
                </section>

                <section id="contact">
                    <SectionContact
                        state={contactState}
                        onChange={setContactState}
                    />
                </section>
            </main>

            <button
                type="button"
                onClick={handleSave}
                className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium hover:bg-sky-500"
            >
                Save POST
            </button>
        </div>
    );
}

export default AppAdmin;
