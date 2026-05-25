import { useEffect, useRef } from "react";

import ArrowUp from "../../assets/arrow-up.svg";
import useScrollVisibility from "../../hooks/useScrollVisibility";


function BackToBottomButton({
    showAfter = 500,
    bottom = "bottom-6",
    right = "right-6",
}) {
    const visible = useScrollVisibility({ direction: "bottom", showAfter });
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (visible) return;

        const wrapper = wrapperRef.current;
        if (wrapper?.contains(document.activeElement)) {
            document.activeElement.blur();
        }
    }, [visible]);

    const scrollToBottom = (event) => {
        event.currentTarget.blur();
        const el = document.scrollingElement || document.documentElement;
        const bottom = el.scrollHeight - el.clientHeight;
        window.scrollTo({ top: bottom, behavior: "smooth" });
    };

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
                onClick={scrollToBottom}
                aria-label="Back to bottom"
                title="Back to bottom"
                tabIndex={visible ? 0 : -1}
                className={[
                    "group flex h-12 w-12 items-center justify-center rounded-full border-2",
                    "border-button-border bg-button",
                    "shadow-button-inset",
                    `transition-[transform,box-shadow] duration-[200ms] ease-out`,
                    "hover:scale-105",
                    "hover-shadow-button-accent",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-button-border/60",
                ].join(" ")}
            >
                <img
                    src={ArrowUp}
                    alt=""
                    aria-hidden="true"
                    className="size-5/10 object-contain opacity-80 transition-opacity group-hover:opacity-95 rotate-180"
                />
            </button>
        </div>
    );
}

export default BackToBottomButton;
