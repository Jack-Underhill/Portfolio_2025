import { useEffect, useRef } from "react";

import ArrowUp from "../../assets/arrow-up.svg";
import useModalOpenFlag from "../../hooks/useModalOpenFlag";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";
import useScrollVisibility from "../../hooks/useScrollVisibility";


function BackToTopButton({
    showAfter = 500,
    bottom = "bottom-6",
    right = "right-6",
}) {
    const isModalOpen = useModalOpenFlag();
    const prefersReducedMotion = usePrefersReducedMotion();
    const visible = useScrollVisibility({ direction: "top", showAfter, disabled: isModalOpen });
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (visible) return;

        const wrapper = wrapperRef.current;
        if (wrapper?.contains(document.activeElement)) {
            document.activeElement.blur();
        }
    }, [visible]);

    const scrollToTop = (event) => {
        event.currentTarget.blur();
        window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion ? "auto" : "smooth",
        });
    };

    // Fully remove it from the DOM while modal is open
    if (isModalOpen) return null;

    return (
        <div
            ref={wrapperRef}
            aria-hidden={!visible}
            className={[
                "fixed z-50",
                bottom,
                right,

                `transition-all duration-[500ms] ease-out`,
                "will-change-transform",

                visible
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 translate-y-[calc(100%+1.5rem)] pointer-events-none",
            ].join(" ")}
        >
            <button
                type="button"
                onClick={scrollToTop}
                aria-label="Back to top"
                tabIndex={visible ? undefined : -1}
                title="Back to top"
                className={[
                    "group flex h-12 w-12 items-center justify-center rounded-full border-2",
                    "border-button-border bg-button",
                    "shadow-button-inset",
                    `transition-[transform,box-shadow] duration-[200ms] ease-out`,
                    "hover:scale-105 focus:scale-105",
                    "hover-shadow-button-accent focus:animate-bounce",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-button-border/60",
                    "motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:focus:scale-100 motion-reduce:focus:animate-none",
                ].join(" ")}
            >
                <img
                    src={ArrowUp}
                    alt=""
                    aria-hidden="true"
                    className="size-5/10 object-contain opacity-80 transition-opacity group-hover:opacity-95 group-focus-visible:opacity-95"
                />
            </button>
        </div>
    );
}

export default BackToTopButton;
