import { useEffect, useRef } from 'react';
import {
  FiSun,
  FiUsers,
  FiClock,
  FiSmartphone,
  FiDollarSign,
  FiShield,
  FiZap,
} from 'react-icons/fi';

const features = [
  {
    Icon: FiSun,
    title: 'Eco Friendly Energy',
    desc: 'All listed stations are powered by solar panels, reducing your carbon footprint with every charge.',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.1)',
    accentGradient: 'linear-gradient(90deg, #34d399, #059669)',
  },
  {
    Icon: FiUsers,
    title: 'Community Sharing',
    desc: 'Users can add, review, and rate stations  building a trusted network of solar charging spots.',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.1)',
    accentGradient: 'linear-gradient(90deg, #fbbf24, #d97706)',
  },
  {
    Icon: FiClock,
    title: 'Real-Time Availability',
    desc: 'See which stations are available right now with live status updates and usage data.',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.1)',
    accentGradient: 'linear-gradient(90deg, #60a5fa, #2563eb)',
  },
  {
    Icon: FiSmartphone,
    title: 'Mobile Friendly',
    desc: 'Access the platform from any device. Find and navigate to stations on the go.',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.1)',
    accentGradient: 'linear-gradient(90deg, #a78bfa, #7c3aed)',
  },
  {
    Icon: FiDollarSign,
    title: 'Affordable Charging',
    desc: 'Solar stations offer some of the lowest charging rates. Save money while saving the planet.',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.1)',
    accentGradient: 'linear-gradient(90deg, #34d399, #059669)',
  },
  {
    Icon: FiShield,
    title: 'Trusted Reviews',
    desc: 'Every rating is from a verified user. Make informed decisions based on real experiences.',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
    accentGradient: 'linear-gradient(90deg, #f87171, #dc2626)',
  },
];

function Features() {
  const cardRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    cardRefs.current.forEach(card => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="features-section" id="features">
      <div className="features-container">
        <div className="section-header">
          <span className="section-tag">
            <FiZap aria-hidden="true" />
            Why Choose Us
          </span>
          <h2 className="section-title">Built for a Sustainable Future</h2>
          <p className="section-desc">
            Everything you need to find, use, and share solar powered charging infrastructure.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => {
            const FeatureIcon = feature.Icon;
            return (
              <div
                className="feature-card"
                key={feature.title}
                ref={el => (cardRefs.current[index] = el)}
                style={{
                  transitionDelay: `${index * 80}ms`,
                  '--card-accent': feature.accentGradient,
                }}
              >
                <div
                  className="feature-icon"
                  style={{ background: feature.bg, color: feature.color }}
                >
                  <FeatureIcon aria-hidden="true" />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Features;
