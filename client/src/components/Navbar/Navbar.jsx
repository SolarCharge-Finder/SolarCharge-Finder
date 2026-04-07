import { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import useAuth from '../../context/useAuth';
import './Navbar.css';

function Navbar({ forceSolid = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(forceSolid);
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (forceSolid) {
      setScrolled(true);
      return undefined;
    }

    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [forceSolid]);

  useEffect(() => {
    const readCartCount = () => {
      try {
        const raw = localStorage.getItem('solarMarketplaceCart');
        const items = raw ? JSON.parse(raw) : [];
        const count = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
        setCartCount(count);
      } catch (error) {
        console.error('Failed to read cart count:', error);
        setCartCount(0);
      }
    };

    readCartCount();
    window.addEventListener('cart:updated', readCartCount);
    window.addEventListener('storage', readCartCount);

    return () => {
      window.removeEventListener('cart:updated', readCartCount);
      window.removeEventListener('storage', readCartCount);
    };
  }, []);

  const userMeta = useMemo(() => {
    if (!user) return null;
    const role = user.role?.toLowerCase();
    const displayName = (user.name && user.name.trim()) || user.email?.split('@')[0] || 'Profile';
    const initial = displayName.charAt(0).toUpperCase();
    const target = role === 'admin' ? '/admin' : '/user';
    return { displayName, initial, target };
  }, [user]);

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <span className="logo-icon">☀️</span>
          <span className="logo-text">
            SolarCharge <span className="logo-accent">Finder</span>
          </span>
        </Link>

        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span className={`hamburger ${menuOpen ? 'open' : ''}`} />
        </button>

        <ul className={`navbar-links ${menuOpen ? 'active' : ''}`}>
          <li>
            <a href="/" onClick={() => setMenuOpen(false)}>
              Home
            </a>
          </li>
          <li>
            <a href="#map" onClick={() => setMenuOpen(false)}>
              Map
            </a>
          </li>
          <li>
            <Link to="/shop" onClick={() => setMenuOpen(false)}>
              Shop
            </Link>
          </li>
          <li>
            <a href="#features" onClick={() => setMenuOpen(false)}>
              Features
            </a>
          </li>
          <li>
            <a href="#cta" onClick={() => setMenuOpen(false)}>
              Contribute
            </a>
          </li>
        </ul>

        <div className="navbar-actions">
          <Link to="/shop?cart=open" className="navbar-cart" onClick={() => setMenuOpen(false)}>
            <span className="navbar-cart__icon" aria-hidden="true">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.6 13.5a2 2 0 0 0 2 1.5h9.7a2 2 0 0 0 2-1.5L23 6H6" />
              </svg>
            </span>
            <span className="navbar-cart__badge">{cartCount}</span>
          </Link>
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
              <span>Sign Up</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

Navbar.propTypes = {
  forceSolid: PropTypes.bool,
};

export default Navbar;
