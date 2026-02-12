import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';

function Terms() {
  return (
    <div className="page-layout">
      <Navbar />
      <main className="page-content">
        <div className="content-container">
          <h1 className="page-title">Terms and Conditions</h1>
          
          <p className="page-intro">
            By accessing or using our website and services, you agree to comply with the following Terms and Conditions. Please read them carefully.
          </p>

          <section>
            <h2 className="section-heading">
              <span className="section-icon">📋</span>
              Use of the Platform
            </h2>
            <ul className="content-list">
              <li>You must be at least 18 years old to use this service</li>
              <li>You agree to provide accurate and up-to-date information</li>
              <li>You are responsible for maintaining the confidentiality of your account</li>
            </ul>
          </section>

          <section>
            <h2 className="section-heading">
              <span className="section-icon">⚡</span>
              Services
            </h2>
            <p className="content-text">
              Our platform allows users to:
            </p>
            <ul className="content-list">
              <li>Search for nearby solar-powered charging stations</li>
              <li>View availability and pricing</li>
              <li>Make secure online payments</li>
              <li>Receive digital payment slips</li>
              <li>Share reviews and ratings</li>
            </ul>
            <div className="highlight-box">
              <p>Service availability may vary based on location and technical limitations.</p>
            </div>
          </section>

          <section>
            <h2 className="section-heading">
              <span className="section-icon">💳</span>
              Payments
            </h2>
            <p className="content-text">
              All payments are processed through secure third-party payment providers. We are not responsible for issues caused by external payment gateways.
            </p>
          </section>

          <section>
            <h2 className="section-heading">
              <span className="section-icon">✍️</span>
              User Content
            </h2>
            <p className="content-text">
              By submitting reviews, ratings, or other content, you grant us permission to display and use this content on our platform. Content must not be abusive, misleading, or violate any laws.
            </p>
          </section>

          <section>
            <h2 className="section-heading">
              <span className="section-icon">⚠️</span>
              Limitation of Liability
            </h2>
            <p className="content-text">We are not liable for:</p>
            <ul className="content-list">
              <li>Temporary service interruptions</li>
              <li>Inaccurate location data due to external factors</li>
              <li>Losses resulting from misuse of the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="section-heading">
              <span className="section-icon">🔄</span>
              Modifications
            </h2>
            <p className="content-text">
              We reserve the right to update these Terms at any time. Continued use of the platform means you accept the revised terms.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Terms;
