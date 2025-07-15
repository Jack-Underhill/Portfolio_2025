import { useEffect, useState } from 'react';
import TechTag from './TechTag'
import clicks from '../assets/clicks.svg'

function ProjectCard({ image, title, desc, link, tags }) {
    const [uniqueClicks, setUniqueClicks] = useState(null);

    const getSafeKey = (url) => {
        try {
            return btoa(url);
        } catch {
            return null;
        }
    }

    useEffect(() => {
        const key = getSafeKey(link);
        if(!key) return;

        fetch(`/.netlify/functions/project-click-counter?project=${key}`)
            .then(async res => {
                if(!res.ok) {
                    const text = await res.text();
                    throw new Error(text);
                }
                return res.json();
            })
            .then(data => {
                setUniqueClicks(data.count);
            })
            .catch(err => console.error("Click counter fetch error:", err));
    }, [link]);

    return (
        <div className="h-full" data-aos="flip-left">
            <a
                href={link}
                target="_blank"
                title='View My Project Link'
                className='h-full px-2 py-2 bg-card border-2 border-card-border rounded-xl flex flex-col shadow-[inset_4px_4px_8px_#0a0f14,inset_-4px_-4px_8px_#1a232c] group'
                onClick={() => {
                    const key = getSafeKey(link);
                    if(!key) return;

                    fetch(`/.netlify/functions/project-click-counter?project=${key}`)
                        .then(async res => {
                            if(!res.ok) throw new Error(await res.text());
                            return res.json();
                        })
                        .then(data => {
                            setUniqueClicks(data.count);
                        })
                        .catch(err => console.error("Click increment error:", err));
                }}
            >
                <div className='relative w-full aspect-video rounded-xl group/image'>
                    {/* Hover shadow animation */}
                    <div className="absolute -inset-1 rounded-xl animated-gradient bg-gradient-to-r from-sky-400 via-emerald-50 to-sky-400 blur opacity-0 group-hover:opacity-100 transition duration-500 animate-tilt z-0"/>
                    
                    {/* Project Image */}
                    <img src={image} alt="Project Card" className='relative z-10 w-full h-auto object-contain rounded-xl' />

                    {/* Click Counter Overlay */}
                    <div data-aos="flip-up" className='absolute m-2 py-0.5 px-1 bottom-0 z-20 w-fit h-fit flex items-end-safe justify-end-safe rounded-xl drop-shadow-lg bg-black/60'>
                        <div 
                            className="relative w-fit h-fit flex gap-2 items-center" 
                            title='Project Clicks' 
                        >
                            <img 
                                src={clicks} 
                                alt={`View svg`}
                                className='h-10 group-hover/image:animate-spin transition duration-500 ease-in-out' 
                            />
                            <div className='text-md font-semibold text-emerald-50'>
                                {uniqueClicks !== null ? `${uniqueClicks} clicks` : 'Loading ...'}
                            </div>
                        </div>
                    </div>
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