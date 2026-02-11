import { useEffect, useState } from "react";

const heroSlides = [
  "/herosection/1.jpeg",
  "/herosection/2.jpeg",
  "/herosection/3.jpg",
  "/herosection/4.jpeg",
  "/herosection/5.jpg",
];

function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = heroSlides.length;

  useEffect(() => {
    if (totalSlides === 0) return undefined;

    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);

    return () => clearInterval(slideInterval);
  }, [totalSlides]);

  return (
    <section className="hero" id="hero">
      <div className="hero-bg-media" aria-hidden="true">
        {heroSlides.map((image, index) => (
          <div
            key={image}
            className={`hero-slide ${index === currentSlide ? "active" : ""}`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
        <div className="hero-bg-overlay"></div>
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
