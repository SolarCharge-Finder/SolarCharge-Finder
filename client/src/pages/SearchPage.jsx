import { useState } from "react";
import { searchStations } from "../services/stationService";

const SearchPage = () => {
    const [query, setQuery] = useState("");
    const [stations, setStations] = useState([]);
    const [city, setCity] = useState("");
    const [status, setStatus] = useState("");
    const [connectorType, setConnectorType] = useState("");
    const [error, setError] = useState("");

    const handleSearch = async () => {
        try {
            setError("");

            const SearchFilters = {
                search : query,
                city,   
                status,
                connectorType
            };
            
            const data = await searchStations(SearchFilters);
            setStations(data);

        } catch (err) {
            setError("Error fetching stations");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
        <h2>Search Charging Stations</h2>

        <input
            type="text"
            placeholder="Search by city, name, connector type..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ padding: "8px", width: "300px" }}
        />

        <div style={{ marginTop: "15px" }}>

            {/* city filter */}
            <select value={city} onChange={(e) => setCity(e.target.value)} style={{ padding: "8px", marginRight: "10px" }}>
                <option value="">All Cities</option>
                <option value="Colombo">Colombo</option>
                <option value="Kandy">Kandy</option>
                <option value="Galle">Galle</option>
            </select>

            {/* status filter */}
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: "8px", marginRight: "10px" }}>
                <option value="">All Status</option>
                <option value="Open">Open</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Closed">Closed</option>
            </select>

            {/* connector type filter */}
            <select value={connectorType} onChange={(e) => setConnectorType(e.target.value)} style={{ padding: "8px" }}>
                <option value="">All Connector Types</option>
                <option value="Type 1">Type 1</option>
                <option value="Type 2">Type 2</option>
            </select>

        </div>


        <button onClick={handleSearch} style={{ marginLeft: "10px", padding: "8px", marginTop: "15px" }}>
            Search
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div style={{ marginTop: "20px" }}>
            {stations.map((station) => (
            <div key={station._id} style={{ marginBottom: "15px", border: "1px solid #ccc", padding: "10px" }}>
                <h3>{station.name}</h3>
                <p>{station.city}, {station.district}</p>
                <p>Status: {station.status}</p>
            </div>
            ))}
        </div>
        </div>
    );
};

export default SearchPage;
