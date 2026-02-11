import PropTypes from 'prop-types'

function StationResultCard({ station, active, onSelect, onDirections }) {
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

  return (
    <article className={`station-card ${active ? 'station-card--active' : ''}`} onClick={() => onSelect(station)}>
      <div className="station-card__header">
        <h4>{station.name}</h4>
        <div className="station-card__rating">{renderStars(station.rating)}</div>
      </div>
      <p className="station-card__address">{station.address}</p>
      {station.distance && <p className="station-card__distance">{station.distance} km away</p>}
      <button
        type="button"
        className="station-card__cta"
        onClick={(event) => {
          event.stopPropagation()
          onDirections(station)
        }}
      >
        Get Directions
      </button>
    </article>
  )
}

StationResultCard.propTypes = {
  station: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    rating: PropTypes.number,
    address: PropTypes.string,
    distance: PropTypes.number,
  }).isRequired,
  active: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  onDirections: PropTypes.func.isRequired,
}

StationResultCard.defaultProps = {
  active: false,
}

export default StationResultCard
