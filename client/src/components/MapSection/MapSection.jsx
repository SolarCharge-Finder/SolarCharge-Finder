//import StationCard from '../StationCard/StationCard';
import { useEffect, useMemo, useState, useCallback } from 'react';
import SearchResults from '../SearchBar/SearchResults';
import MapView from "../map/MapView";
import { getTopRatedStations } from '../../services/stationService';
import useGeolocation from '../../hooks/useGeoLocation';
import { calculateDistance } from '../../utils/distance';

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
      setError(err);
    }
  }, []);


  // will implement sort by distance part soon (adeesha) o7 - done

  //handle sort options - rating, distance
  useEffect(() => {
    if (sortOption === 'rating') {
      fetchTopRatedStations();
    }

    getLocation(); //get the location on page mount 
  }, [sortOption, fetchTopRatedStations, getLocation]);

  const displayedStations = useMemo(() => {
    if (!stations.length) return [];

    let sorted = [...stations];

    if (sortOption === 'distance' && geolocation) {
      sorted = sorted.map((station) => ({
        ...station,
        distance: calculateDistance(
          geolocation.longitude,
          geolocation.latitude,
          station.location.coordinates
        ),
      })).sort((a, b) => a.distance - b.distance);
    }

    return sorted;
  }, [stations, sortOption, geolocation]);

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
            <MapView stations={displayedStations} userLocation={geolocation} loadingLocation={loading}/>
          </div>
          <div className="station-list">
            <div className="list-header">
              <h3>{displayedStations.length} stations found</h3>
              <select className="sort-select" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                <option value="rating">Sort by Rating</option>
                <option value="distance">Sort by Distance</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
            <div className="cards-scroll">
              {error ? (
                <p className="no-results">Failed to load stations</p>
              ) : displayedStations.length === 0 ? (
                <p className="no-results">No stations found. Try adjusting your search criteria.</p>
              ) : (
                <SearchResults stations={displayedStations} error={error} userLocation={geolocation} loadingLocation={loading}/> 
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MapSection;
