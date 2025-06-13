import { useState } from 'react'

import About from './components/About'
import Projects from './components/Projects'
import Contact from './components/Contact'

import './App.css'

function App() {
  return (
    <div className="justify-items-center">
      <About />
      <Projects />
      <Contact />
    </div>
  )
}

export default App
