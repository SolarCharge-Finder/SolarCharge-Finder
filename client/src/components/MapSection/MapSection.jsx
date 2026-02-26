//import StationCard from '../StationCard/StationCard';
import { useEffect, useState, useCallback } from 'react';
import SearchResults from '../SearchBar/SearchResults';
import MapView from "../map/MapView";
import { getTopRatedStations, nearbyStations } from '../../services/stationService';
import useGeolocation from '../../hooks/useGeoLocation';

function MapSection() {

  const [stations, setStations] = useState([]);
  const [sortOption, setSortOption] = useState('rating');
  const [error, setError] = useState(null);

  const { geolocation, loading, getLocation } = useGeolocation();

  //Fetch 5 highest rated stations - stations/top-rated api endpoint 
  const fetchTopRatedStations = useCallback(async () => {
    try {
      const data = await getTopRatedStations();
      setStations(data);
    } catch (err) {
      console.error("Error fetching top rated stations:", err);
      setError(err.message);
    }
  }, []);

  const fetchNearbyStations = useCallback(async () => {
    if (!geolocation) return;
    try { 
      const maxDistance = 50000; //in meters
      const limit = 5; 
      const data = await nearbyStations(geolocation, maxDistance, limit);
      setStations(data);
    } catch (err) {
      console.error("Error fetching neraby stations:", err);
      setError(err.message);
    }
  }, [geolocation]);

  useEffect(() => {
    getLocation(); //get the location on page mount 
  }, [getLocation]);

  //handle sort options - rating, distance
  useEffect(() => {
    if (sortOption === 'distance' && geolocation) {
      fetchNearbyStations();
    } else if (sortOption === 'rating') {
      fetchTopRatedStations();
    }
  }, [sortOption, fetchNearbyStations, fetchTopRatedStations, geolocation]);

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
          <div className='map-view'>
            <MapView stations={stations} userLocation={geolocation} loadingLocation={loading}/>
          </div>
          <div className="station-list">
            <div className="list-header">
              <h3>{stations.length} stations found</h3>
              <select className="sort-select" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                <option value="distance">Sort by Distance</option>
                <option value="rating">Sort by Rating</option>
              </select>
            </div>
            <div className="cards-scroll">
              {error ? (
                <p className="no-results">Failed to load stations</p>
              ) : stations.length === 0 ? (
                <p className="no-results">No stations found. Try adjusting your search criteria.</p>
              ) : (
                <SearchResults stations={stations} error={error} userLocation={geolocation} loadingLocation={loading}/> 
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MapSection;
