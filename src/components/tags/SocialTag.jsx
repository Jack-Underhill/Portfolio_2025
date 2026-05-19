import { useState, useCallback } from 'react'

function SocialTag({ name, link, icon, aos = "fade-down-right" }) {
    const [isHovered, setIsHovered] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

    const onEnter = useCallback(() => setIsHovered(true), [])
    const onLeave = useCallback(() => setIsHovered(false), [])
    const onFocus = useCallback(() => setIsFocused(true), [])
    const onBlur  = useCallback(() => setIsFocused(false), [])

    return (
        <div className="h-20 w-20" data-aos={aos}>
            <a
                className="h-full inline-block"
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                title={`View My ${name}`}
                onPointerEnter={onEnter}
                onPointerLeave={onLeave}
                onFocus={onFocus}
                onBlur={onBlur}
            >
                <img
                    src={icon}
                    alt={`${name} Profile`}
                    draggable={false}
                    className={[
                        "h-full",
                        (isHovered || isFocused) ? "animate-bounce will-change-transform" : "",
                    ].join(" ")}
                />
            </a>
        </div>
    )
}

export default SocialTag
