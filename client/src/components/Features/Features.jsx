const features = [
  {
    icon: '☀️',
    title: 'Eco-Friendly Energy',
    desc: 'All listed stations are powered by solar panels, reducing your carbon footprint with every charge.',
    color: '#22c55e',
    bg: '#f0fdf4',
  },
  {
    icon: '🤝',
    title: 'Community Sharing',
    desc: 'Users can add, review, and rate stations — building a trusted network of solar charging spots.',
    color: '#f59e0b',
    bg: '#fefce8',
  },
  {
    icon: '📡',
    title: 'Real-Time Availability',
    desc: 'See which stations are available right now with live status updates and usage data.',
    color: '#3b82f6',
    bg: '#eff6ff',
  },
  {
    icon: '📱',
    title: 'Mobile Friendly',
    desc: 'Access the platform from any device. Find and navigate to stations on the go.',
    color: '#8b5cf6',
    bg: '#f5f3ff',
  },
  {
    icon: '💰',
    title: 'Affordable Charging',
    desc: 'Solar stations offer some of the lowest charging rates. Save money while saving the planet.',
    color: '#10b981',
    bg: '#ecfdf5',
  },
  {
    icon: '🔒',
    title: 'Trusted Reviews',
    desc: 'Every rating is from a verified user. Make informed decisions based on real experiences.',
    color: '#ef4444',
    bg: '#fef2f2',
  },
];

function Features() {
  return (
    <section className="features-section" id="features">
      <div className="features-container">
        <div className="section-header">
          <span className="section-tag">✨ Why Choose Us</span>
          <h2 className="section-title">Built for a Sustainable Future</h2>
          <p className="section-desc">
            Everything you need to find, use, and share solar-powered charging infrastructure.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div
                className="feature-icon"
                style={{ background: feature.bg }}
              >
                <span>{feature.icon}</span>
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
