import PropTypes from 'prop-types';
import { getPrimaryImageUrl, handleProductImageError } from '../../utils/productImage';
import { formatLKR } from '../../utils/currency';

function Cart({ isOpen, items, products, onUpdateQuantity, onRemove, onClose, onCheckout }) {
  const cartItems = items
    .map(item => {
      const product = products.find(prod => (prod._id ?? prod.id) === item.id);
      if (!product) return null;
      return { ...product, quantity: item.quantity };
    })
    .filter(Boolean);

  const total = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  return (
    <div
      className={`marketplace-cart-backdrop ${isOpen ? 'open' : ''}`}
      onClick={onClose}
      role="presentation"
    >
      <div className="marketplace-cart" onClick={event => event.stopPropagation()}>
        <div className="cart-header">
          <div>
            <h3>Your Cart</h3>
            <p>{cartItems.length} items ready for checkout.</p>
          </div>
          <button type="button" className="cart-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <p>Your cart is empty.</p>
            <button type="button" className="marketplace-btn marketplace-btn--ghost" onClick={onClose}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map(item => (
                <div key={item.id} className="cart-item">
                  <img
                    src={getPrimaryImageUrl(item)}
                    alt={item.name}
                    onError={handleProductImageError}
                  />
                  <div className="cart-item__info">
                    <strong>{item.name}</strong>
                    <span>{formatLKR(item.price)}</span>
                    <div className="quantity-control">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="cart-item__actions">
                    <span>{formatLKR(Number(item.price) * item.quantity)}</span>
                    <button type="button" onClick={() => onRemove(item.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="cart-total">
                <span>Total</span>
                <strong>{formatLKR(total)}</strong>
              </div>
              <button type="button" className="marketplace-btn marketplace-btn--primary" onClick={onCheckout}>
                Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

Cart.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      quantity: PropTypes.number.isRequired,
    })
  ).isRequired,
  products: PropTypes.arrayOf(PropTypes.object).isRequired,
  onUpdateQuantity: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onCheckout: PropTypes.func.isRequired,
};

export default Cart;
