import { useState, useCallback } from 'react';
import GradientText from '../ui/GradientText';

const cx = (...classes) => classes.filter(Boolean).join(" ");

const variantClasses = {
    primary: "border-button-border bg-button shadow-button-inset text-text",
    secondary: "border-card-border bg-card shadow-card-inset text-text",
};

function ViewButton({ 
    name, 
    url,
    isTextGradient = false, 
    variant = "primary",
    aos 
}) {
    const [isHovered, setIsHovered] = useState(false);

    const onEnter = useCallback(() => setIsHovered(true), []);
    const onLeave = useCallback(() => setIsHovered(false), []);

    return (
        <a
            className="group w-fit inline-block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-button-border/60"
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
                    "inline-flex w-fit p-3 text-xl font-bold rounded-xl border-2",
                    variantClasses[variant] || variantClasses.primary,
                    "transition-transform duration-200 ease-out",
                    "group-active:scale-[0.99]",
                    cx(isHovered && "animate-bounce scale-[1.02] will-change-transform"),
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
