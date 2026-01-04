import { useState } from 'react';
import CardSurface from './CardSurface';
import TechTagMarquee from './TechTagMarquee'
import VideoGlowFrame from './VideoGlowFrame';

import placeholderVideo from '../assets/placeholder.mp4';

function ProjectCard({ image, video, title, desc, link, tags, onOpenModal }) {
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

    const handleCardClick = (e) => {
        const button = e.button ?? e?.nativeEvent?.button; // 0=left, 1=middle
        const isModified = e.metaKey || e.ctrlKey || button === 1;

        // Ctrl/Cmd click (new tab) OR middle click => let the browser do its normal link thing
        if (isModified) return;

        e.preventDefault();
        setIsPreviewed(false);
        onOpenModal?.();
    };

    return (
        <CardSurface
            link={link}
            title={`Open case study | ${title}`}
            onClick={handleCardClick}
            onMouseEnter={enablePreview}
            onMouseLeave={disablePreview}
            onFocus={enablePreview}
            onBlur={disablePreview}
            data-aos="flip-left"
            className='h-full p-2 flex flex-col'
        >
            <div className='relative w-full aspect-video rounded-xl group/image [container-type:inline-size]'>
                {isPreviewed && safeVideo ? (
                    <VideoGlowFrame
                        src={safeVideo}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                    />
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
        </CardSurface>
    )
}

export default ProjectCard;