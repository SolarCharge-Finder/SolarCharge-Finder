import PropTypes from 'prop-types'
import StationResultCard from '../station/StationResultCard'

function SearchSidebar({
  searchTerm,
  onSearchChange,
  onUseCurrentLocation,
  locationLoading,
  locationError,
  stations,
  selectedStation,
  onSelectStation,
  onDirections,
}) {
  return (
    <aside className="search-sidebar">
      <div className="search-sidebar__controls">
        <label htmlFor="station-search">Search Stations</label>
        <input
          id="station-search"
          type="text"
          value={searchTerm}
          placeholder="Search by name or city"
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <button type="button" className="btn-secondary" onClick={onUseCurrentLocation} disabled={locationLoading}>
          {locationLoading ? 'Detecting location...' : 'Use Current Location'}
        </button>
        {locationError && <p className="error-text">{locationError}</p>}
      </div>
      <div className="search-sidebar__results">
        {stations.map((station) => (
          <StationResultCard
            key={station.id}
            station={station}
            active={selectedStation?.id === station.id}
            onSelect={onSelectStation}
            onDirections={onDirections}
          />
        ))}
        {!stations.length && <p className="empty-state">No stations match your search.</p>}
      </div>
    </aside>
  )
}

SearchSidebar.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onUseCurrentLocation: PropTypes.func.isRequired,
  locationLoading: PropTypes.bool,
  locationError: PropTypes.string,
  stations: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedStation: PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) }),
  onSelectStation: PropTypes.func.isRequired,
  onDirections: PropTypes.func.isRequired,
}

SearchSidebar.defaultProps = {
  locationLoading: false,
  locationError: '',
  selectedStation: null,
}

export default SearchSidebar
