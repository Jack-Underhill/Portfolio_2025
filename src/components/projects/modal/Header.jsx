import { useEffect } from "react";

import ActionButton from "./ActionButton";
import GradientText from "../../ui/GradientText";

import closeIcon from '../../../assets/close.svg';

export default function Header({ data, onClose, closeBtnRef, initialFocusRef, titleId }) {
    const actions = [
        {
            href: data.liveUrl,
            label: "Live",
            accessibleLabel: `Open ${data.title} live project`,
        },
        {
            href: data.sourceUrl,
            label: "Code",
            accessibleLabel: `Open ${data.title} source code`,
        },
        {
            href: data.writeupUrl,
            label: "Writeup",
            accessibleLabel: `Open ${data.title} writeup`,
        },
        {
            href: data.videoPageUrl,
            label: "Video",
            accessibleLabel: `Open ${data.title} video`,
        },
    ].filter((action) => action.href);
    const firstActionHref = actions[0]?.href ?? null;

    useEffect(() => {
        if (!firstActionHref || typeof document === "undefined") return;

        const initialEl = initialFocusRef?.current;
        if (!initialEl) return;

        const activeEl = document.activeElement;
        if (activeEl === closeBtnRef?.current || activeEl === document.body) {
            initialEl.focus();
        }
    }, [firstActionHref, closeBtnRef, initialFocusRef]);

    return (
        <div className="sticky top-0 z-10 border-b border-card-border">
            <div className="px-5 py-4 flex flex-row gap-3">
                <div className="flex-1 flex flex-col md:flex-row items-start gap-3">
                    <div className="min-w-0 flex-1">
                        <GradientText
                            as="h2"
                            id={titleId}
                            className='
                            py-3 font-extrabold 
                            text-balance
                            text-4xl
                            leading-[1.05] md:leading-[1.1]
                            drop-shadow-modal-title
                        '
                        >
                            {data.title}
                        </GradientText>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {actions.map((action, index) => (
                            <ActionButton
                                key={action.label}
                                ref={index === 0 ? initialFocusRef : undefined}
                                href={action.href}
                                accessibleLabel={action.accessibleLabel}
                            >
                                {action.label}
                            </ActionButton>
                        ))}
                    </div>
                </div>

                <button
                    ref={closeBtnRef}
                    onClick={onClose}
                    className="ml-1 size-8 rounded-lg text-text hover:brightness-130 hover:scale-110 focus-visible:brightness-130 focus-visible:scale-110 transition duration-500 ease-out"
                    aria-label="Close case study"
                    title="Close case study"
                >
                    <img
                        src={closeIcon}
                        alt=""
                        aria-hidden="true"
                        className='h-full transition-transform duration-500 ease-in-out hover:rotate-360 focus-visible:rotate-360'
                    />
                </button>
            </div>
        </div>
    );
};

