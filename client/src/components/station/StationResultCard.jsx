import PropTypes from 'prop-types'
import { useState } from 'react'

function StationResultCard({ station, active, onSelect, onDirections }) {
  const photos = station.photos?.length ? station.photos : []
  const hasPhotos = photos.length > 0
  const [currentIndex, setCurrentIndex] = useState(0)

  const prevPhoto = (e) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  const nextPhoto = (e) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev + 1) % photos.length)
  }

  const goToPhoto = (e, idx) => {
    e.stopPropagation()
    setCurrentIndex(idx)
  }

  const handleGetDirections = (e) => {
    e.stopPropagation()
    const coords = station.location?.coordinates
    let url
    if (coords && coords.length === 2) {
      const lat = coords[1]
      const lng = coords[0]
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    } else if (station.address) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(station.address)}`
    }
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
    onDirections(station)
  }

  const renderStars = (rating = 0) =>
    Array.from({ length: 5 }, (_, idx) => {
      const filled = idx < Math.round(rating)
      return (
        <span key={idx} className={filled ? 'star-filled' : 'star-muted'}>
          ★
        </span>
      )
    })

  const statusClass = station.status
    ? station.status.toLowerCase().replace(/\s+/g, '-')
    : ''

  return (
    <article
      className={`station-card ${active ? 'station-card--active' : ''}`}
      onClick={() => onSelect(station)}
    >
      {/* ── Photo Slideshow ── */}
      <div className="station-card__slideshow">
        {hasPhotos ? (
          <>
            <img
              src={photos[currentIndex]}
              alt={`${station.name} photo ${currentIndex + 1}`}
              className="station-card__photo"
            />
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  className="slideshow-btn slideshow-btn--prev"
                  onClick={prevPhoto}
                  aria-label="Previous photo"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="slideshow-btn slideshow-btn--next"
                  onClick={nextPhoto}
                  aria-label="Next photo"
                >
                  ›
                </button>
                <div className="slideshow-dots">
                  {photos.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`slideshow-dot ${idx === currentIndex ? 'slideshow-dot--active' : ''}`}
                      onClick={(e) => goToPhoto(e, idx)}
                      aria-label={`Go to photo ${idx + 1}`}
                    />
                  ))}
                </div>
                <span className="slideshow-counter">
                  {currentIndex + 1} / {photos.length}
                </span>
              </>
            )}
          </>
        ) : (
          <div className="station-card__photo-placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span>No photos available</span>
          </div>
        )}
      </div>

      {/* ── Card Body ── */}
      <div className="station-card__body">
        <div className="station-card__header">
          <h4>{station.name}</h4>
          <div className="station-card__rating">{renderStars(station.rating)}</div>
        </div>

        {station.address && (
          <p className="station-card__address">{station.address}</p>
        )}

        <div className="station-card__meta">
          {station.distance != null && (
            <span className="station-card__distance">
              📍 {typeof station.distance === 'number' ? `${station.distance.toFixed(1)} km` : station.distance} away
            </span>
          )}
          {station.status && (
            <span className={`station-card__status station-status ${statusClass}`}>
              {station.status}
            </span>
          )}
        </div>

        <button
          type="button"
          className="station-card__cta"
          onClick={handleGetDirections}
        >
           Get Directions
        </button>
      </div>
    </article>
  )
}

StationResultCard.propTypes = {
  station: PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string.isRequired,
    rating: PropTypes.number,
    address: PropTypes.string,
    distance: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    status: PropTypes.string,
    photos: PropTypes.arrayOf(PropTypes.string),
    location: PropTypes.shape({
      coordinates: PropTypes.arrayOf(PropTypes.number),
    }),
  }).isRequired,
  active: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  onDirections: PropTypes.func.isRequired,
}

StationResultCard.defaultProps = {
  active: false,
}

export default StationResultCard
