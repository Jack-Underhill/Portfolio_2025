import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

function useAutoTextarea({ value, minRows = 1 } = {}) {
  const ref = useRef(null);

  const syncHeight = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    el.style.height = 'auto';

    const styles = window.getComputedStyle(el);
    const lineHeight = parseFloat(styles.lineHeight) || 20;
    const paddingTop = parseFloat(styles.paddingTop) || 0;
    const paddingBottom = parseFloat(styles.paddingBottom) || 0;

    const minHeight = lineHeight * minRows + paddingTop + paddingBottom;
    el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`;
  }, [minRows]);

  // Recalc when content changes
  useLayoutEffect(() => {
    syncHeight();
  }, [value, syncHeight]);

  // Recalc when wrapping changes (window/container resize)
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    // Watch actual element size changes (best)
    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => syncHeight());
      resizeObserver.observe(el);
    }

    // Fallback / extra safety
    const handleWindowResize = () => syncHeight();
    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [syncHeight]);

  return ref;
}

export default useAutoTextarea;
