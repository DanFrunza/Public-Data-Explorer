import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home.jsx';
import Dashboard from './Dashboard.jsx';
import Plans from './Plans.jsx';
import About from './About.jsx';
import Login from './Login.jsx';
import Register from './Register.jsx';
import FAQ from './FAQ.jsx';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/plans" element={<Plans />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/faq" element={<FAQ />} />
    </Routes>
  );
}

export default AppRoutes;