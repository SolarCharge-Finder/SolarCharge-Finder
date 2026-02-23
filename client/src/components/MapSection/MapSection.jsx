//import StationCard from '../StationCard/StationCard';
import { useEffect, useState } from 'react';
import SearchResults from '../SearchBar/SearchResults';
import { getTopRatedStations } from '../../services/stationService';

const sampleStations = [
  {
    id: 1,
    name: 'Downtown Solar Hub',
    location: '123 Main St, New York, NY',
    chargerType: 'Level 2',
    rating: 4.5,
    reviews: 128,
    available: true,
    lat: 40.7128,
    lng: -74.006,
  },
  {
    id: 2,
    name: 'Green Valley Charger',
    location: '456 Oak Ave, Brooklyn, NY',
    chargerType: 'DC Fast',
    rating: 4.8,
    reviews: 95,
    available: true,
    lat: 40.6782,
    lng: -73.9442,
  },
  {
    id: 3,
    name: 'SunPower Station #12',
    location: '789 Park Blvd, Queens, NY',
    chargerType: 'Level 1',
    rating: 4.2,
    reviews: 64,
    available: false,
    lat: 40.7282,
    lng: -73.7949,
  },
  {
    id: 4,
    name: 'EcoCharge Campus',
    location: '321 University Dr, Manhattan, NY',
    chargerType: 'Level 2',
    rating: 4.7,
    reviews: 201,
    available: true,
    lat: 40.7831,
    lng: -73.9712,
  },
  {
    id: 5,
    name: 'Solar Grid Point',
    location: '555 Riverside Way, Hoboken, NJ',
    chargerType: 'DC Fast',
    rating: 4.0,
    reviews: 42,
    available: true,
    lat: 40.744,
    lng: -74.0324,
  },
  {
    id: 6,
    name: 'CleanWatt Station',
    location: '900 Harbor Ln, Jersey City, NJ',
    chargerType: 'Level 2',
    rating: 4.6,
    reviews: 87,
    available: false,
    lat: 40.7178,
    lng: -74.0431,
  },
];

function MapSection() {

  const [stations, setStations] = useState([]);
  const [sortOption, setSortOption] = useState('rating');
  const [error, setError] = useState(null);

  const fetchTopRatedStations = async () => {
    try {
      const data = await getTopRatedStations();
      setStations(data);
    } catch (err) {
      console.error("Error fetching top rated stations:", err);
      setError(err);
    } 
  };

  useEffect(() => {
    if (sortOption === 'rating') {
      fetchTopRatedStations();
    }
  }, [sortOption]);

  return (
    <section className="map-section" id="map">
      <div className="map-container">
        <div className="section-header">
          <span className="section-tag">📍 Nearby Stations</span>
          <h2 className="section-title">Explore Solar Charging Stations</h2>
          <p className="section-desc">
            Browse the map or scroll through the station cards to find the perfect charging spot.
          </p>
        </div>

        <div className="map-content">
          <div className="map-view">
            <div className="map-placeholder">
              <div className="map-placeholder-inner">
                <div className="map-grid">
                  {/* Simulated map with pin markers */}
                  {sampleStations.map((station) => (
                    <div
                      key={station.id}
                      className={`map-pin ${station.available ? 'pin-available' : 'pin-busy'}`}
                      style={{
                        left: `${15 + ((station.id - 1) % 3) * 30}%`,
                        top: `${20 + Math.floor((station.id - 1) / 3) * 40}%`,
                      }}
                      title={station.name}
                    >
                      <div className="pin-dot"></div>
                      <div className="pin-label">{station.name.split(' ')[0]}</div>
                    </div>
                  ))}
                </div>
                <div className="map-overlay-text">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <p>Interactive map loads here</p>
                  <span>Integrate with Google Maps or Leaflet.js</span>
                </div>
              </div>
            </div>
          </div>

          <div className="station-list">
            <div className="list-header">
              <h3>{sampleStations.length} stations found</h3>
              <select className="sort-select" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                <option value="rating">Sort by Rating</option>
                <option value="distance">Sort by Distance</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
            <div className="cards-scroll">
              {error ? (
                <p className="no-results">Failed to load stations</p>
              ) : stations.length === 0 ? (
                <p className="no-results">No stations found. Try adjusting your search criteria.</p>
              ) : (
                <SearchResults stations={stations} error={error} /> 
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MapSection;
