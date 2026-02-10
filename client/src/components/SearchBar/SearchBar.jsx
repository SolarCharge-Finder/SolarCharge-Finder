import { useState } from 'react';

function SearchBar() {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // Search logic to be implemented
    console.log('Searching for:', query);
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
          <button type="submit" className="search-btn">
            Search Stations
          </button>
        </form>
        <div className="search-tags">
          <span className="tag-label">Popular:</span>
          <button className="search-tag" onClick={() => setQuery('New York')}>New York</button>
          <button className="search-tag" onClick={() => setQuery('Los Angeles')}>Los Angeles</button>
          <button className="search-tag" onClick={() => setQuery('San Francisco')}>San Francisco</button>
          <button className="search-tag" onClick={() => setQuery('Austin')}>Austin</button>
        </div>
      </div>
    </section>
  );
}

export default SearchBar;
