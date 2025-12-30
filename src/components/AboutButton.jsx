import { useState, useCallback } from 'react';

function AboutButton({ 
    name, 
    url,
    isTextGradient = false, 
    bgColor, 
    borderColor, 
    insetShadowDark, 
    insetShadowLight,
    aos 
}) {
    const [isHovered, setIsHovered] = useState(false);

    const onEnter = useCallback(() => setIsHovered(true), []);
    const onLeave = useCallback(() => setIsHovered(false), []);

    return (
        <a
            className="group w-fit inline-block"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title={`View My ${name}`}
            data-aos={aos}
            onPointerEnter={onEnter}
            onPointerLeave={onLeave}
        >
            <span
                className={[
                    "inline-flex w-fit p-3 text-xl font-bold rounded-xl text-emerald-50",
                    `${bgColor} border-2 ${borderColor}`,
                    `shadow-[${insetShadowDark},${insetShadowLight}]`,
                    "transition-transform duration-200 ease-out",
                    "group-active:scale-[0.99]",
                    `${isHovered ? 'animate-bounce scale-[1.02] will-change-transform' : ''}`,
                ].join(" ")}
            >
                <span 
                    className={isTextGradient ? 
                        "animated-gradient bg-gradient-to-r from-sky-400 via-emerald-50 to-sky-400 text-transparent bg-clip-text" 
                        : ""
                    }
                >
                    View {name}
                </span>
            </span>
        </a>
    )
}

export default AboutButton;