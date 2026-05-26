import { useCallback, useLayoutEffect, useRef, useState } from 'react';

function canUseDOM() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function useMeasuredMaxHeight(measurementKey) {
  const nodesRef = useRef(new Map());
  const callbacksRef = useRef(new Map());
  const observerRef = useRef(null);
  const frameRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState(0);

  const updateMaxHeight = useCallback(() => {
    if (!canUseDOM()) return;

    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;

      const nodes = [...nodesRef.current.values()].filter(Boolean);
      const previousHeights = nodes.map((node) => node.style.height);

      nodes.forEach((node) => {
        node.style.height = '';
      });

      const nextMaxHeight = Math.ceil(
        nodes.reduce((maxHeight, node) => (
          Math.max(maxHeight, node.getBoundingClientRect().height)
        ), 0),
      );

      nodes.forEach((node, index) => {
        node.style.height = previousHeights[index];
      });

      setMaxHeight((currentMaxHeight) => (
        currentMaxHeight === nextMaxHeight ? currentMaxHeight : nextMaxHeight
      ));
    });
  }, []);

  const getMeasuredElementRef = useCallback((key) => {
    if (!callbacksRef.current.has(key)) {
      callbacksRef.current.set(key, (node) => {
        const previousNode = nodesRef.current.get(key);
        if (previousNode && previousNode !== node) {
          observerRef.current?.unobserve(previousNode);
        }

        if (node) {
          nodesRef.current.set(key, node);
          observerRef.current?.observe(node);
        } else {
          nodesRef.current.delete(key);
        }

        updateMaxHeight();
      });
    }

    return callbacksRef.current.get(key);
  }, [updateMaxHeight]);

  useLayoutEffect(() => {
    if (!canUseDOM()) return undefined;

    updateMaxHeight();

    const handleResize = () => updateMaxHeight();
    window.addEventListener('resize', handleResize);

    if (typeof window.ResizeObserver !== 'function') {
      return () => {
        window.removeEventListener('resize', handleResize);
        if (frameRef.current !== null) {
          window.cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
        }
      };
    }

    observerRef.current = new ResizeObserver(updateMaxHeight);
    nodesRef.current.forEach((node) => observerRef.current.observe(node));

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      window.removeEventListener('resize', handleResize);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [measurementKey, updateMaxHeight]);

  return {
    maxHeight,
    getMeasuredElementRef,
  };
}

export default useMeasuredMaxHeight;
