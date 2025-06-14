import TechTag from './TechTag'

function ProjectCard({ image, title, desc, link, tags }) {
    return (
        <a href={link} target="_blank" title='View My Portfolio Repo' className='px-6 py-4 bg-card border-2 border-card-border shadow-lg hover:bg-gray-600 rounded-xl flex flex-col gap-y-4'>
            <div className='w-full aspect-video rounded-xl'>
                <img src={image} alt="Profile Avatar" className='w-full h-auto object-contain rounded-xl' />
            </div>
            
            <div className='text-2xl font-bold text-emerald-50'>
                {title}
            </div>

            <div className='text-xl font-semibold text-emerald-50'>
                {desc}
            </div>

            <TechTag
                className='px-3 py-1 text-xl font-semibold rounded-lg bg-card-att text-emerald-50'
                tags={tags}
            />
        </a>
    )
}

export default ProjectCard;