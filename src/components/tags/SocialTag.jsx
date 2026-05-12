import { useState, useCallback } from 'react'

function SocialTag({ name, link, icon, aos = "fade-down-right" }) {
    const [isHovered, setIsHovered] = useState(false)

    const onEnter = useCallback(() => setIsHovered(true), [])
    const onLeave = useCallback(() => setIsHovered(false), [])

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
            >
                <img
                    src={icon}
                    alt={`${name} Profile`}
                    draggable={false}
                    className={[
                        "h-full",
                        isHovered ? "animate-bounce will-change-transform" : "",
                    ].join(" ")}
                />
            </a>
        </div>
    )
}

export default SocialTag
