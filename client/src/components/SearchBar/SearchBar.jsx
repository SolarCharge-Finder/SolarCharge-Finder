import { useState } from 'react';
import FilterDropdown from './FilterDropdown';
import { useNavigate } from 'react-router-dom';

function SearchBar() {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [status, setStatus] = useState('');
  const [connectorType, setConnectorType] = useState('');

  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  //implemented search function in the new UI (adeesha)
  const handleSearch = (e) => {
        e.preventDefault();

        const params = new URLSearchParams({
          search: query || "",
          city: city || "",
          status: status || "",
          connectorType: connectorType || ""
        });

        navigate(`/search?${params.toString()}`);
  };

  return (
    <section className="search-section">
      <div className="search-container">
        <form className="search-bar" onSubmit={handleSearch}>
          <div className="search-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <input
            type="text"
            className="search-input"
            placeholder="Search by city, zip code, or address..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            className="filter-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            {/* filter icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
              <path d="M3 4h18l-7 8v6l-4 2v-8L3 4z" />
            </svg>
          </button>

          <button type="submit" className="search-btn">
            Search Stations
          </button>
        </form> 

        {showFilters && (
          <FilterDropdown
            city={city}
            setCity={setCity}
            status={status}
            setStatus={setStatus}
            connectorType={connectorType}
            setConnectorType={setConnectorType}
            onClose={() => setShowFilters(false)}
          />
        )}   

        <div className="search-tags">
          <span className="tag-label">Popular:</span>
          <button className="search-tag" onClick={() => setQuery('Colombo')}>Colombo</button>
          <button className="search-tag" onClick={() => setQuery('Type 2')}>Type 2</button>
          <button className="search-tag" onClick={() => setQuery('Kandy')}>Kandy</button>
          <button className="search-tag" onClick={() => setQuery('Galle')}>Galle</button>
        </div>
      </div>
    </section>
  );
}

export default SearchBar;
