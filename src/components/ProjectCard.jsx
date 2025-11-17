import TechTag from './TechTag'

function ProjectCard({ image, title, desc, link, tags }) {

    return (
        <div className="h-full" data-aos="flip-left">
            <a
                href={link}
                target="_blank"
                title='View My Project Link'
                className='h-full px-2 py-2 bg-card border-2 border-card-border rounded-xl flex flex-col shadow-[inset_4px_4px_8px_#0a0f14,inset_-4px_-4px_8px_#1a232c] group'
            >
                <div className='relative w-full aspect-video rounded-xl group/image'>
                    {/* Hover shadow animation */}
                    <div className="absolute -inset-1 rounded-xl animated-gradient bg-gradient-to-r from-sky-400 via-emerald-50 to-sky-400 blur opacity-0 group-hover:opacity-100 transition duration-500 animate-tilt z-0"/>
                    
                    {/* Project Image */}
                    <img src={image} alt="Project Card" className='relative z-10 w-full h-auto aspect-video object-cover rounded-xl' />
                </div>

                <div className='px-8 py-6 flex flex-col gap-y-4 text-sm md:text-md lg:text-xl'>
                    <div className='text-2xl font-bold text-emerald-50'>
                        <span className='animated-gradient bg-gradient-to-r from-sky-400 via-emerald-50 to-sky-400 text-transparent bg-clip-text'>
                            {title}
                        </span>
                    </div>

                    <div className='text-xl font-semibold text-emerald-50'>
                        {desc}
                    </div>

                    <TechTag
                        className='px-3 py-1 font-semibold rounded-lg bg-card-att text-emerald-50'
                        tags={tags}
                    />
                </div>
            </a>
        </div>
    )
}

export default ProjectCard;