import { useEffect, useState } from "react";
import ArrowUp from "../assets/arrow-up.svg";


function BackToTopButton({
    showAfter = 500,
    bottom = "bottom-6",
    right = "right-6",
}) {
    const [visible, setVisible] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Watch the global modal-open flag on <html>
    useEffect(() => {
        const root = document.documentElement;
        const read = () => root.getAttribute("data-modal-open") === "true";

        setIsModalOpen(read());

        const obs = new MutationObserver(() => setIsModalOpen(read()));
        obs.observe(root, { attributes: true, attributeFilter: ["data-modal-open"] });

        return () => obs.disconnect();
    }, []);

    useEffect(() => {
        // If a modal is open, don't even run the scroll listener (and hide button)
        if (isModalOpen) {
            setVisible(false);
            return;
        }

        const onScroll = () => setVisible(window.scrollY > showAfter);

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", onScroll);
        };
    }, [showAfter, isModalOpen]);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    // Fully remove it from the DOM while modal is open
    if (isModalOpen) return null;

    return (
        <div
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
                title="Back to top"
                className={[
                    "group flex h-12 w-12 items-center justify-center rounded-full border-2",
                    "border-button-border bg-button",
                    "shadow-[inset_2px_2px_4px_#0b6e9e,inset_-2px_-2px_4px_#26a6d9]",
                    `transition-[transform,box-shadow] duration-[200ms] ease-out`,
                    "hover:scale-105",
                    "hover:shadow-[inset_2px_2px_4px_#0b6e9e,inset_-2px_-2px_4px_#26a6d9,0_0_0_1px_rgba(27,149,204,0.35),0_0_24px_rgba(14,138,194,0.25)]",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-button-border/60",
                ].join(" ")}
            >
                <img
                    src={ArrowUp}
                    alt="Up Arrow Button to go back to top"
                    className="size-5/10 object-contain opacity-80 transition-opacity group-hover:opacity-95"
                />
            </button>
        </div>
    );
}

export default BackToTopButton;
