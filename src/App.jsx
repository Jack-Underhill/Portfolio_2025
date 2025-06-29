import { useEffect, useState } from 'react'

import AOS from 'aos'
import 'aos/dist/aos.css'

import About from './components/About'
import Projects from './components/Projects'
import Contact from './components/Contact'

import clicks from './assets/clicks.svg'

function App() {
  const [visitCount, setVisitCount] = useState(null);

  useEffect(() => {
    AOS.init({duration: 1000});
  }, []);

  useEffect(() => {
    fetch('/.netlify/functions/track-visit')
    .then(res => res.json())
    .then(data => {
      setVisitCount(data.count);
      console.log(data.count);
    });
  }, []);

  return (
    <div className='relative w-full h-full'>
      {/* Background gradient + linen noise */}
      <div 
        className='pointer-events-none fixed inset-0 z-0 bg-blend-soft bg-cover opacity-100'
        style={{
          backgroundImage: `radial-gradient(circle at 72% 50%, rgba(56,189,248,0.35) 0%, rgba(56,189,248,0.15) 40%, transparent 90%), url('/black-linen.png')`
        }}
      />

      {/* View Count */}
      <div 
        className="m-3 sm:m-5 h-10 flex gap-2 items-center" 
        title='User Visit Count' 
        data-aos="flip-up"
      >
          <img 
              src={clicks} 
              alt={`View svg`}
              className='h-full hover:animate-spin' 
          />
          <div className='text-md font-semibold text-emerald-50'>
            {visitCount !== null ? `${visitCount} views` : 'Loading ...'}
          </div>
        </div>

      {/* Layout */}
      <div className='relative z-10 flex flex-col gap-30 sm:gap-35 lg:gap-0 px-10 sm:px-20 pb-40 pt-25 sm:pt-35 md:pt-25 lg:pt-0'>
        <About />
        <Projects />
        <Contact />
      </div>
    </div>
  )
}

export default App
