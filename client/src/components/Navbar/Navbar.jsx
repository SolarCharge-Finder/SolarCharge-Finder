import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../../context/useAuth'
import './Navbar.css'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user } = useAuth()

  const userMeta = useMemo(() => {
    if (!user) {
      return null
    }
    const role = user.role?.toLowerCase()
    const displayName = (user.name && user.name.trim()) || user.email?.split('@')[0] || 'Profile'
    const initial = displayName.charAt(0).toUpperCase()
    const target = role === 'admin' ? '/admin' : '/user'

    return { displayName, initial, target }
  }, [user])

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
          {userMeta ? (
            <Link
              to={userMeta.target}
              className="navbar-user-link"
              onClick={() => setMenuOpen(false)}
            >
              <span className="navbar-user-link__avatar" aria-hidden="true">
                {userMeta.initial}
              </span>
              <span className="navbar-user-link__name">{userMeta.displayName}</span>
            </Link>
          ) : (
            <Link to="/auth" className="btn-signin" onClick={() => setMenuOpen(false)}>
              Sign Up
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
