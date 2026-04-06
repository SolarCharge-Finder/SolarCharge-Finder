import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuth from '../../context/useAuth';
import ProductForm from './ProductForm';
import { getPrimaryImageUrl, handleProductImageError } from '../../utils/productImage';
import { formatLKR } from '../../utils/currency';
import './ProductSellRequest.css';

function ProductSellRequest() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);

  const authConfig = useMemo(
    () => (token ? { headers: { Authorization: `Bearer ${token}` } } : null),
    [token]
  );

  const fetchMyProducts = async () => {
    if (!authConfig) {
      setProducts([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data } = await axios.get('/api/products/mine', authConfig);
      setProducts(data?.products ?? []);
      setError('');
    } catch (err) {
      console.error('Failed to load products', err);
      setError('Unable to load your listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, [token]);

  const handleCreate = async payload => {
    if (!authConfig) return;
    try {
      setError('');
      setSubmitting(true);
      await axios.post('/api/products', payload, authConfig);
      window.dispatchEvent(new Event('marketplace:products:updated'));
      navigate('/shop');
    } catch (err) {
      console.error('Create product failed', err);
      setError(err?.response?.data?.message ?? 'Failed to create product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async payload => {
    if (!authConfig || !editingProduct) return;
    try {
      setError('');
      setSubmitting(true);
      const { data } = await axios.put(`/api/products/${editingProduct._id}`, payload, authConfig);
      const updated = data?.product ?? editingProduct;
      setProducts(prev =>
        prev.map(item => ((item._id ?? item.id) === updated._id ? updated : item))
      );
      window.dispatchEvent(new Event('marketplace:products:updated'));
      setEditingProduct(null);
    } catch (err) {
      console.error('Update product failed', err);
      setError(err?.response?.data?.message ?? 'Failed to update product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async productId => {
    if (!authConfig) return;
    if (!window.confirm('Delete this product listing?')) return;
    try {
      await axios.delete(`/api/products/${productId}`, authConfig);
      setProducts(prev => prev.filter(item => (item._id ?? item.id) !== productId));
      window.dispatchEvent(new Event('marketplace:products:updated'));
    } catch (err) {
      console.error('Delete product failed', err);
      setError(err?.response?.data?.message ?? 'Failed to delete product.');
    }
  };

  if (!token) {
    return (
      <div className="product-sell__empty">
        <p>Please sign in to create a product listing.</p>
      </div>
    );
  }

  return (
    <div className="product-sell">
      <div className="product-sell__intro">
        <div>
          <h2>Create a Solar Product Listing</h2>
          <p>
            Share solar gear with the community. Listings go live immediately in the marketplace.
          </p>
        </div>
        <span className="product-sell__chip">Signed in as {user?.name ?? user?.email}</span>
      </div>

      {error && <div className="product-sell__alert">{error}</div>}

      <ProductForm submitLabel="Submit Listing" onSubmit={handleCreate} loading={submitting} />

      <div className="product-sell__list">
        <div className="product-sell__list-header">
          <h3>Your Listings</h3>
          <button type="button" className="user-button user-button--ghost" onClick={fetchMyProducts}>
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="product-sell__helper">Loading your listings…</p>
        ) : products.length === 0 ? (
          <p className="product-sell__helper">No products listed yet.</p>
        ) : (
          <div className="product-sell__grid">
            {products.map(item => (
              <div key={item._id ?? item.id} className="product-sell__card">
                <img
                  src={getPrimaryImageUrl(item)}
                  alt={item.name}
                  onError={handleProductImageError}
                />
                <div className="product-sell__card-body">
                  <div>
                    <h4>{item.name}</h4>
                    <p>{item.shortDescription}</p>
                  </div>
                  <div className="product-sell__meta">
                    <span>{formatLKR(item.price)}</span>
                    <span>{item.availabilityStatus}</span>
                  </div>
                  <div className="product-sell__actions">
                    <button
                      type="button"
                      className="user-button user-button--ghost"
                      onClick={() => setEditingProduct(item)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="user-button user-button--danger"
                      onClick={() => handleDelete(item._id ?? item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingProduct && (
        <div className="product-sell__edit">
          <div className="product-sell__edit-header">
            <h3>Edit Listing</h3>
            <button
              type="button"
              className="user-button user-button--ghost"
              onClick={() => setEditingProduct(null)}
            >
              Close
            </button>
          </div>
          <ProductForm
            initialValues={editingProduct}
            submitLabel="Save Changes"
            onSubmit={handleUpdate}
            onCancel={() => setEditingProduct(null)}
            showCancel
            loading={submitting}
          />
        </div>
      )}
    </div>
  );
}

export default ProductSellRequest;
