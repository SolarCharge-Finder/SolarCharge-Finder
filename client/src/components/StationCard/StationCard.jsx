import PropTypes from 'prop-types';

function StationCard({ station }) {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="star filled">★</span>);
      } else if (i === fullStars && hasHalf) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star">★</span>);
      }
    }
    return stars;
  };

  const getChargerBadgeClass = (type) => {
    switch (type) {
      case 'Level 2': return 'badge-level2';
      case 'DC Fast': return 'badge-dcfast';
      default: return 'badge-level1';
    }
  };

  return (
    <div className="station-card">
      <div className="card-header">
        <div className="card-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
        <span className={`charger-badge ${getChargerBadgeClass(station.chargerType)}`}>
          {station.chargerType}
        </span>
      </div>
      <h3 className="card-name">{station.name}</h3>
      <p className="card-location">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        {station.location}
      </p>
      <div className="card-rating">
        <div className="stars">{renderStars(station.rating)}</div>
        <span className="rating-value">{station.rating}</span>
        <span className="rating-count">({station.reviews} reviews)</span>
      </div>
      <div className="card-footer">
        <span className={`status ${station.available ? 'available' : 'busy'}`}>
          {station.available ? '● Available' : '● In Use'}
        </span>
        <button className="card-btn">View Details</button>
      </div>
    </div>
  );
}

StationCard.propTypes = {
  station: PropTypes.shape({
    chargerType: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    rating: PropTypes.number.isRequired,
    reviews: PropTypes.number.isRequired,
    available: PropTypes.bool.isRequired,
  }).isRequired,
};

export default StationCard;
