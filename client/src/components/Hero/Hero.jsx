import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { FiSun, FiMap, FiMapPin } from 'react-icons/fi';

const heroSlides = [
  '/herosection/1.jpeg',
  '/herosection/2.jpeg',
  '/herosection/3.jpg',
  '/herosection/4.jpeg',
  '/herosection/5.jpg',
];

// Animated count-up hook
function useCountUp(target, duration = 1800) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const numericTarget = parseFloat(target.replace(/[^0-9.]/g, ''));
    const suffix = target.replace(/[0-9.,]/g, '');
    let start = null;
    const step = timestamp => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.floor(eased * numericTarget) + suffix);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value || '0';
}

function StatItem({ number, label }) {
  const count = useCountUp(number);
  return (
    <div className="stat">
      <span className="stat-number">{count}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

StatItem.propTypes = {
  number: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = heroSlides.length;

  useEffect(() => {
    if (totalSlides === 0) return undefined;
    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(slideInterval);
  }, [totalSlides]);

  // Generate particle positions once
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    width: `${Math.random() * 4 + 2}px`,
    height: `${Math.random() * 4 + 2}px`,
    delay: `${Math.random() * 12}s`,
    duration: `${8 + Math.random() * 10}s`,
    opacity: Math.random() * 0.5 + 0.1,
  }));

  return (
    <section className="hero" id="hero">
      <div className="hero-bg-media" aria-hidden="true">
        {heroSlides.map((image, index) => (
          <div
            key={image}
            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
        <div className="hero-bg-overlay" />
      </div>

      {/* Floating particles */}
      <div className="hero-particles" aria-hidden="true">
        {particles.map(p => (
          <div
            key={p.id}
            className="hero-particle"
            style={{
              left: p.left,
              bottom: '-10px',
              width: p.width,
              height: p.height,
              opacity: p.opacity,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      <div className="hero-container">
        <div className="hero-badge">
          <FiSun aria-hidden="true" />
          <span>Clean Energy Initiative</span>
        </div>

        <h1 className="hero-title">
          Find <span className="highlight-green">Solar Powered</span> Charging
          <br />
          Stations Near You
        </h1>

        <p className="hero-subtitle">
          Discover affordable, eco friendly charging stations powered by the sun. Join our community
          of environmentally conscious users sharing clean energy solutions.
        </p>

        <div className="hero-stats">
          <StatItem number="1200+" label="Stations Listed" />
          <StatItem number="50+" label="Cities Covered" />
          <StatItem number="10000+" label="Happy Users" />
        </div>

        <div className="hero-cta-group">
          <a href="/search" className="btn-primary">
            <FiMap aria-hidden="true" />
            <span>Explore Stations</span>
          </a>
          <a href="#map" className="btn-secondary">
            <FiMapPin aria-hidden="true" />
            <span>View Map</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default Hero;
