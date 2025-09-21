import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={() => setIsOpen(false)}>
          <span className="nav-logo-icon">✈️</span>
          <span className="nav-logo-text">DreamTrip AI</span>
        </Link>

        <div className={`nav-menu ${isOpen ? 'nav-menu-active' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>
            Home
          </Link>
          <Link to="/destinations" className="nav-link" onClick={() => setIsOpen(false)}>
            Destinations
          </Link>
          
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link" onClick={() => setIsOpen(false)}>
                Dashboard
              </Link>
              <Link to="/plan-trip" className="nav-link" onClick={() => setIsOpen(false)}>
                Plan Trip
              </Link>
              <div className="nav-user">
                <span className="nav-user-greeting">Hello, {user.username}</span>
                <button onClick={handleLogout} className="nav-logout-btn">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={() => setIsOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="nav-link nav-cta" onClick={() => setIsOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </div>

        <div className="nav-toggle" onClick={() => setIsOpen(!isOpen)}>
          <span className={`nav-toggle-bar ${isOpen ? 'nav-toggle-bar-active' : ''}`}></span>
          <span className={`nav-toggle-bar ${isOpen ? 'nav-toggle-bar-active' : ''}`}></span>
          <span className={`nav-toggle-bar ${isOpen ? 'nav-toggle-bar-active' : ''}`}></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;