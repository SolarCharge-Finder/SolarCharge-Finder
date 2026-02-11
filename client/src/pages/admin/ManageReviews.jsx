import { useEffect, useState } from 'react'
import axios from 'axios'
import AdminSidebar from '../../components/admin/AdminSidebar'
import '../../styles/admin.css'

function ManageReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true)
        const { data } = await axios.get('/api/reviews')
        setReviews(data)
        setError('')
      } catch (err) {
        console.error('Failed to load reviews', err)
        setError('Unable to load reviews. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [])

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return
    try {
      await axios.delete(`/api/reviews/${reviewId}`)
      setReviews((prev) => prev.filter((review) => (review.id ?? review._id) !== reviewId))
    } catch (err) {
      console.error('Delete failed', err)
      alert('Unable to delete review right now.')
    }
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
            <p className="admin-card__title">Admin Panel</p>
            <h1>Manage Reviews</h1>
            <p className="admin-card__title">Admin can remove inappropriate reviews</p>
          </div>
        </header>

        {loading && <p className="admin-card__title">Loading reviews...</p>}
        {error && !loading && <p className="admin-card__change" style={{ color: '#ef4444' }}>{error}</p>}

        {!loading && !error && (
          <div className="admin-card-list">
            {reviews.map((review) => {
              const reviewId = review.id ?? review._id
              return (
                <article key={reviewId} className="review-card">
                  <div className="review-card__meta">
                    <div>
                      <p className="admin-card__title">Station</p>
                      <h3>{review.stationName}</h3>
                      <p className="admin-card__title">by {review.userName}</p>
                    </div>
                    <div className="review-card__stars">{renderStars(Number(review.rating))}</div>
                  </div>
                  <p style={{ marginTop: '1rem', color: 'var(--admin-muted)' }}>{review.comment}</p>
                  <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                    <button className="admin-button admin-button--danger" onClick={() => handleDelete(reviewId)}>
                      Delete review
                    </button>
                  </div>
                </article>
              )
            })}
            {!reviews.length && <div className="admin-empty-state">No reviews available.</div>}
          </div>
        )}
      </main>
    </div>
  )
}

export default ManageReviews
