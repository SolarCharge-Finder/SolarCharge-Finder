import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { searchStations, searchStationsByDistance } from "../services/stationService";
import useGeolocation from '../hooks/useGeoLocation';
import SearchBar from '../components/SearchBar/SearchBar';
import SearchResults from "../components/SearchBar/SearchResults";
import MapView from "../components/map/MapView";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import '../styles/SearchPage.css';

const SearchPage = () => {
    const [query, setQuery] = useState("");
    const [stations, setStations] = useState([]); //results from search 
    const [district, setDistrict] = useState("");
    const [status, setStatus] = useState("");
    const [connectorType, setConnectorType] = useState("");
    const [error, setError] = useState("");

    const location = useLocation();

    const { geolocation, loading, getLocation } = useGeolocation();

    const handleSearch = useCallback(
        async (filtersOverride = null) => {
            try {
                setError("");

                const filters = filtersOverride ?? {
                    search: query,
                    district,
                    status,
                    connectorType,
                };

                let data; 
                //user geo location present -> searchStationsByDistance || user geo location not present -> searchStation
                if(geolocation?.latitude && geolocation?.longitude) {
                    data = await searchStationsByDistance(filters, geolocation);
                }
                else {
                    data = await searchStations(filters);
                }
                setStations(data);

            } catch (err) {
                console.error("Search failed:", err);
                setError("Error fetching stations");
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
            search: params.get("search") ?? "",
            district: params.get("district") ?? "",
            status: params.get("status") ?? "",
            connectorType: params.get("connectorType") ?? "",
        };

        // Sync state with URL
        setQuery(filters.search);
        setDistrict(filters.district);
        setStatus(filters.status);
        setConnectorType(filters.connectorType);
        
        //to show all results regardless of filter with the same api endpoint 
        handleSearch(filters);

    }, [location.search, handleSearch]);

    return (
    <div className="page-layout">
      <Navbar />
      <main className="page-content">
        <div className="searchpage-container">
            <h1 className="page-title">Searching For Charging Stations</h1>

            <SearchBar />

            {error && <p className="error-message">{error}</p>}

            {/* Display search results */}
            <div className="search-page-layout">
                {/* Search results displayed in the left side */}
                <div className="search-results-panel">
                    <SearchResults stations={stations} error={error} userLocation={geolocation} loadingLocation={loading}/>
                    {/* distance calc works { latitude: 6.915, longitude: 79.857 } 
                    - need to fix the issues with browser location requests </3*/}
                </div>

                {/* Map preview on the right side */}
                <div className="map-preview-panel">
                    {/* mapview updated to show user location & returned station location (adeesha) */}
                     <MapView stations={stations} userLocation={geolocation} loadingLocation={loading}/>
                </div>
                
            </div>

        </div>
      </main>
      <Footer />
    </div>
    );

};

export default SearchPage;
