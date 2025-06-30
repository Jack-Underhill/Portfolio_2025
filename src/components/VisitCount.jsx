import { useEffect, useState } from 'react';

import clicks from '../assets/clicks.svg'

function VisitCount() {
  const [visitCount, setVisitCount] = useState(null);

  useEffect(() => {
    fetch('/.netlify/functions/track-visit')
    .then(res => res.json())
    .then(data => {
      setVisitCount(data.count);
      console.log(data.count);
    });
  }, []);

  return (
      <div 
        className="w-fit h-full flex gap-2 items-center group" 
        title='User Visit Count' 
        data-aos="flip-up"
      >
        <img 
            src={clicks} 
            alt={`View svg`}
            className='h-full group-hover:animate-spin' 
        />
        <div className='text-md font-semibold text-emerald-50'>
          {visitCount !== null ? `${visitCount} views` : 'Loading ...'}
        </div>
      </div>
  );
}

export default VisitCount;