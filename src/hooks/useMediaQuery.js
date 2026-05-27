import { useEffect, useState } from 'react';

function cannotUseMediaQuery(query) {
  return (
    typeof window === 'undefined'
    || typeof window.matchMedia !== 'function'
    || !query
  );
}

export function getMediaQueryMatch(query) {
  if (cannotUseMediaQuery(query)) {
    return false;
  }

  return window.matchMedia(query).matches;
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => getMediaQueryMatch(query));

  useEffect(() => {
    if (cannotUseMediaQuery(query)) {
      setMatches(false);
      return undefined;
    }

    const mediaQuery = window.matchMedia(query);
    const updateMatch = () => setMatches(mediaQuery.matches);

    updateMatch();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateMatch);
      return () => mediaQuery.removeEventListener('change', updateMatch);
    }

    mediaQuery.addListener(updateMatch);
    return () => mediaQuery.removeListener(updateMatch);
  }, [query]);

  return matches;
}

export default useMediaQuery;
