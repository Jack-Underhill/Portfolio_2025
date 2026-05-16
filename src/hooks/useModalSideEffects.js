import { useEffect, useRef } from "react";

function useModalSideEffects({ isOpen, onClose } = {}) {
  const closeBtnRef = useRef(null);
  const lastActiveElRef = useRef(null);

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return undefined;

    const root = document.documentElement;
    const prevModalOpen = root.getAttribute("data-modal-open");
    root.setAttribute("data-modal-open", "true");

    // Save focus and lock scroll
    lastActiveElRef.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus close button for accessibility
    const focusTimer = window.setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 0);

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;

      // Restore focus
      const el = lastActiveElRef.current;
      if (el && typeof el.focus === "function") el.focus();

      if (prevModalOpen === null) root.removeAttribute("data-modal-open");
      else root.setAttribute("data-modal-open", prevModalOpen);
    };
  }, [isOpen, onClose]);

  return { closeBtnRef };
}

export default useModalSideEffects;
