function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      <div className="hero-container">
        <div className="hero-badge">🌱 Clean Energy Initiative</div>
        <h1 className="hero-title">
          Find <span className="highlight-green">Solar-Powered</span> Charging
          <br />
          Stations Near You
        </h1>
        <p className="hero-subtitle">
          Discover affordable, eco-friendly charging stations powered by the sun.
          Join our community of environmentally conscious users sharing clean energy solutions.
        </p>
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-number">1,200+</span>
            <span className="stat-label">Stations Listed</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat">
            <span className="stat-number">50+</span>
            <span className="stat-label">Cities Covered</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat">
            <span className="stat-number">10K+</span>
            <span className="stat-label">Happy Users</span>
          </div>
        </div>
        <div className="hero-cta-group">
          <a href="#map" className="btn-primary">
            <span>🗺️</span> Explore Stations
          </a>
          
        </div>
      </div>
    </section>
  );
}

export default Hero;
