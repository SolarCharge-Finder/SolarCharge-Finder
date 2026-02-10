import Navbar from '../components/Navbar/Navbar';
import Hero from '../components/Hero/Hero';
import SearchBar from '../components/SearchBar/SearchBar';
import MapSection from '../components/MapSection/MapSection';
import Features from '../components/Features/Features';
import CallToAction from '../components/CallToAction/CallToAction';
import Footer from '../components/Footer/Footer';

function Home() {
  return (
    <div className="home-page">
      <Navbar />
      <Hero />
      <SearchBar />
      <MapSection />
      <Features />
      <CallToAction />
      <Footer />
    </div>
  );
}

export default Home;
