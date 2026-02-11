import { useState } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <span className="logo-icon">☀️</span>
          <span className="logo-text">SolarCharge <span className="logo-accent">Finder</span></span>
        </Link>

        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          <span className={`hamburger ${menuOpen ? 'open' : ''}`}></span>
        </button>

        <ul className={`navbar-links ${menuOpen ? 'active' : ''}`}>
          <li><a href="/">Home</a></li>
          <li><a href="#map">Map</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#cta">Contribute</a></li>
        </ul>

        <div className="navbar-actions">
          <Link to="/auth" className="btn-signin" onClick={() => setMenuOpen(false)}>
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
