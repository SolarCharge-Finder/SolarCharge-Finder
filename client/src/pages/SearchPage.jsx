import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { searchStations, searchStationsByDistance } from '../services/stationService';
import useGeolocation from '../hooks/useGeoLocation';
import SearchBar from '../components/SearchBar/SearchBar';
import SearchResults from '../components/SearchBar/SearchResults';
import MapView from '../components/map/MapView';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import '../styles/SearchPage.css';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [stations, setStations] = useState([]); //results from search
  const [sellRequests, setSellRequests] = useState([]);
  const [district, setDistrict] = useState('');
  const [status, setStatus] = useState('');
  const [connectorType, setConnectorType] = useState('');
  const [error, setError] = useState('');

  const location = useLocation();

  const { geolocation, loading, getLocation } = useGeolocation();

  const handleSearch = useCallback(
    async (filtersOverride = null) => {
      try {
        setError('');

        const filters = filtersOverride ?? {
          search: query,
          district,
          status,
          connectorType,
        };

        let data;
        //user geo location present -> searchStationsByDistance || user geo location not present -> searchStation
        if (geolocation?.latitude && geolocation?.longitude) {
          data = await searchStationsByDistance(filters, geolocation);
        } else {
          data = await searchStations(filters);
        }
        setStations(data);
      } catch (err) {
        console.error('Search failed:', err);
        setError('Error fetching stations');
      }
    },
    [query, district, status, connectorType, geolocation]
  );

  //get location on search page load
  useEffect(() => {
    getLocation();
  }, [getLocation]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const filters = {
      search: params.get('search') ?? '',
      district: params.get('district') ?? '',
      status: params.get('status') ?? '',
      connectorType: params.get('connectorType') ?? '',
    };

    // Sync state with URL
    setQuery(filters.search);
    setDistrict(filters.district);
    setStatus(filters.status);
    setConnectorType(filters.connectorType);

    //to show all results regardless of filter with the same api endpoint
    handleSearch(filters);
  }, [location.search, handleSearch]);

  useEffect(() => {
    const fetchSellRequests = async () => {
      try {
        const { data } = await axios.get('/api/sell-request/map');
        setSellRequests(data?.requests ?? []);
      } catch (err) {
        console.error('Failed to load sell requests for map:', err);
        setSellRequests([]);
      }
    };

    fetchSellRequests();
  }, []);

  return (
    <div className="page-layout search-page">
      <Navbar forceSolid />
      <main className="page-content">
        <div className="searchpage-container">
          <div className="searchpage-hero">
            <span className="section-tag">Live Solar Charging Map</span>
            <h1 className="page-title">Search Solar Friendly Stations</h1>
            <p className="page-subtitle">
              Use smart filters, view live availability, and share stations with friends  all in
              the same polished experience as the homepage.
            </p>
          </div>

          <div className="searchpage-hero-card">
            <SearchBar />
          </div>

          {error && <p className="error-msg">{error}</p>}

          {/* Display search results */}
          <div className="search-page-layout">
            {/* Search results displayed in the left side */}
            <div className="search-results-panel">
              <div className="results-header">
                <div>
                  <h2>Stations Nearby</h2>
                  <p>Browse curated cards or jump into the interactive map.</p>
                </div>
                <span className="results-count">
                  {stations.length + sellRequests.length} results
                </span>
              </div>
              <SearchResults
                stations={stations}
                error={error}
                sellRequests={sellRequests}
                userLocation={geolocation}
                loadingLocation={loading}
              />
            </div>

            {/* Map preview on the right side */}
            <div className="map-preview-panel">
              <MapView
                stations={stations}
                sellRequests={sellRequests}
                userLocation={geolocation}
                loadingLocation={loading}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchPage;
