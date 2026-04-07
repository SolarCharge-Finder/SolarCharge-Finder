import { useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ProductForm from './ProductForm';
import { formatLKR } from '../../utils/currency';
import {
  getPrimaryImageUrl,
  handleProductImageError,
  normalizeImageUrl,
} from '../../utils/productImage';

const renderStars = rating => {
  return Array.from({ length: 5 }, (_, idx) => {
    const filled = idx < Math.round(rating);
    return (
      <span key={idx} className={`star ${filled ? 'star-filled' : 'star-muted'}`}>
        ★
      </span>
    );
  });
};

const formatDiscount = discountValue => {
  if (!discountValue) return 0;
  const numeric = Number(discountValue);
  if (Number.isNaN(numeric)) return 0;
  return numeric > 1 ? numeric : numeric * 100;
};

const normalizeSpecs = specs => {
  if (!specs) return {};
  if (typeof specs === 'object') return specs;
  const lines = String(specs)
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
  const specObj = {};
  lines.forEach(line => {
    const [key, ...rest] = line.split(':');
    if (!rest.length) return;
    specObj[key.trim()] = rest.join(':').trim();
  });
  return Object.keys(specObj).length ? specObj : { Details: String(specs) };
};

function ProductDetails({
  product,
  relatedProducts,
  onClose,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted,
  loading,
  error,
  canEdit,
  onUpdate,
  onDelete,
  canReview,
  onAddReview,
  reviewSubmitting,
}) {
  const gallery = useMemo(() => {
    if (!product) return [];
    const images = product.imageUrls?.length ? product.imageUrls.map(normalizeImageUrl) : [];
    if (images.length) return images;
    return [getPrimaryImageUrl(product)];
  }, [product]);

  const [activeImage, setActiveImage] = useState(gallery[0]);
  const [quantity, setQuantity] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    setActiveImage(gallery[0] || getPrimaryImageUrl(product));
    setQuantity(1);
    setReviewRating(0);
    setReviewComment('');
    setReviewError('');
  }, [gallery, product]);

  if (!product && !loading) return null;

  if (loading) {
    return (
      <div className="marketplace-modal-backdrop" onClick={onClose} role="presentation">
        <div className="marketplace-modal" onClick={event => event.stopPropagation()} role="dialog">
          <button type="button" className="marketplace-modal__close" onClick={onClose}>
            ✕
          </button>
          <p>Loading product details…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="marketplace-modal-backdrop" onClick={onClose} role="presentation">
        <div className="marketplace-modal" onClick={event => event.stopPropagation()} role="dialog">
          <button type="button" className="marketplace-modal__close" onClick={onClose}>
            ✕
          </button>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const inStock = product.availabilityStatus
    ? product.availabilityStatus === 'In Stock'
    : product.stockQuantity > 0;
  const discountPercent = formatDiscount(product.discount);
  const specs = normalizeSpecs(product.technicalSpecifications);

  const handleQuantityChange = next => {
    if (next < 1) return;
    if (product.stockQuantity && next > product.stockQuantity) return;
    setQuantity(next);
  };

  const handleSubmitReview = async event => {
    event.preventDefault();
    if (!canReview) return;
    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      setReviewError('Please choose a rating between 1 and 5.');
      return;
    }

    try {
      setReviewError('');
      await onAddReview({ rating: reviewRating, comment: reviewComment.trim() });
      setReviewRating(0);
      setReviewComment('');
    } catch (error) {
      setReviewError(error?.message || 'Failed to add review.');
    }
  };

  return (
    <div className="marketplace-modal-backdrop" onClick={onClose} role="presentation">
      <div className="marketplace-modal" onClick={event => event.stopPropagation()} role="dialog">
        <button type="button" className="marketplace-modal__close" onClick={onClose}>
          ✕
        </button>
        {isEditing ? (
          <div className="marketplace-modal__edit">
            <div className="marketplace-modal__edit-header">
              <h2>Edit Listing</h2>
              <button
                type="button"
                className="marketplace-btn marketplace-btn--ghost"
                onClick={() => setIsEditing(false)}
              >
                Back to details
              </button>
            </div>
            <ProductForm
              initialValues={product}
              submitLabel="Save Changes"
              onSubmit={async payload => {
                await onUpdate(payload);
                setIsEditing(false);
              }}
              onCancel={() => setIsEditing(false)}
              showCancel
            />
          </div>
        ) : (
          <>
            <div className="marketplace-modal__content">
              <div className="marketplace-modal__gallery">
                <img src={normalizeImageUrl(activeImage)} alt={product.name} onError={handleProductImageError} />
                <div className="marketplace-modal__thumbs">
                  {gallery.map((img, idx) => (
                    <button
                      type="button"
                      key={`${product._id ?? product.id}-${idx}`}
                      className={`thumb ${img === activeImage ? 'active' : ''}`}
                      onClick={() => setActiveImage(img)}
                    >
                      <img
                        src={normalizeImageUrl(img)}
                        alt={`${product.name} ${idx + 1}`}
                        onError={handleProductImageError}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="marketplace-modal__info">
                <div className="modal-header">
                  <div>
                    <span className="modal-category">{product.category}</span>
                    <h2>{product.name}</h2>
                  </div>
                  <div className="modal-header__actions">
                    <button
                      type="button"
                      className={`product-card__wishlist ${isWishlisted ? 'is-active' : ''}`}
                      onClick={() => onToggleWishlist(product._id ?? product.id)}
                      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      ♥
                    </button>
                    {canEdit && (
                      <button
                        type="button"
                        className="marketplace-btn marketplace-btn--ghost"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit
                      </button>
                    )}
                    {canEdit && (
                      <button
                        type="button"
                        className="marketplace-btn marketplace-btn--ghost"
                        onClick={onDelete}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                <div className="modal-rating">
                  <div className="rating-stars">{renderStars(product.rating)}</div>
                  <span className="rating-value">{Number(product.rating).toFixed(1)}</span>
                </div>

                <p className="modal-description">{product.fullDescription}</p>

                <div className="modal-price">
                  <span className="price">{formatLKR(product.price)}</span>
                  {discountPercent > 0 && (
                    <span className="discount">Save {discountPercent.toFixed(0)}%</span>
                  )}
                  <span className={`availability-pill ${inStock ? 'in-stock' : 'out-stock'}`}>
                    {inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                  {product.stockQuantity !== undefined && (
                    <span className="stock-count">{product.stockQuantity} units</span>
                  )}
                </div>

                <div className="modal-quantity">
                  <span>Quantity</span>
                  <div className="quantity-control">
                    <button type="button" onClick={() => handleQuantityChange(quantity - 1)}>
                      -
                    </button>
                    <span>{quantity}</span>
                    <button type="button" onClick={() => handleQuantityChange(quantity + 1)}>
                      +
                    </button>
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="marketplace-btn marketplace-btn--primary"
                    onClick={() => onAddToCart(product, quantity)}
                    disabled={!inStock}
                  >
                    Add to Cart
                  </button>
                  <button
                    type="button"
                    className="marketplace-btn marketplace-btn--ghost"
                    onClick={() => onBuyNow(product, quantity)}
                    disabled={!inStock}
                  >
                    Buy Now
                  </button>
                </div>

                <div className="modal-specs">
                  <h3>Technical Specifications</h3>
                  <div className="specs-grid">
                    {Object.entries(specs).map(([key, value]) => (
                      <div key={key} className="spec-item">
                        <span>{key}</span>
                        <strong>{value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="marketplace-modal__extras">
              <div className="modal-reviews">
                <h3>Customer Reviews</h3>
                {canReview && (
                  <form className="review-card" onSubmit={handleSubmitReview}>
                    <div className="review-header">
                      <strong>Add your review</strong>
                      <div className="rating-stars">
                        {Array.from({ length: 5 }, (_, idx) => {
                          const starValue = idx + 1;
                          return (
                            <button
                              key={`review-star-${starValue}`}
                              type="button"
                              className={`product-form__star ${reviewRating >= starValue ? 'is-active' : ''}`}
                              onClick={() => setReviewRating(starValue)}
                            >
                              ★
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <textarea
                      rows={3}
                      className="product-form__textarea"
                      placeholder="Share your experience with this product (optional)"
                      value={reviewComment}
                      onChange={event => setReviewComment(event.target.value)}
                    />
                    {reviewError && <p className="product-form__error">{reviewError}</p>}
                    <div className="modal-actions" style={{ marginTop: '0.75rem' }}>
                      <button
                        type="submit"
                        className="marketplace-btn marketplace-btn--primary"
                        disabled={reviewSubmitting}
                      >
                        {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </div>
                  </form>
                )}
                <div className="reviews-list">
                  {(product.reviews || []).map((review, idx) => (
                    <div key={`${product._id ?? product.id}-review-${idx}`} className="review-card">
                      <div className="review-header">
                        <strong>{review.name}</strong>
                        <div className="rating-stars">{renderStars(review.rating)}</div>
                      </div>
                      <p>{review.comment}</p>
                    </div>
                  ))}
                  {!product.reviews?.length && (
                    <div className="review-card">
                      <p>No reviews yet. Be the first to rate this product.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-related">
                <h3>Related Products</h3>
                <div className="related-grid">
                  {relatedProducts.map(item => (
                    <div key={item._id ?? item.id} className="related-card">
                      <img
                        src={getPrimaryImageUrl(item)}
                        alt={item.name}
                        onError={handleProductImageError}
                      />
                      <div>
                        <span>{item.name}</span>
                        <strong>{formatLKR(item.price)}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

ProductDetails.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string,
    _id: PropTypes.string,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    category: PropTypes.string.isRequired,
    rating: PropTypes.number.isRequired,
    fullDescription: PropTypes.string.isRequired,
    imageUrls: PropTypes.arrayOf(PropTypes.string).isRequired,
    stockQuantity: PropTypes.number,
    availabilityStatus: PropTypes.string,
    discount: PropTypes.number,
    technicalSpecifications: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    reviews: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        rating: PropTypes.number.isRequired,
        comment: PropTypes.string.isRequired,
      })
    ),
  }),
  relatedProducts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      _id: PropTypes.string,
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      imageUrls: PropTypes.arrayOf(PropTypes.string),
    })
  ).isRequired,
  onClose: PropTypes.func.isRequired,
  onAddToCart: PropTypes.func.isRequired,
  onBuyNow: PropTypes.func.isRequired,
  onToggleWishlist: PropTypes.func.isRequired,
  isWishlisted: PropTypes.bool.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  canEdit: PropTypes.bool,
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func,
  canReview: PropTypes.bool,
  onAddReview: PropTypes.func,
  reviewSubmitting: PropTypes.bool,
};

ProductDetails.defaultProps = {
  product: null,
  loading: false,
  error: '',
  canEdit: false,
  onUpdate: () => {},
  onDelete: () => {},
  canReview: false,
  onAddReview: async () => {},
  reviewSubmitting: false,
};

export default ProductDetails;
