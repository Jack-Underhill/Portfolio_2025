import { useEffect, useState } from 'react';
import avatarLogo from '../assets/avatar.png'

import TextBlock from './TextBlock'
import Avatar from './Avatar';
import { fetchAboutPublic } from '../api/publicAbout'

const DEFAULT_ABOUT = {
    professionTitle:    "Full-Stack Developer",
    briefBio:           "WSU Computer Science senior student passionate about game, web, and software development.",
    profileImage:       avatarLogo,
    resumeURL:          "/Jack_Underhill--Dev_Resume--No_Contact.pdf",
};

function About() {
    const [about, setAbout]     = useState(DEFAULT_ABOUT);

    useEffect(() => {
        let isMounted = true;

        (async () => {
            try {
                const data = await fetchAboutPublic();
                if (!isMounted || !data) return;

                setAbout((prev) => ({
                    professionTitle:    data.professionTitle || prev.professionTitle,
                    briefBio:           data.briefBio || prev.briefBio,
                    profileImage:       data.profileImage || prev.profileImage,
                    resumeUrl:          data.resumeUrl || prev.resumeUrl,
                }));
            } catch (err) {
                console.error('[About] Failed to load public about data:', err);
            }
        })();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="w-full min-h-fit lg:min-h-screen items-center flex flex-col-reverse md:flex-row">
            <div id="About" className="scroll-mt-10 w-full h-full md:w-3/5 flex flex-col gap-y-7 justify-center z-100">
                <div className='text-6xl font-bold text-emerald-50' data-aos="fade-up">
                    Jack Underhill
                </div>

                <TextBlock
                    title={about.professionTitle}
                    desc={about.briefBio}
                />

                <div className='flex flex-wrap gap-4'>
                    <a 
                        className='w-fit p-3 text-xl font-bold rounded-xl text-emerald-50 bg-button border-2 border-button-border hover:animate-bounce shadow-[inset_2px_2px_4px_#0b6e9e,inset_-2px_-2px_4px_#26a6d9]' 
                        href="https://github.com/Jack-Underhill" 
                        target="_blank" 
                        title='View My GitHub'
                        data-aos="fade-right"
                    >
                        View GitHub
                    </a>
                    <a
                        className='w-fit p-3 text-xl font-bold rounded-xl text-emerald-50 bg-card border-2 border-card-border hover:animate-bounce shadow-[inset_4px_4px_8px_#0a0f14,inset_-4px_-4px_8px_#1a232c]'
                        href={about.resumeUrl}
                        target="_blank"
                        rel='noopener noreferrer'
                        title='View My Resume'
                        data-aos="fade-left"
                    >
                        <span className='animated-gradient bg-gradient-to-r from-sky-400 via-emerald-50 to-sky-400 text-transparent bg-clip-text'>
                            View Resume
                        </span>
                    </a>
                </div>
            </div>

            <Avatar avatarLogo={about.profileImage || avatarLogo} />
        </div>
    )
}

export default About;