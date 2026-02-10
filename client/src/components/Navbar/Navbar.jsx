import { useState } from 'react';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a href="/" className="navbar-logo">
          <span className="logo-icon">☀️</span>
          <span className="logo-text">SolarCharge <span className="logo-accent">Finder</span></span>
        </a>

        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          <span className={`hamburger ${menuOpen ? 'open' : ''}`}></span>
        </button>

        <ul className={`navbar-links ${menuOpen ? 'active' : ''}`}>
          <li><a href="#hero">Home</a></li>
          <li><a href="#map">Map</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#cta">Contribute</a></li>
        </ul>

        <div className="navbar-actions">
          <button className="btn-signin">Sign In</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
