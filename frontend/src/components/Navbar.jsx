import React from "react";
import { Link, NavLink } from "react-router-dom";
import "../css/Navbar.css";
import logo from '../assets/DF.svg';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
            <img id="logo" src={logo} alt="Logo"></img>
            <span className="logo-text">Public Data Explorer</span>
        </Link>
      </div>
      <ul className="navbar-links">
        <li>
          <NavLink to="/" end>Home</NavLink>
        </li>
        <li>
          <NavLink to="/dashboard">Dashboard</NavLink>
        </li>
        <li>
          <NavLink to="/plans">Plans</NavLink>
        </li>
        <li>
          <NavLink to="/about">About</NavLink>
        </li>
        <li>
          <NavLink to="/login">Login</NavLink>
        </li>
        <li>
          <NavLink to="/register">Register</NavLink>
        </li>
        <li>
          <NavLink to="/faq">FAQ</NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;