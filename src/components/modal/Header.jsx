import ActionButton from "./ActionButton";

import closeIcon from '../../assets/close.svg';

export default function Header({ data, onClose, closeBtnRef }) {
    return (
        <div className="sticky top-0 z-10 border-b border-card-border">
            <div className="px-5 py-4 flex flex-row gap-3">
                <div className="flex-1 flex flex-col md:flex-row items-start gap-3">
                    <div className="min-w-0 flex-1">
                        <span className='
                            py-3 font-extrabold 
                            animated-gradient bg-gradient-to-r from-sky-400 via-emerald-50 to-sky-400
                            text-transparent text-balance bg-clip-text
                            text-4xl
                            leading-[1.05] md:leading-[1.1]
                            drop-shadow-[0_0_6px_rgba(0,0,0,0.9)]
                        '>
                            {data.title}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <ActionButton href={data.liveUrl}>Live</ActionButton>
                        <ActionButton href={data.sourceUrl}>Code</ActionButton>
                        <ActionButton href={data.writeupUrl}>Writeup</ActionButton>
                        <ActionButton href={data.videoPageUrl}>Video</ActionButton>
                    </div>
                </div>

                <button
                    ref={closeBtnRef}
                    onClick={onClose}
                    className="ml-1 size-8 rounded-lg text-emerald-50 hover:brightness-130 hover:scale-110 transition duration-500 ease-out"
                    aria-label="Close case study"
                    title="Close case study"
                >
                    <img
                        src={closeIcon}
                        alt={`View close svg`}
                        className='h-full transition-transform duration-500 ease-in-out hover:rotate-360'
                    />
                </button>
            </div>
        </div>
    );
};

