import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import AdminSidebar from '../../components/admin/AdminSidebar'
import '../../styles/admin.css'
import useAuth from '../../context/useAuth'
import { Link } from 'react-router-dom'

const normalizeReviews = (list = []) =>
  list.map((review) => ({
    ...review,
    stationName: review.stationName ?? review.station?.name ?? 'Unknown station',
    userName:
      review.userName ??
      review.user?.name ??
      review.user?.email ??
      'Anonymous user',
  }))

function ManageReviews() {
  const { token } = useAuth()
  const authConfig = useMemo(() => {
    if (!token) return null
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  }, [token])

  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedStations, setExpandedStations] = useState(new Set())

  useEffect(() => {
    const fetchReviews = async () => {
      if (!authConfig) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const response = await axios.get('/api/reviews', authConfig)
        const reviewList = response.data?.data ?? response.data ?? []
        setReviews(normalizeReviews(reviewList))
        setError('')
      } catch (err) {
        console.error('Failed to load reviews', err)
        setError('Unable to load reviews. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [authConfig])

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return

    if (!authConfig) {
      alert('Admin authentication required.')
      return
    }
    try {
      await axios.delete(`/api/reviews/${reviewId}`, authConfig)
      setReviews((prev) => prev.filter((review) => (review.id ?? review._id) !== reviewId))
    } catch (err) {
      console.error('Delete failed', err)
      alert('Unable to delete review right now.')
    }
  }

  const toggleStation = (stationId) => {
    setExpandedStations((prev) => {
      const next = new Set(prev)
      if (next.has(stationId)) next.delete(stationId)
      else next.add(stationId)
      return next
    })
  }

  const renderStars = (rating = 0) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={index < rating ? 'review-card__star' : 'review-card__star review-card__star--muted'}>
        ★
      </span>
    ))
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <header className="admin-header">
          <div>
            <Link to="/" className="admin-back-link">
              ← Home
            </Link>
            <p className="admin-card__title">Admin Panel</p>
            <h1>Manage Reviews</h1>
            <p className="admin-card__title">Admin can remove inappropriate reviews</p>
          </div>
        </header>

        {loading && <p className="admin-card__title">Loading reviews...</p>}
        {error && !loading && <p className="admin-card__change" style={{ color: '#ef4444' }}>{error}</p>}

        {!loading && !error && (
          <div className="admin-reviews-by-station">
            {(() => {
              const byStation = reviews.reduce((acc, review) => {
                const sid = String(review.station?._id ?? review.station?.id ?? review.station ?? 'unknown')
                if (!acc[sid]) acc[sid] = { stationName: review.stationName, reviews: [] }
                acc[sid].reviews.push(review)
                return acc
              }, {})
              const entries = Object.entries(byStation)
              if (!entries.length) return <div className="admin-empty-state">No reviews available.</div>
              return entries.map(([stationId, { stationName, reviews: stationReviews }]) => {
                const isExpanded = expandedStations.has(stationId)
                return (
                <div key={stationId} className="admin-station-reviews-block">
                  <button
                    type="button"
                    className="admin-station-reviews-block__header"
                    onClick={() => toggleStation(stationId)}
                    aria-expanded={isExpanded}
                  >
                    <span className="admin-station-reviews-block__chevron" aria-hidden>
                      {isExpanded ? '▼' : '▶'}
                    </span>
                    <h3 className="admin-station-reviews-block__title">{stationName}</h3>
                    <span className="admin-station-reviews-block__count">({stationReviews.length})</span>
                  </button>
                  {isExpanded && (
                  <div className="admin-card-list">
                    {stationReviews.map((review) => {
                      const reviewId = review.id ?? review._id
                      return (
                        <article key={reviewId} className="review-card">
                          <div className="review-card__meta">
                            <div>
                              <p className="admin-card__title">by {review.userName}</p>
                            </div>
                            <div className="review-card__stars">{renderStars(Number(review.rating))}</div>
                          </div>
                          {review.comment && (
                            <p style={{ marginTop: '0.75rem', color: 'var(--admin-muted)' }}>{review.comment}</p>
                          )}
                          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                            <button className="admin-button admin-button--danger" onClick={() => handleDelete(reviewId)}>
                              Delete
                            </button>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                  )}
                </div>
                )
              })
            })()}
          </div>
        )}
      </main>
    </div>
  )
}

export default ManageReviews
