import PropTypes from 'prop-types';

const renderStars = (rating = 0) => {
    return Array.from({ length: 5 }, (_, idx) => {
    const filled = idx < Math.round(rating)
    return (
        <span key={idx} className={filled ? 'star-filled' : 'star-muted'}>
        ★
        </span>
    )
    })
}

const SearchResults = ({ stations, error }) => {
  if (stations.length === 0 && !error) {
    return (
      <p className="no-results">
        No stations found. Try adjusting your search criteria.
      </p>
    );
  }

  return (
    <div className="stations-grid">
      {stations.map((station) => {
        // Fallback values in case of backend response issue 
        const distance = station.distance || "0.0 km";

        return (
          <div key={station._id} className="station-card">
            <div className="card-header">
              <h3 className="station-card__header">{station.name}</h3>
              <span className="station-card__rating">{renderStars(station.rating)}</span>
            </div>

            <p className="station-card__address">{station.address}</p>

            <p
              className={`station-status ${station.status
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
            >
              {station.status}
            </p>

            <p className="station-card__distance"> {distance} away</p>

            <button className="station-card__cta">
              Get Directions
            </button>
          </div>
        );
      })}
    </div>
  );
};


// PropTypes for type checking & final validation
SearchResults.propTypes = {
  stations: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string,
      address: PropTypes.string,
      status: PropTypes.string,
      rating: PropTypes.number,
      distance: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
      ])
    })
  ).isRequired,
  error: PropTypes.string
};

export default SearchResults;
