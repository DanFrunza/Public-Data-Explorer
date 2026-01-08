import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "../css/Navbar.css";
import logo from '../assets/DF.svg';
import { FaUserCircle, FaChevronDown } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { selectIsAuthenticated, selectUser } from "../store/slices/authSlice";
import { logout } from "../store/slices/authSlice";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
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
          <NavLink to="/faq">FAQ</NavLink>
        </li>
        <li className="user-dropdown">
          <button
            type="button"
            className="user-btn"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen(o => !o)}
          >
            {user?.avatar_url ? (
              <img className="user-avatar" src={user.avatar_url} alt="User avatar" />
            ) : (
              <FaUserCircle className="user-icon" />
            )}
            {isAuth && (
              <span className="user-greeting">Hello, {user?.first_name || user?.firstname || user?.email || 'User'}</span>
            )}
            <FaChevronDown className={`arrow ${open ? "open" : ""}`} />
          </button>
          {open && (
            <div className="dropdown-menu">
              {isAuth ? (
                <>
                  <span style={{ padding: "10px 14px", display: "block" }}>
                  </span>
                  <Link to="/profile" onClick={() => setOpen(false)}>
                    Profile
                  </Link>
                  <Link to="/" onClick={() => { setOpen(false); dispatch(logout()); }}>
                    Logout
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)}>
                    Login
                  </Link>
                </>
              )}
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;