import PropTypes from 'prop-types';
import { getPrimaryImageUrl, handleProductImageError } from '../../utils/productImage';
import { formatLKR } from '../../utils/currency';

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

function ProductCard({
  product,
  onViewDetails,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
}) {
  const inStock = product.availabilityStatus
    ? product.availabilityStatus === 'In Stock'
    : product.stockQuantity > 0;

  const handleCardClick = () => {
    onViewDetails(product);
  };

  const handleButtonClick = (event, action) => {
    event.stopPropagation();
    action();
  };

  const handleKeyDown = event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardClick();
    }
  };

  const description = product.shortDescription || product.fullDescription || '';

  return (
    <article
      className="product-card"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="product-card__media">
        <img
          src={getPrimaryImageUrl(product)}
          alt={product.name}
          loading="lazy"
          onError={handleProductImageError}
        />
        <span className="product-card__category">{product.category}</span>
        <button
          type="button"
          className={`product-card__wishlist ${isWishlisted ? 'is-active' : ''}`}
          onClick={event => handleButtonClick(event, () => onToggleWishlist(product.id))}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          ♥
        </button>
      </div>

      <div className="product-card__body">
        <h3 className="product-card__title">{product.name}</h3>
        <p className="product-card__desc">{description}</p>

        <div className="product-card__rating">
          <div className="rating-stars">{renderStars(product.rating)}</div>
          <span className="rating-value">{product.rating.toFixed(1)}</span>
        </div>

        <div className="product-card__meta">
          <span className="product-card__price">{formatLKR(product.price)}</span>
          <span className={`availability-pill ${inStock ? 'in-stock' : 'out-stock'}`}>
            {inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
      </div>

      <div className="product-card__actions">
        <button
          type="button"
          className="marketplace-btn marketplace-btn--ghost"
          onClick={event => handleButtonClick(event, () => onViewDetails(product))}
        >
          View Details
        </button>
        <button
          type="button"
          className="marketplace-btn marketplace-btn--primary"
          onClick={event => handleButtonClick(event, () => onAddToCart(product, 1))}
          disabled={!inStock}
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string,
    _id: PropTypes.string,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    category: PropTypes.string.isRequired,
    rating: PropTypes.number.isRequired,
    shortDescription: PropTypes.string.isRequired,
    fullDescription: PropTypes.string,
    imageUrls: PropTypes.arrayOf(PropTypes.string).isRequired,
    stockQuantity: PropTypes.number,
    availabilityStatus: PropTypes.string,
  }).isRequired,
  onViewDetails: PropTypes.func.isRequired,
  onAddToCart: PropTypes.func.isRequired,
  onToggleWishlist: PropTypes.func.isRequired,
  isWishlisted: PropTypes.bool.isRequired,
};

export default ProductCard;
