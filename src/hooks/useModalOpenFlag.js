import { useEffect, useState } from "react";

function readModalOpenFlag() {
    if (typeof document === "undefined") return false;

    return document.documentElement.getAttribute("data-modal-open") === "true";
}

function useModalOpenFlag() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (typeof document === "undefined" || typeof MutationObserver === "undefined") {
            return;
        }

        const root = document.documentElement;
        const syncModalFlag = () => setIsModalOpen(readModalOpenFlag());

        syncModalFlag();

        const observer = new MutationObserver(syncModalFlag);
        observer.observe(root, { attributes: true, attributeFilter: ["data-modal-open"] });

        return () => observer.disconnect();
    }, []);

    return isModalOpen;
}

export default useModalOpenFlag;
