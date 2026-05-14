import { useState, useCallback } from 'react';
import GradientText from '../ui/GradientText';

function ViewButton({ 
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
                {isTextGradient ? (
                    <GradientText>View {name}</GradientText>
                ) : (
                    <span>View {name}</span>
                )}
            </span>
        </a>
    )
}

export default ViewButton;
