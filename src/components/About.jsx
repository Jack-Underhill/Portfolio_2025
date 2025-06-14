import avatarLogo from '../assets/avatar.png'

import TextBlock from './TextBlock'

function About() {
    return (
        <div className="py-12 w-full min-h-screen items-center flex flex-col-reverse md:flex-row gap-x-0">
            <div className="w-full md:w-3/5 h-full flex flex-col gap-y-7 justify-center">
                <div className='text-6xl font-bold text-emerald-50'>
                    Jack Underhill
                </div>

                <TextBlock
                    title="Full-Stack Developer"
                    desc="WSU Computer Science senior student with a passion for video games, desktop applications, and building web applications."
                />

                <div className='flex flex-wrap gap-4'>
                    <a className='w-fit p-3 text-xl font-bold rounded-xl text-emerald-50 bg-button border-2 border-button-border shadow-lg hover:bg-sky-600' href="https://github.com/Jack-Underhill" target="_blank" title='View My GitHub'>
                        View Projects
                    </a>
                    <a
                        className='w-fit p-3 text-xl font-bold rounded-xl text-emerald-50 bg-card border-2 border-card-border shadow-lg hover:bg-gray-600'
                        href="/Jack_Underhill--Dev_Resume--5_20_2025.pdf"
                        target="_blank"
                        rel='noopener noreferrer'
                        title='View My Resume'
                    >
                        View Resume
                    </a>
                </div>
            </div>
            <div className="w-full md:w-2/5 h-full flex">
                <a 
                    href="https://www.linkedin.com/in/underhill-jack/" 
                    target="_blank"
                    className="w-full max-h-[600px] aspect-auto rounded-3xl" 
                    title='View My LinkedIn'
                >
                    <img 
                        src={avatarLogo} 
                        alt="Profile Avatar" 
                        className='w-full h-auto rounded-3xl animate-bounce hover:animate-spin transition duration-200' 
                    />
                </a>
            </div>
        </div>
    )
}

export default About;