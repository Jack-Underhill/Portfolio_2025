import { useEffect, useState } from 'react'

import AOS from 'aos'
import 'aos/dist/aos.css'

import VisitCount from './components/VisitCount'
import Navbar from './components/Navbar'
import About from './components/About'
import Projects from './components/Projects'
import Contact from './components/Contact'


function App() {
  useEffect(() => {
    AOS.init({duration: 1000});
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 100);

    return () => clearTimeout(timeout);
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
      
      {/* Top Bar */}
      <div className="m-5 sm:m-10 h-12 flex justify-between">
        <VisitCount />
        <Navbar />
      </div>

      {/* Layout */}
      <div className='relative z-10 flex flex-col gap-30 sm:gap-35 lg:gap-0 px-10 sm:px-20 pb-40 pt-25 sm:pt-35 md:pt-25 lg:pt-0'>
        <About />
        <Projects />
        <Contact />
      </div>
    </div>
  );
}

export default App
