import { useState } from 'react'
import './App.css'
import { HashRouter as Router } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import AppRoutes from './components/AppRoutes.jsx'
 
function App() {

  return (
    <>
      <Router>
        <Navbar />
        <AppRoutes />
      </Router>
    </>
  )
}

export default App
