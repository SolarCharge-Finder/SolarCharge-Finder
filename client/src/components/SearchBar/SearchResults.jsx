import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { FiShare2 } from 'react-icons/fi';
import { calculateDistance } from '../../utils/distance';

const renderStars = (rating = 0) => {
  return Array.from({ length: 5 }, (_, idx) => {
    const filled = idx < Math.round(rating);
    return (
      <span key={idx} className={filled ? 'star-filled' : 'star-muted'}>
        ★
      </span>
    );
  });
};

const SearchResults = ({
  stations,
  error,
  sellRequests = [],
  userLocation = null,
  loadingLocation = false,
}) => {
  const navigate = useNavigate();

  if (stations.length === 0 && sellRequests.length === 0 && !error) {
    return <p className="no-results">No results found. Try adjusting your search criteria.</p>;
  }

  const handleCardClick = stationId => {
    navigate(`/stations/${stationId}`);
  };

  const handleGetDirections = (e, station) => {
    e.stopPropagation();
    if (!station.location?.coordinates) {
      alert('Location not available');
      return;
    }
    const [lng, lat] = station.location.coordinates;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  const handleShare = async (e, station) => {
    e.stopPropagation();
    if (typeof window === 'undefined') return;

    const shareUrl = `${window.location.origin}/stations/${station._id}`;
    const shareData = {
      title: `Charge at ${station.name}`,
      text: `Check out ${station.name} on SolarCharge Finder.`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${station.name} - ${shareUrl}`);
        alert('Station link copied to clipboard');
      } else {
        window.prompt('Copy this link to share', shareUrl);
      }
    } catch (err) {
      console.error('Failed to share station', err);
      alert('Unable to share this station right now.');
    }
  };

  const handleSellDirection = (e, request) => {
    e.stopPropagation();
    const [lng, lat] = request.location?.coordinates ?? [];
    if (lat === undefined || lng === undefined) {
      alert('Location not available');
      return;
    }
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  const handleSellShare = async (e, request) => {
    e.stopPropagation();
    if (typeof window === 'undefined') return;

    const [lng, lat] = request.location?.coordinates ?? [];
    const mapsUrl =
      lat !== undefined && lng !== undefined
        ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
        : `${window.location.origin}/search`;

    const shareData = {
      title: `Solar energy offer by ${request.username || 'User'}`,
      text: `${request.energyAmount} kWh available. ${request.comment || ''}`.trim(),
      url: mapsUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareData.title} - ${mapsUrl}`);
        alert('Sell request link copied to clipboard');
      } else {
        window.prompt('Copy this link to share', mapsUrl);
      }
    } catch (err) {
      console.error('Failed to share sell request', err);
      alert('Unable to share this sell request right now.');
    }
  };

  return (
    <>
      <div className="stations-grid">
        {stations.map(station => {
          let distance = station.distance;

          if (!distance) {
            if (loadingLocation) {
              distance = 'Calculating...';
            } else if (userLocation && station.location) {
              distance = calculateDistance(
                [userLocation.longitude, userLocation.latitude],
                station.location.coordinates
              );
            } else {
              distance = 'N/A'; //fallback value
            }
          }

          const distanceDisplay =
            typeof distance === 'number' ? `${distance.toFixed(1)} km` : distance;

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

              <p className={`station-status ${station.status.toLowerCase().replace(/\s+/g, '-')}`}>
                {station.status}
              </p>

              <p className="station-card__distance"> {distanceDisplay} away</p>

              <div className="station-card__actions">
                <button
                  className="station-card__cta"
                  onClick={e => handleGetDirections(e, station)}
                >
                  Get Directions
                </button>
                <button
                  type="button"
                  className="station-card__share"
                  onClick={e => handleShare(e, station)}
                >
                  <FiShare2 aria-hidden="true" />
                  Share
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <section className="sell-requests-section">
        <h3 className="sell-requests-section__title">Solar Energy Offers</h3>
        {sellRequests.length === 0 ? (
          <p className="no-results">No active sell energy offers yet.</p>
        ) : (
          <div className="stations-grid">
            {sellRequests.map(request => {
              const [lng, lat] = request.location?.coordinates ?? [];
              const locationLabel =
                lat !== undefined && lng !== undefined
                  ? `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`
                  : 'Location unavailable';

              return (
                <div key={request._id} className="station-card sell-request-card">
                  <div className="card-header">
                    <h3 className="station-card__header">Username: {request.username || 'User'}</h3>
                  </div>

                  <p className="station-card__address">
                    <strong>Amount:</strong> {request.energyAmount} kWh
                  </p>
                  <p className="station-card__address">
                    <strong>Description:</strong> {request.comment || 'No description provided'}
                  </p>
                  <p className="station-card__distance">
                    <strong>Location:</strong> {locationLabel}
                  </p>

                  <div className="station-card__actions">
                    <button
                      className="station-card__cta"
                      onClick={e => handleSellDirection(e, request)}
                    >
                      Direction
                    </button>
                    <button
                      type="button"
                      className="station-card__share"
                      onClick={e => handleSellShare(e, request)}
                    >
                      <FiShare2 aria-hidden="true" />
                      Share
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
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
      distance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      location: PropTypes.shape({
        coordinates: PropTypes.arrayOf(PropTypes.number),
      }),
    })
  ).isRequired,
  error: PropTypes.string,
  sellRequests: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      username: PropTypes.string,
      energyAmount: PropTypes.number.isRequired,
      comment: PropTypes.string,
      location: PropTypes.shape({
        coordinates: PropTypes.arrayOf(PropTypes.number),
      }),
      status: PropTypes.string,
    })
  ),
  userLocation: PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number,
  }),
  loadingLocation: PropTypes.bool,
};

SearchResults.defaultProps = {
  sellRequests: [],
};

export default SearchResults;
