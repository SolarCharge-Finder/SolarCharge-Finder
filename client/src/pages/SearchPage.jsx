import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { searchStations } from "../services/stationService";
import SearchBar from '../components/SearchBar/SearchBar';
import SearchResults from "../components/SearchBar/SearchResults";
import MapView from "../components/map/MapView";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import '../styles/SearchPage.css';

const SearchPage = () => {
    const [query, setQuery] = useState("");
    const [stations, setStations] = useState([]); //results from search 
    const [city, setCity] = useState("");
    const [status, setStatus] = useState("");
    const [connectorType, setConnectorType] = useState("");
    const [error, setError] = useState("");

    const location = useLocation();

    const handleSearch = useCallback(
        async (filtersOverride = null) => {
            try {
                setError("");

                const filters = filtersOverride ?? {
                    search: query,
                    city,
                    status,
                    connectorType,
                };

                const data = await searchStations(filters);
                setStations(data);

            } catch (err) {
                console.error("Search failed:", err);
                setError("Error fetching stations");
            }
        },
        [query, city, status, connectorType]
    );

    useEffect(() => {
        const params = new URLSearchParams(location.search);

        const filters = {
            search: params.get("search") ?? "",
            city: params.get("city") ?? "",
            status: params.get("status") ?? "",
            connectorType: params.get("connectorType") ?? "",
        };

        // Sync state with URL
        setQuery(filters.search);
        setCity(filters.city);
        setStatus(filters.status);
        setConnectorType(filters.connectorType);

        // Only search if at least one filter exists
        const hasFilters = Object.values(filters).some(Boolean);

        if (hasFilters) {
            handleSearch(filters);
        }

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
                    <SearchResults stations={stations} error={error} />
                </div>

                {/* Map preview on the right side */}
                <div className="map-preview-panel">
                     <MapView />
                </div>
                
            </div>

        </div>
      </main>
      <Footer />
    </div>
    );

};

export default SearchPage;
