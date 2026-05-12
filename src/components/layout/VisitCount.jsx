import { useEffect, useState } from 'react';

import views from '../../assets/views.svg'

function VisitCount() {
  const [visitCount, setVisitCount] = useState(null);
  const [isUnavailable, setIsUnavailable] = useState(false);

  const isLoading = () => visitCount === null && !isUnavailable;

  useEffect(() => {
    let isMounted = true;

    async function loadVisitCount() {
      try {
        const response = await fetch('/.netlify/functions/track-visit');
        const contentType = response.headers.get('content-type') ?? '';

        if (!contentType.includes('application/json')) {
          if (import.meta.env.DEV && contentType.includes('text/html')) {
            console.warn(
              '[VisitCount] Netlify dev is not running, so the Netlify function track-visit cannot run. Use `netlify dev` instead of plain `npm run dev` to test visit tracking locally.',
            );
          } else {
            console.warn(
              `[VisitCount] Expected JSON from track-visit, received ${contentType || 'an unknown content type'}.`,
            );
          }

          if (isMounted) {
            setIsUnavailable(true);
          }
          return;
        }

        const data = await response.json();

        if (isMounted) {
          setVisitCount(data.count);
        }
      } catch (error) {
        console.warn('[VisitCount] Could not load visit count from track-visit.', error);

        if (isMounted) {
          setIsUnavailable(true);
        }
      }
    }

    loadVisitCount();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
      <div 
        className="w-fit h-full flex gap-2 items-center group" 
        title='User Visit Count' 
        data-aos="flip-up"
      >
        <img 
            src={views} 
            alt={`View svg`}
            className={`h-full ${isLoading() ? 'animate-spin' : 'group-hover:animate-spin'}`} 
        />
        <div className='text-md font-semibold text-emerald-50'>
          {isLoading() ? 'Loading ...' : isUnavailable ? 'Views unavailable' : `${visitCount} views`}
        </div>
      </div>
  );
}

export default VisitCount;
