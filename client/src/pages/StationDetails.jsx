import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { FiShare2 } from 'react-icons/fi'
import Navbar from '../components/Navbar/Navbar'
import Footer from '../components/Footer/Footer'
import useAuth from '../context/useAuth'
import '../styles/StationDetails.css'

// Fix default marker icon paths
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const renderStars = (rating = 0, interactive = false, onRate = null) => {
  return Array.from({ length: 5 }, (_, idx) => {
    const filled = idx < Math.round(rating)
    return (
      <span
        key={idx}
        className={`star ${filled ? 'star-filled' : 'star-muted'} ${interactive ? 'star-interactive' : ''}`}
        onClick={() => interactive && onRate && onRate(idx + 1)}
        style={interactive ? { cursor: 'pointer' } : {}}
      >
        ★
      </span>
    )
  })
}

const StationDetails = () => {
  const { id } = useParams()
  const { user, token } = useAuth()
  const [station, setStation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [reviews, setReviews] = useState([])
  const [userRating, setUserRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    const fetchStation = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`/api/stations/${id}`)
        setStation(response.data.data || response.data)
        setError('')
      } catch (err) {
        console.error('Failed to fetch station:', err)
        setError('Unable to load station details.')
      } finally {
        setLoading(false)
      }
    }

    const fetchReviews = async () => {
      try {
        const response = await axios.get(`/api/reviews/station/${id}`)
        setReviews(response.data.data || response.data || [])
      } catch (err) {
        console.error('Failed to fetch reviews:', err)
      }
    }

    fetchStation()
    fetchReviews()
  }, [id])

  // Auto-change photos every 4 seconds
  useEffect(() => {
    if (!station?.photos || station.photos.length <= 1) return

    const interval = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % station.photos.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [station?.photos])

  const handleSubmitReview = async () => {
    if (!user) {
      alert('Please login to submit a review')
      return
    }
    if (userRating === 0) {
      alert('Please select a rating')
      return
    }

    try {
      setSubmittingReview(true)
      await axios.post(
        '/api/reviews',
        {
          stationId: id,
          rating: userRating,
          comment: reviewText,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      // Refresh reviews
      const response = await axios.get(`/api/reviews/station/${id}`)
      setReviews(response.data.data || response.data || [])
      setUserRating(0)
      setReviewText('')
      alert('Review submitted successfully!')
    } catch (err) {
      console.error('Failed to submit review:', err)
      alert(err?.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleGetDirections = () => {
    if (!station?.location?.coordinates) {
      alert('Location not available')
      return
    }
    const [lng, lat] = station.location.coordinates
    // Open Google Maps with directions
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      '_blank'
    )
  }

  const handleShareStation = async () => {
    if (typeof window === 'undefined' || !station) return

    const shareUrl = `${window.location.origin}/stations/${station._id}`
    const shareData = {
      title: `Charge at ${station.name}`,
      text: `Check out ${station.name} on SolarCharge Finder.`,
      url: shareUrl,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${station.name} - ${shareUrl}`)
        alert('Station link copied to clipboard')
      } else {
        window.prompt('Copy this link to share', shareUrl)
      }
    } catch (err) {
      console.error('Failed to share station', err)
      alert('Unable to share this station right now.')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return '#109867'
      case 'Closed':
        return '#ef4444'
      case 'Under Maintenance':
      case 'Maintenance':
        return '#f8c537'
      default:
        return '#5f6b7a'
    }
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'Open':
        return 'status-open'
      case 'Closed':
        return 'status-closed'
      case 'Under Maintenance':
      case 'Maintenance':
        return 'status-maintenance'
      default:
        return ''
    }
  }

  if (loading) {
    return (
      <div className="page-layout station-details-page">
        <Navbar forceSolid />
        <main className="page-content">
          <div className="station-details-container">
            <p className="loading-text">Loading station details...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !station) {
    return (
      <div className="page-layout station-details-page">
        <Navbar forceSolid />
        <main className="page-content">
          <div className="station-details-container">
            <p className="error-text">{error || 'Station not found'}</p>
            <Link to="/search" className="back-link">← Back to Search</Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const photos = station.photos || []
  const hasPhotos = photos.length > 0
  const coordinates = station.location?.coordinates || []
  const [lng, lat] = coordinates
  const totalSlots = station.connectors?.reduce((sum, c) => sum + (c.totalSlots || 0), 0) || 0
  const availableSlots = station.connectors?.reduce((sum, c) => sum + (c.availableSlots || 0), 0) || 0
  const avgRating = station.rating || 0
  const reviewCount = reviews.length

  return (
    <div className="page-layout station-details-page">
      <Navbar forceSolid />
      <main className="page-content">
        <div className="station-details-container">
          <Link to="/search" className="back-link">← Back to Search</Link>

          <div className="station-details-grid">
            {/* Left Column - Main Info */}
            <div className="station-main-info">
              {/* Photo Gallery */}
              <div className="station-photo-gallery">
                {hasPhotos ? (
                  <>
                    <img
                      src={photos[currentPhotoIndex]}
                      alt={station.name}
                      className="station-main-photo"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/800x400?text=No+Image'
                      }}
                    />
                    {photos.length > 1 && (
                      <div className="photo-indicators">
                        {photos.map((_, index) => (
                          <button
                            key={index}
                            className={`photo-dot ${index === currentPhotoIndex ? 'active' : ''}`}
                            onClick={() => setCurrentPhotoIndex(index)}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="no-photo-placeholder-large">
                    <span>No Photos Available</span>
                  </div>
                )}
              </div>

              {/* Station Header */}
              <div className="station-header">
                <h1 className="station-title">{station.name}</h1>
                <span className={`status-badge ${getStatusClass(station.status)}`}>
                  {station.status}
                </span>
              </div>

              {/* Rating */}
              <div className="station-rating-row">
                {renderStars(avgRating)}
                <span className="rating-value">{avgRating.toFixed(1)}</span>
                <span className="review-count">({reviewCount} reviews)</span>
              </div>

              {/* Address */}
              <p className="station-address">
                📍 {[station.address, station.city, station.district].filter(Boolean).join(', ')}
              </p>

              {/* Stats Cards */}
              <div className="station-stats">
                <div className="stat-card">
                  <span className="stat-value">{availableSlots}</span>
                  <span className="stat-label">AVAILABLE SLOTS</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{totalSlots}</span>
                  <span className="stat-label">TOTAL SLOTS</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value" style={{ color: getStatusColor(station.status) }}>
                    {station.status === 'Under Maintenance' ? 'Under' : station.status}
                  </span>
                  {station.status === 'Under Maintenance' && (
                    <span className="stat-value" style={{ color: getStatusColor(station.status), fontSize: '1rem' }}>
                      Maintenance
                    </span>
                  )}
                  <span className="stat-label">STATUS</span>
                </div>
              </div>

              {/* Description */}
              {station.description && (
                <div className="station-description">
                  <h3>Description</h3>
                  <p>{station.description}</p>
                </div>
              )}

              {/* Connectors */}
              <div className="connectors-section">
                <h3>Connectors</h3>
                <div className="connectors-grid">
                  {station.connectors?.map((connector, index) => (
                    <div key={index} className="connector-card">
                      <span className="connector-type">{connector.type}</span>
                      <span className="connector-power">⚡ {connector.powerKW} kW</span>
                      <div className="connector-slots">
                        <div
                          className="connector-slots-bar"
                          style={{ width: `${(connector.availableSlots / connector.totalSlots) * 100}%` }}
                        />
                      </div>
                      <span className="connector-slots-text">
                        {connector.availableSlots} / {connector.totalSlots} available
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Map & Reviews */}
            <div className="station-sidebar">
              {/* Location Map */}
              <div className="location-section">
                <h3>Location</h3>
                {lat && lng ? (
                  <div className="station-map-container">
                    <MapContainer
                      center={[lat, lng]}
                      zoom={15}
                      style={{ height: '200px', width: '100%', borderRadius: '12px' }}
                      scrollWheelZoom={false}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[lat, lng]}>
                        <Popup>{station.name}</Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                ) : (
                  <p className="no-location">Location not available</p>
                )}

                {/* Directions Button */}
                <button className="directions-btn" onClick={handleGetDirections}>
                  🧭 Get Directions
                </button>
                <button className="share-station-btn" type="button" onClick={handleShareStation}>
                  <FiShare2 aria-hidden="true" />
                  Share Station
                </button>
              </div>

              {/* Reviews Section */}
              <div className="reviews-section">
                <h3>Reviews <span className="review-badge">{reviewCount}</span></h3>

                {/* Add Review Form */}
                {user && (
                  <div className="add-review-form">
                    <p className="form-label">Your Rating</p>
                    <div className="rating-input">
                      {renderStars(userRating, true, setUserRating)}
                    </div>
                    <textarea
                      className="review-textarea"
                      placeholder="Share your experience (optional)..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={3}
                    />
                    <button
                      className="submit-review-btn"
                      onClick={handleSubmitReview}
                      disabled={submittingReview}
                    >
                      ⭐ {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                )}

                {/* Reviews List */}
                {reviews.length > 0 ? (
                  <div className="reviews-list">
                    {reviews.map((review) => (
                      <div key={review._id} className="review-item">
                        <div className="review-header">
                          <div className="review-author-block">
                            <span className="review-author">{review.user?.name || 'Anonymous'}</span>
                            {review.user?.email && (
                              <span className="review-author-email">{review.user.email}</span>
                            )}
                          </div>
                          <span className="review-rating">{renderStars(review.rating)}</span>
                        </div>
                        {review.comment && <p className="review-comment">{review.comment}</p>}
                        <span className="review-date">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-reviews">No reviews yet. Be the first!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default StationDetails
