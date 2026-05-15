import { useEffect, useState } from "react";

function getDistanceFromBottom() {
    const el = document.scrollingElement || document.documentElement;
    return el.scrollHeight - (window.scrollY + el.clientHeight);
}

function useScrollVisibility({
    direction = "top",
    showAfter = 500,
    disabled = false,
} = {}) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (disabled || typeof window === "undefined" || typeof document === "undefined") {
            setVisible(false);
            return;
        }

        const syncVisibility = () => {
            const nextVisible = direction === "bottom"
                ? getDistanceFromBottom() > showAfter
                : window.scrollY > showAfter;

            setVisible(nextVisible);
        };

        syncVisibility();
        window.addEventListener("scroll", syncVisibility, { passive: true });

        return () => {
            window.removeEventListener("scroll", syncVisibility);
        };
    }, [direction, showAfter, disabled]);

    return visible;
}

export default useScrollVisibility;
