import TechTag from './TechTag'

function ProjectCard({ image, title, desc, link, tags }) {
    return (
        <div className="h-full" data-aos="flip-left">
            <a
                href={link}
                target="_blank"
                title='View My Portfolio Repo'
                className='h-full px-8 py-6 bg-card border-2 border-card-border rounded-xl flex flex-col gap-y-4 shadow-[inset_4px_4px_8px_#0a0f14,inset_-4px_-4px_8px_#1a232c] group'
            >
                <div className='relative w-full aspect-video rounded-xl'>
                    <div className="absolute -inset-1 rounded-xl animated-gradient bg-gradient-to-r from-sky-400 via-emerald-50 to-sky-400 blur opacity-0 group-hover:opacity-100 transition duration-500 animate-tilt z-0"/>
                    <img src={image} alt="Profile Avatar" className='relative z-10 w-full h-auto object-contain rounded-xl' />
                </div>

                <div className='text-2xl font-bold text-emerald-50'>
                    <span className='animated-gradient bg-gradient-to-r from-sky-400 via-emerald-50 to-sky-400 text-transparent bg-clip-text'>{title}</span>
                </div>

                <div className='text-xl font-semibold text-emerald-50'>
                    {desc}
                </div>

                <TechTag
                    className='px-3 py-1 text-xl font-semibold rounded-lg bg-card-att text-emerald-50'
                    tags={tags}
                />
            </a>
        </div>
    )
}

export default ProjectCard;