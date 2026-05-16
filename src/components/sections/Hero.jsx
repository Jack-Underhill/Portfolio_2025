import avatarLogo from '../../assets/avatar.png'

import TextBlock from '../ui/TextBlock'
import ViewButton from '../buttons/ViewButton';
import Avatar from '../profile/Avatar';
import { fetchAboutPublic } from '../../api/public/about'
import usePublicResource from '../../hooks/usePublicResource';

const DEFAULT_ABOUT = {
    professionTitle:    "Full-Stack Developer",
    briefBio:           "WSU Computer Science senior student passionate about game, web, and software development.",
    profileImage:       avatarLogo,
    resumeUrl:          "/Jack_Underhill--Dev_Resume--No_Contact.pdf",
};

function mergeAboutData(data, previous) {
    return {
        professionTitle:  data.professionTitle || previous.professionTitle,
        briefBio:         data.briefBio        || previous.briefBio,
        profileImage:     data.profileImage    || previous.profileImage,
        resumeUrl:        data.resumeUrl       || previous.resumeUrl,
    };
}

function Hero() {
    const { data: about } = usePublicResource({
        load: fetchAboutPublic,
        initialData: DEFAULT_ABOUT,
        merge: mergeAboutData,
        label: 'Hero',
    });

    return (
        <div id="Hero" className="w-full min-h-fit lg:min-h-screen items-center flex flex-col-reverse md:flex-row gap-y-6 gap-x-4 pt-8 md:pt-0">
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
                    <ViewButton 
                        name="GitHub" 
                        url="https://github.com/Jack-Underhill" 
                        variant="primary"
                        aos={'fade-right'}
                    />

                    {/* Resume */}
                    <ViewButton 
                        name="Resume" 
                        url={about.resumeUrl} 
                        isTextGradient={true}
                        variant="secondary"
                        aos={'fade-left'}
                    />
                </div>
            </div>

            <Avatar avatarLogo={about.profileImage || avatarLogo} />
        </div>
    )
}

export default Hero;
