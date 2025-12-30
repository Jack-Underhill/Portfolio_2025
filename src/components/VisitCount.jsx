import { useEffect, useState } from 'react';

import views from '../assets/views.svg'

function VisitCount() {
  const [visitCount, setVisitCount] = useState(null);

  const isLoading = () => visitCount === null;

  useEffect(() => {
    fetch('/.netlify/functions/track-visit')
    .then(res => res.json())
    .then(data => {
      setVisitCount(data.count);
    });
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
          {isLoading() ? 'Loading ...' : `${visitCount} views`}
        </div>
      </div>
  );
}

export default VisitCount;