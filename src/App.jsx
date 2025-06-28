import About from './components/About'
import Projects from './components/Projects'
import Contact from './components/Contact'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { useEffect } from 'react'


function App() {
  useEffect(() => {
    AOS.init({duration: 1000});
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

      {/* Layout */}
      <div className='relative z-10 py-3 px-20'>
        <About />
        <Projects />
        <Contact />
      </div>
    </div>
  )
}

export default App
