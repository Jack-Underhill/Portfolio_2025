import { useEffect, useState } from 'react';

function resolveInitialData(initialData) {
  return typeof initialData === 'function' ? initialData() : initialData;
}

function usePublicResource({
  load,
  initialData = null,
  merge,
  transform,
  label = 'PublicResource',
  enabled = true,
} = {}) {
  const [data, setData] = useState(() => resolveInitialData(initialData));
  const [isLoading, setIsLoading] = useState(() => Boolean(enabled && load));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled || typeof load !== 'function') {
      setIsLoading(false);
      return undefined;
    }

    let isMounted = true;

    setIsLoading(true);
    setError(null);

    (async () => {
      try {
        const result = await load();
        if (!isMounted || result == null) return;

        setData((previous) => {
          const transformed = transform ? transform(result) : result;
          const nextData = merge ? merge(transformed, previous) : transformed;

          return nextData ?? previous;
        });
      } catch (err) {
        if (!isMounted) return;

        setError(err);
        if (label) {
          console.error(`[${label}] Failed to load public resource:`, err);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [enabled, label, load, merge, transform]);

  return { data, isLoading, error };
}

export default usePublicResource;
