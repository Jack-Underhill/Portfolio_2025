import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "summary",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function getFocusableElements(root) {
  if (!root) return [];

  return Array.from(root.querySelectorAll(FOCUSABLE_SELECTOR)).filter((el) => {
    if (el.getAttribute("aria-hidden") === "true") return false;
    if (el.hasAttribute("disabled")) return false;

    return el.getClientRects().length > 0;
  });
}

function useModalSideEffects({ isOpen, onClose, shouldRestoreFocusOnClose = true } = {}) {
  const initialFocusRef = useRef(null);
  const closeBtnRef = useRef(null);
  const lastActiveElRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return undefined;

    const root = document.documentElement;
    const prevModalOpen = root.getAttribute("data-modal-open");
    root.setAttribute("data-modal-open", "true");

    // Save focus and lock scroll
    lastActiveElRef.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus the first primary modal action when available, with close as the fallback.
    const focusTimer = window.setTimeout(() => {
      const initialTarget = initialFocusRef.current || closeBtnRef.current;
      initialTarget?.focus();
    }, 0);

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
        return;
      }

      if (e.key !== "Tab") return;

      const focusableEls = getFocusableElements(modalRef.current);
      if (!focusableEls.length) {
        e.preventDefault();
        return;
      }

      const firstEl = focusableEls[0];
      const lastEl = focusableEls[focusableEls.length - 1];
      const activeEl = document.activeElement;
      const isFocusInsideModal = modalRef.current?.contains(activeEl);

      if (!isFocusInsideModal) {
        e.preventDefault();
        if (e.shiftKey) lastEl.focus();
        else firstEl.focus();
        return;
      }

      if (e.shiftKey && activeEl === firstEl) {
        e.preventDefault();
        lastEl.focus();
        return;
      }

      if (!e.shiftKey && activeEl === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;

      // Restore focus
      const el = lastActiveElRef.current;
      if (
        shouldRestoreFocusOnClose
        && el
        && document.contains(el)
        && typeof el.focus === "function"
      ) {
        el.focus();
      }

      if (prevModalOpen === null) root.removeAttribute("data-modal-open");
      else root.setAttribute("data-modal-open", prevModalOpen);
    };
  }, [isOpen, onClose, shouldRestoreFocusOnClose]);

  return { closeBtnRef, initialFocusRef, modalRef };
}

export default useModalSideEffects;
