import { useState } from 'react';
import TechTagMarquee from './TechTagMarquee'

import placeholderVideo from '../assets/placeholder.mp4';

function ProjectCard({ image, video, title, desc, link, tags }) {
    const [isPreviewed, setIsPreviewed] = useState(false);
    
    const safeVideo =
        video === null || video === '' || video === undefined || video === 'NULL'
            ? placeholderVideo
            : video;

    const enablePreview = () => {
        if(safeVideo) setIsPreviewed(true);
    }

    const disablePreview = () => {
        setIsPreviewed(false);
    }

    return (
        <div className="h-full" data-aos="flip-left">
            <a
                href={link}
                target="_blank"
                title='View My Project Link'
                className='h-full px-2 py-2 bg-card border-2 border-card-border rounded-xl flex flex-col shadow-[inset_4px_4px_8px_#0a0f14,inset_-4px_-4px_8px_#1a232c] group'
                onMouseEnter={enablePreview}
                onMouseLeave={disablePreview}
                onFocus={enablePreview}
                onBlur={disablePreview}
            >
                <div className='relative w-full aspect-video rounded-xl group/image [container-type:inline-size]'>
                    {/* Hover shadow animation */}
                    <div className="absolute -inset-1 rounded-xl animated-gradient bg-gradient-to-r from-sky-400 via-emerald-50 to-sky-400 blur opacity-0 group-hover:opacity-100 transition duration-500 animate-tilt z-0"/>
                    
                    {isPreviewed && safeVideo ? (
                        <>
                            {/* Preview Video */}
                            <video
                                className='relative z-10 w-full h-auto aspect-video object-cover rounded-xl'
                                src={safeVideo}
                                autoPlay
                                muted
                                loop
                                playsInline
                                preload='metadata'
                            />
                        </>
                    ) : (
                        <>
                            {/* Project Image */}
                            <img 
                                className='relative z-10 w-full h-auto aspect-video object-cover rounded-xl' 
                                src={image} 
                                alt="Project Card" 
                            />

                            {/* Centered overlay title */}
                            <div className='absolute inset-0 z-20 px-6 flex items-center justify-center text-center bg-black/20 rounded-xl'>
                                <span className='
                                    py-3 font-extrabold 
                                    animated-gradient bg-gradient-to-r from-sky-400 via-emerald-50 to-sky-400
                                    text-transparent text-balance bg-clip-text
                                    text-[clamp(1.25rem,11cqw,10rem)]
                                    leading-[1.05] md:leading-[1.1]
                                    drop-shadow-[0_0_6px_rgba(0,0,0,0.9)]
                                '>
                                    {title}
                                </span>
                            </div>
                        </>
                    )}
                    
                </div>

                <div className='px-8 pt-6 pb-4 text-xl font-semibold text-emerald-50'>
                    {desc}
                </div>

                <div className='pb-4 mb-0 mt-auto text-sm md:text-md lg:text-xl'>
                    <TechTagMarquee
                        className='px-3 py-1 font-semibold rounded-lg bg-card-att text-emerald-50'
                        tags={tags}
                    />
                </div>
            </a>
        </div>
    )
}

export default ProjectCard;