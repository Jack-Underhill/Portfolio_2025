import { useEffect, useState } from 'react';
import avatarLogo from '../assets/avatar.png'

import TextBlock from './TextBlock'
import AboutButton from './AboutButton';
import Avatar from './Avatar';
import { fetchAboutPublic } from '../api/publicAbout'

const DEFAULT_ABOUT = {
    professionTitle:    "Full-Stack Developer",
    briefBio:           "WSU Computer Science senior student passionate about game, web, and software development.",
    profileImage:       avatarLogo,
    resumeURL:          "/Jack_Underhill--Dev_Resume--No_Contact.pdf",
};

function Hero() {
    const [about, setAbout] = useState(DEFAULT_ABOUT);

    useEffect(() => {
        let isMounted = true;

        (async () => {
            try {
                const data = await fetchAboutPublic();
                if (!isMounted || !data) return;

                setAbout((prev) => ({
                    professionTitle:  data.professionTitle || prev.professionTitle,
                    briefBio:         data.briefBio        || prev.briefBio,
                    profileImage:     data.profileImage    || prev.profileImage,
                    resumeUrl:        data.resumeUrl       || prev.resumeUrl,
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
        <div id="Hero" className="w-full min-h-fit lg:min-h-screen items-center flex flex-col-reverse md:flex-row">
            <div className="scroll-mt-10 w-full h-full md:w-3/5 flex flex-col gap-y-7 justify-center z-100">
                <div className='text-6xl font-bold text-emerald-50' data-aos="fade-up">
                    Jack Underhill
                </div>

                <TextBlock
                    title={about.professionTitle}
                    desc={about.briefBio}
                />

                <div className="flex flex-wrap gap-4">
                    {/* GitHub */}
                    <AboutButton 
                        name="GitHub" 
                        url="https://github.com/Jack-Underhill" 
                        bgColor="bg-button" 
                        borderColor="border-button-border" 
                        insetShadowDark="inset_2px_2px_4px_#0b6e9e" 
                        insetShadowLight="inset_-2px_-2px_4px_#26a6d9" 
                        aos={'fade-right'}
                    />

                    {/* Resume */}
                    <AboutButton 
                        name="Resume" 
                        url={about.resumeUrl} 
                        isTextGradient={true}
                        bgColor="bg-card" 
                        borderColor="border-card-border" 
                        insetShadowDark="inset_4px_4px_8px_#0a0f14" 
                        insetShadowLight="inset_-4px_-4px_8px_#1a232c" 
                        aos={'fade-left'}
                    />
                </div>
            </div>

            <Avatar avatarLogo={about.profileImage || avatarLogo} />
        </div>
    )
}

export default Hero;