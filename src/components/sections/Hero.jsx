import avatarLogo from '../../assets/avatar.png'

import TextBlock from '../ui/TextBlock'
import ViewButton from '../buttons/ViewButton';
import Avatar from '../profile/Avatar';
import { fetchAboutPublic } from '../../api/public/about'
import usePublicResource from '../../hooks/usePublicResource';
import { mergeAboutData } from '../../domain/about/viewModel';

const DEFAULT_ABOUT = {
    professionTitle:    "Full-Stack Developer",
    briefBio:           "WSU Computer Science senior student passionate about game, web, and software development.",
    profileImageUrl:    avatarLogo,
    resumeUrl:          "/Jack_Underhill--Dev_Resume--No_Contact.pdf",
};

function Hero() {
    const { data: about } = usePublicResource({
        load: fetchAboutPublic,
        initialData: DEFAULT_ABOUT,
        merge: mergeAboutData,
        label: 'Hero',
    });

    return (
        <section
            id="Hero"
            aria-labelledby="hero-heading"
            className="mt-12 flex w-full flex-col-reverse items-center gap-y-6 gap-x-4 sm:mt-14 md:mt-16 md:flex-row lg:mt-30 2xl:mt-60"
        >
            <div className="scroll-mt-10 z-100 flex w-full flex-col justify-center gap-y-7 md:w-3/5">
                <h1 id="hero-heading" className='text-6xl font-bold text-emerald-50' data-aos="fade-up">
                    Jack Underhill
                </h1>

                <TextBlock
                    titleAs="h2"
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

            <Avatar avatarLogo={about.profileImageUrl || avatarLogo} />
        </section>
    )
}

export default Hero;
