import { useEffect, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { useParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Navbar from '../components/Navbar/Navbar'
import Footer from '../components/Footer/Footer'
import { getStationById, getStationReviews, submitReview } from '../services/stationService'
import useAuth from '../context/useAuth'
import '../styles/stationDetail.css'

// Fix Leaflet icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// ── Connector type colour map ──
const CONNECTOR_COLORS = {
  CCS2: '#8b5cf6',
  TYPE2: '#3b82f6',
  CHADEMO: '#f59e0b',
  GBT: '#ec4899',
  TYPE1: '#14b8a6',
  DOMESTIC: '#64748b',
}

function StarRating({ value = 0, max = 5, interactive = false, onChange }) {
  const [hover, setHover] = useState(null)
  const display = hover ?? value

  return (
    <span className="star-row">
      {Array.from({ length: max }, (_, i) => {
        const filled = i < display
        return (
          <span
            key={i}
            className={`star-icon ${filled ? 'star-filled' : 'star-empty'} ${interactive ? 'star-interactive' : ''}`}
            onMouseEnter={() => interactive && setHover(i + 1)}
            onMouseLeave={() => interactive && setHover(null)}
            onClick={() => interactive && onChange && onChange(i + 1)}
          >
            ★
          </span>
        )
      })}
    </span>
  )
}

StarRating.propTypes = {
  value: PropTypes.number,
  max: PropTypes.number,
  interactive: PropTypes.bool,
  onChange: PropTypes.func,
}

// ── Photo Slideshow ──
function Slideshow({ photos }) {
  const [idx, setIdx] = useState(0)

  if (!photos?.length) {
    return (
      <div className="sd-slideshow sd-slideshow--empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <p>No photos available</p>
      </div>
    )
  }

  const prev = () => setIdx((p) => (p - 1 + photos.length) % photos.length)
  const next = () => setIdx((p) => (p + 1) % photos.length)

  return (
    <div className="sd-slideshow">
      <img src={photos[idx]} alt={`Station photo ${idx + 1}`} className="sd-slideshow__img" />

      {photos.length > 1 && (
        <>
          <button className="sd-slide-btn sd-slide-btn--prev" onClick={prev} aria-label="Previous">‹</button>
          <button className="sd-slide-btn sd-slide-btn--next" onClick={next} aria-label="Next">›</button>
          <span className="sd-slide-counter">{idx + 1} / {photos.length}</span>
          <div className="sd-slide-dots">
            {photos.map((_, i) => (
              <button
                key={i}
                className={`sd-dot ${i === idx ? 'sd-dot--active' : ''}`}
                onClick={() => setIdx(i)}
                aria-label={`Photo ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

Slideshow.propTypes = {
  photos: PropTypes.arrayOf(PropTypes.string),
}

// ── Review Item ──
function ReviewItem({ review, currentUserId, onDelete }) {
  const name = review.user?.name || 'Anonymous'
  const initials = name.slice(0, 2).toUpperCase()
  const date = new Date(review.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
  const isOwn = currentUserId && review.user?._id?.toString() === currentUserId

  return (
    <div className="sd-review-item">
      <div className="sd-review-avatar">{initials}</div>
      <div className="sd-review-body">
        <div className="sd-review-header">
          <strong>{name}</strong>
          <StarRating value={review.rating} />
          <span className="sd-review-date">{date}</span>
          {isOwn && (
            <button className="sd-review-delete" onClick={() => onDelete(review._id)} title="Delete">✕</button>
          )}
        </div>
        {review.comment && <p className="sd-review-comment">{review.comment}</p>}
      </div>
    </div>
  )
}

ReviewItem.propTypes = {
  review: PropTypes.shape({
    _id: PropTypes.string,
    rating: PropTypes.number,
    comment: PropTypes.string,
    createdAt: PropTypes.string,
    user: PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
    }),
  }).isRequired,
  currentUserId: PropTypes.string,
  onDelete: PropTypes.func.isRequired,
}

// ── Main Page ──
export default function StationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, token } = useAuth()

  const [station, setStation] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Review form state
  const [myRating, setMyRating] = useState(0)
  const [myComment, setMyComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [stationData, reviewData] = await Promise.all([
        getStationById(id),
        getStationReviews(id),
      ])
      setStation(stationData)
      setReviews(reviewData)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load station.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { loadData() }, [loadData])

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!myRating) { setSubmitError('Please select a star rating.'); return }
    setSubmitting(true)
    setSubmitError(null)
    try {
      await submitReview({ stationId: id, rating: myRating, comment: myComment }, token)
      setSubmitSuccess(true)
      setMyRating(0)
      setMyComment('')
      await loadData()
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit review.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete your review?')) return
    try {
      const { deleteReview } = await import('../services/stationService')
      await deleteReview(reviewId, token)
      await loadData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete review.')
    }
  }

  // ── Render states ──
  if (loading) {
    return (
      <div className="sd-root">
        <Navbar />
        <div className="sd-loading">
          <div className="sd-spinner" />
          <p>Loading station details…</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !station) {
    return (
      <div className="sd-root">
        <Navbar />
        <div className="sd-error">
          <p>{error || 'Station not found.'}</p>
          <button className="sd-btn-back" onClick={() => navigate(-1)}>← Go Back</button>
        </div>
        <Footer />
      </div>
    )
  }

  const coords = station.location?.coordinates
  const hasCoords = coords?.length === 2
  const lat = hasCoords ? coords[1] : null
  const lng = hasCoords ? coords[0] : null
  const mapsUrl = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : station.address
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(station.address)}`
      : null

  const isOpen = station.status === 'Open'
  const totalAvailable = station.connectors?.reduce((s, c) => s + (c.availableSlots || 0), 0) ?? 0
  const totalSlots = station.connectors?.reduce((s, c) => s + (c.totalSlots || 0), 0) ?? 0
  const alreadyReviewed = reviews.some((r) => r.user?._id?.toString() === user?._id?.toString())

  return (
    <div className="sd-root">
      <Navbar />

      <main className="sd-main">
        {/* Back */}
        <button className="sd-btn-back" onClick={() => navigate(-1)}>← Back</button>

        <div className="sd-layout">
          {/* ══ LEFT COLUMN ══ */}
          <div className="sd-left">
            {/* Slideshow */}
            <Slideshow photos={station.photos} />

            {/* Title + Status */}
            <div className="sd-title-row">
              <h1 className="sd-name">{station.name}</h1>
              <span className={`sd-status sd-status--${station.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                {station.status}
              </span>
            </div>

            {/* Rating summary */}
            <div className="sd-rating-row">
              <StarRating value={Math.round(station.rating ?? 0)} />
              <span className="sd-rating-val">{(station.rating ?? 0).toFixed(1)}</span>
              <span className="sd-rating-count">({station.totalRatings ?? 0} review{station.totalRatings !== 1 ? 's' : ''})</span>
            </div>

            {/* Address */}
            {station.address && (
              <div className="sd-info-row">
                <span className="sd-info-icon">📍</span>
                <span>{station.address}{station.city ? `, ${station.city}` : ''}{station.district ? `, ${station.district}` : ''}</span>
              </div>
            )}

            {/* Description */}
            {station.description && (
              <div className="sd-section">
                <h2 className="sd-section-title">About this station</h2>
                <p className="sd-description">{station.description}</p>
              </div>
            )}

            {/* Availability summary */}
            <div className="sd-avail-banner">
              <div className="sd-avail-item">
                <span className="sd-avail-num">{totalAvailable}</span>
                <span className="sd-avail-label">Available Slots</span>
              </div>
              <div className="sd-avail-divider" />
              <div className="sd-avail-item">
                <span className="sd-avail-num">{totalSlots}</span>
                <span className="sd-avail-label">Total Slots</span>
              </div>
              <div className="sd-avail-divider" />
              <div className="sd-avail-item">
                <span className={`sd-avail-num ${isOpen ? 'sd-green' : 'sd-red'}`}>{station.status}</span>
                <span className="sd-avail-label">Status</span>
              </div>
            </div>

            {/* Connectors */}
            <div className="sd-section">
              <h2 className="sd-section-title">Connectors</h2>
              <div className="sd-connectors">
                {station.connectors?.map((c, i) => (
                  <div className="sd-connector-card" key={i} style={{ borderColor: CONNECTOR_COLORS[c.type] || '#94a3b8' }}>
                    <span
                      className="sd-connector-badge"
                      style={{ background: CONNECTOR_COLORS[c.type] || '#94a3b8' }}
                    >
                      {c.type}
                    </span>
                    <div className="sd-connector-row">
                      <span>⚡</span>
                      <span><strong>{c.powerKW} kW</strong></span>
                    </div>
                    <div className="sd-connector-slots">
                      <div
                        className="sd-slot-bar"
                        title={`${c.availableSlots} of ${c.totalSlots} available`}
                      >
                        <div
                          className="sd-slot-fill"
                          style={{
                            width: c.totalSlots > 0 ? `${(c.availableSlots / c.totalSlots) * 100}%` : '0%',
                            background: CONNECTOR_COLORS[c.type] || '#10b981',
                          }}
                        />
                      </div>
                      <span className="sd-slot-label">{c.availableSlots}/{c.totalSlots} slots free</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Get Directions */}
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="sd-btn-directions"
              >
                 Get Directions in Google Maps
              </a>
            )}
          </div>

          {/* ══ RIGHT COLUMN ══ */}
          <div className="sd-right">
            {/* Mini Map */}
            {hasCoords && (
              <div className="sd-section">
                <h2 className="sd-section-title">Location</h2>
                <div className="sd-mini-map">
                  <MapContainer center={[lat, lng]} zoom={15} style={{ height: '260px', width: '100%' }} scrollWheelZoom={false} zoomControl>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[lat, lng]}>
                      <Popup>{station.name}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="sd-section">
              <h2 className="sd-section-title">
                Reviews
                <span className="sd-review-count">{reviews.length}</span>
              </h2>

              {/* Submit form */}
              {user ? (
                alreadyReviewed ? (
                  <div className="sd-already-reviewed">✅ You have already reviewed this station.</div>
                ) : !submitSuccess ? (
                  <form className="sd-review-form" onSubmit={handleSubmitReview}>
                    <p className="sd-form-label">Your Rating</p>
                    <StarRating value={myRating} interactive onChange={setMyRating} />
                    <textarea
                      className="sd-review-textarea"
                      placeholder="Share your experience (optional)…"
                      value={myComment}
                      onChange={(e) => setMyComment(e.target.value)}
                      rows={3}
                      maxLength={1000}
                    />
                    {submitError && <p className="sd-form-error">{submitError}</p>}
                    <button className="sd-btn-submit" type="submit" disabled={submitting}>
                      {submitting ? 'Submitting…' : '⭐ Submit Review'}
                    </button>
                  </form>
                ) : (
                  <div className="sd-already-reviewed">✅ Review submitted! Thank you.</div>
                )
              ) : (
                <div className="sd-login-prompt">
                  <a href="/auth" className="sd-login-link">Log in</a> to leave a review.
                </div>
              )}

              {/* Review list */}
              {reviews.length === 0 ? (
                <p className="sd-no-reviews">No reviews yet. Be the first!</p>
              ) : (
                <div className="sd-review-list">
                  {reviews.map((r) => (
                    <ReviewItem
                      key={r._id}
                      review={r}
                      currentUserId={user?._id?.toString()}
                      onDelete={handleDeleteReview}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
