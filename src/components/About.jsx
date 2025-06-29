import avatarLogo from '../assets/avatar.png'

import TextBlock from './TextBlock'

function About() {
    return (
        <div className="w-full min-h-fit lg:min-h-screen items-center flex flex-col-reverse md:flex-row">
            <div className="w-full h-full md:w-3/5 flex flex-col gap-y-7 justify-center">
                <div className='text-6xl font-bold text-emerald-50' data-aos="fade-up">
                    Jack Underhill
                </div>

                <TextBlock
                    title="Full-Stack Developer"
                    desc="WSU Computer Science senior student passionate about web development, game systems, and desktop apps."
                />

                <div className='flex flex-wrap gap-4'>
                    <a 
                        className='w-fit p-3 text-xl font-bold rounded-xl text-emerald-50 bg-button border-2 border-button-border hover:animate-bounce shadow-[inset_2px_2px_4px_#0b6e9e,inset_-2px_-2px_4px_#26a6d9]' 
                        href="https://github.com/Jack-Underhill" 
                        target="_blank" 
                        title='View My GitHub'
                        data-aos="fade-right"
                    >
                        View Projects
                    </a>
                    <a
                        className='w-fit p-3 text-xl font-bold rounded-xl text-emerald-50 bg-card border-2 border-card-border hover:animate-bounce shadow-[inset_4px_4px_8px_#0a0f14,inset_-4px_-4px_8px_#1a232c]'
                        href="/Jack_Underhill--Dev_Resume.pdf"
                        target="_blank"
                        rel='noopener noreferrer'
                        title='View My Resume'
                        data-aos="fade-left"
                    >
                        <span className='animated-gradient bg-gradient-to-r from-sky-400 via-emerald-50 to-sky-400 text-transparent bg-clip-text'>View Resume</span>
                    </a>
                </div>
            </div>
            <div className="w-full h-full md:w-2/5 flex justify-baseline md:justify-center-safe mb-7 md:mb-0">
                <a 
                    href="https://www.linkedin.com/in/underhill-jack/" 
                    target="_blank"
                    className="h-full w-full max-w-4/5 max-h-4/5 aspect-auto rounded-3xl" 
                    title='View My LinkedIn'
                    data-aos="flip-up"
                >
                    <div className='w-full h-full rounded-3xl animate-bounce hover:animate-spin transition duration-200 ease-in-out'>
                        <img 
                            src={avatarLogo} 
                            alt="Profile Avatar" 
                            className='w-full h-full rounded-3xl' 
                        />
                    </div>
                </a>
            </div>
        </div>
    )
}

export default About;