import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';

function Privacy() {
  return (
    <div className="page-layout">
      <Navbar />
      <main className="page-content">
        <div className="content-container">
          <h1 className="page-title">Privacy Policy</h1>
          
          <p className="page-intro">
            We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our website and services.
          </p>

          <section>
            <h2 className="section-heading">
              <span className="section-icon">📊</span>
              Information We Collect
            </h2>
            <p className="content-text">We may collect the following information:</p>
            <ul className="content-list">
              <li>Personal details such as name, email address, and contact number</li>
              <li>Location data to help find nearby charging stations</li>
              <li>Payment-related information (processed securely via trusted payment gateways)</li>
              <li>User-generated content such as reviews and ratings</li>
              <li>Device and usage data for performance and security purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="section-heading">
              <span className="section-icon">🎯</span>
              How We Use Your Information
            </h2>
            <p className="content-text">Your information is used to:</p>
            <ul className="content-list">
              <li>Provide and improve our services</li>
              <li>Help you locate nearby solar charging stations</li>
              <li>Process payments and generate digital receipts</li>
              <li>Display user reviews and ratings</li>
              <li>Enhance security and prevent fraudulent activities</li>
              <li>Communicate important updates and notifications</li>
            </ul>
          </section>

          <section>
            <h2 className="section-heading">
              <span className="section-icon">🔒</span>
              Data Security
            </h2>
            <p className="content-text">
              We implement appropriate technical and organizational measures to protect your data. Sensitive information such as payment details is encrypted and handled by secure third-party providers.
            </p>
            <div className="highlight-box">
              <p>Your data is encrypted using industry-standard SSL/TLS technology to ensure maximum security.</p>
            </div>
          </section>

          <section>
            <h2 className="section-heading">
              <span className="section-icon">🤝</span>
              Sharing of Information
            </h2>
            <p className="content-text">
              We do not sell or rent your personal data. Information may only be shared with trusted service providers when necessary to deliver our services or comply with legal requirements.
            </p>
          </section>

          <section>
            <h2 className="section-heading">
              <span className="section-icon">✅</span>
              Your Rights
            </h2>
            <p className="content-text">
              You have the right to access, update, or request deletion of your personal data. You may also opt out of non-essential communications at any time.
            </p>
            <ul className="content-list">
              <li>Access your personal information</li>
              <li>Request data correction or deletion</li>
              <li>Opt out of marketing communications</li>
              <li>Export your data in a portable format</li>
            </ul>
          </section>

          <section>
            <h2 className="section-heading">
              <span className="section-icon">🔄</span>
              Changes to This Policy
            </h2>
            <p className="content-text">
              We may update this Privacy Policy occasionally. Any changes will be posted on this page with an updated revision date.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Privacy;
