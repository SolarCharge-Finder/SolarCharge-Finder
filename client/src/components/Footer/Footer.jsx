import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="logo-icon">☀️</span>
              <span>
                SolarCharge <span className="logo-accent">Finder</span>
              </span>
            </Link>
            <p className="footer-tagline">
              Making solar-powered charging accessible for everyone. Find, rate, and share clean
              energy stations worldwide.
            </p>
          </div>

          <div className="footer-links-group">
            <div className="footer-col">
              <h4>Platform</h4>
              <a href="/search">Find Stations</a>
              <a href="#cta">Share Station</a>
              <a href="#features">Features</a>
            </div>
            <div className="footer-col">
              <h4>Resources</h4>
              <a href="#" rel="noopener noreferrer">
                LinkedIn
              </a>
              <a href="/about-us">About</a>
              <a href="#" rel="noopener noreferrer">
                Blog
              </a>
            </div>
            <div className="footer-col">
              <h4>Connect</h4>
              <a href="#" rel="noopener noreferrer">
                Facebook
              </a>
              <a href="#" rel="noopener noreferrer">
                Twitter
              </a>
              <a href="#" rel="noopener noreferrer">
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} SolarCharge Finder. Built for a sustainable future.</p>
          <div className="footer-bottom-links">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
