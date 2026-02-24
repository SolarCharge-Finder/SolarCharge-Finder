import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { calculateDistance } from '../../utils/distance';

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

const SearchResults = ({ stations, error, userLocation = null, loadingLocation = false }) => {
  const navigate = useNavigate();

  if (stations.length === 0 && !error) {
    return (
      <p className="no-results">
        No stations found. Try adjusting your search criteria.
      </p>
    );
  }

  const handleCardClick = (stationId) => {
    navigate(`/stations/${stationId}`);
  };

  const handleGetDirections = (e, station) => {
    e.stopPropagation();
    if (!station.location?.coordinates) {
      alert('Location not available');
      return;
    }
    const [lng, lat] = station.location.coordinates;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      '_blank'
    );
  };

  return (
    <div className="stations-grid">
      {stations.map((station) => {
        let distance = station.distance;

        if (!distance) {
          if (loadingLocation) {
            distance = "Calculating...";
          } else if (userLocation && station.location) {
            distance = calculateDistance(
              [userLocation.latitude, userLocation.longitude],
              station.location.coordinates
            );
          } else {
            distance = "N/A"; //fallback value 
          }
        }

        const distanceDisplay = typeof distance === 'number' ? `${distance.toFixed(1)} km` : distance;

        return (
          <div 
            key={station._id} 
            className="station-card"
            onClick={() => handleCardClick(station._id)}
            style={{ cursor: 'pointer' }}
          >
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

            <p className="station-card__distance"> {distanceDisplay} away</p>

            <button 
              className="station-card__cta"
              onClick={(e) => handleGetDirections(e, station)}
            >
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
      ]),
      location: PropTypes.shape({
        coordinates: PropTypes.arrayOf(PropTypes.number)
      })
    })
  ).isRequired,
  error: PropTypes.string,
  userLocation: PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number
  }),
  loadingLocation: PropTypes.bool
};

export default SearchResults;
