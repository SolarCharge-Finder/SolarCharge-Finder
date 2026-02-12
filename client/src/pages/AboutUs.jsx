import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';

function AboutUs() {
  return (
    <div className="page-layout">
      <Navbar />
      <main className="page-content">
        <div className="content-container">
          <h1 className="page-title">About Us</h1>
          
          <p className="page-intro">
            We are a technology-driven platform dedicated to promoting clean energy and sustainable transportation. Our mission is to make solar-powered vehicle charging simple, accessible, and reliable for everyone.
          </p>

          <section>
            <h2 className="section-heading">
              <span className="section-icon">🎯</span>
              Our Mission
            </h2>
            <p className="content-text">
              By combining smart location-based services with secure online payments, we help users easily find and utilize solar-powered charging infrastructure. We believe sustainability should be easy, transparent, and user-friendly.
            </p>
            <div className="highlight-box">
              <p>Together, we&#39;re powering the future—cleanly and efficiently ⚡🌍</p>
            </div>
          </section>

          <section>
            <h2 className="section-heading">
              <span className="section-icon">✨</span>
              What We Offer
            </h2>
            <ul className="content-list">
              <li>Easily find the nearest solar charging station</li>
              <li>Charge your vehicles conveniently</li>
              <li>Complete payments digitally and securely</li>
              <li>Receive instant payment slips</li>
              <li>Share experiences through reviews and ratings</li>
              <li>Track your environmental impact</li>
            </ul>
          </section>

          <section>
            <h2 className="section-heading">
              <span className="section-icon">🌱</span>
              Our Values
            </h2>
            <p className="content-text">
              Our platform is built with a focus on:
            </p>
            <ul className="content-list">
              <li><strong>Innovation</strong> - Leveraging technology for sustainable solutions</li>
              <li><strong>Environmental Responsibility</strong> - Promoting clean energy adoption</li>
              <li><strong>Customer Satisfaction</strong> - Delivering reliable and user-friendly services</li>
              <li><strong>Community</strong> - Building a network of eco-conscious users</li>
              <li><strong>Transparency</strong> - Open and honest communication</li>
            </ul>
          </section>

          <section>
            <h2 className="section-heading">
              <span className="section-icon">🚀</span>
              Why Choose Us
            </h2>
            <p className="content-text">
              We&#39;re more than just a charging station finder. We&#39;re a community of environmentally conscious individuals working together to make clean energy accessible to everyone. Our platform combines cutting-edge technology with a passion for sustainability to create a seamless user experience.
            </p>
          </section>

          <section>
            <h2 className="section-heading">
              <span className="section-icon">📞</span>
              Join Our Mission
            </h2>
            <p className="content-text">
              Whether you&#39;re an EV owner, a student, a traveler, or simply someone who cares about the environment, you&#39;re welcome to join our growing community. Help us build a sustainable future, one charge at a time.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default AboutUs;
