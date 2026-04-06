import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import SearchBar from '../components/marketplace/SearchBar';
import FilterPanel from '../components/marketplace/FilterPanel';
import ProductCard from '../components/marketplace/ProductCard';
import ProductDetails from '../components/marketplace/ProductDetails';
import Cart from '../components/marketplace/Cart';
import useAuth from '../context/useAuth';
import '../styles/SolarMarketplace.css';

const CART_STORAGE_KEY = 'solarMarketplaceCart';
const WISHLIST_STORAGE_KEY = 'solarMarketplaceWishlist';
const PAGE_SIZE = 8;
const MARKETPLACE_PRICE_MIN = 0;
const MARKETPLACE_PRICE_MAX = 100000;
const PRODUCT_CATEGORIES = [
  'Solar Panels',
  'Batteries',
  'Inverters',
  'Charge Controllers',
  'Solar Lights',
  'Solar Cables',
  'Solar Kits',
];

const readStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error('Failed to read storage:', error);
    return fallback;
  }
};

const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to write storage:', error);
  }
};

function SolarMarketplace() {
  const location = useLocation();
  const { user, token } = useAuth();
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    categories: [],
    ratings: [],
    availability: [],
    brands: [],
    priceRange: { min: MARKETPLACE_PRICE_MIN, max: MARKETPLACE_PRICE_MAX },
  });
  const [sortBy, setSortBy] = useState('featured');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [page, setPage] = useState(1);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const priceBounds = useMemo(
    () => ({ min: MARKETPLACE_PRICE_MIN, max: MARKETPLACE_PRICE_MAX }),
    []
  );

  const categories = useMemo(() => PRODUCT_CATEGORIES, []);

  const brands = useMemo(() => {
    return Array.from(new Set(products.map(product => product.brand).filter(Boolean))).sort();
  }, [products]);

  const authConfig = useMemo(
    () => (token ? { headers: { Authorization: `Bearer ${token}` } } : null),
    [token]
  );

  useEffect(() => {
    setCartItems(readStorage(CART_STORAGE_KEY, []));
    setWishlist(readStorage(WISHLIST_STORAGE_KEY, []));
  }, []);

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const { data } = await axios.get('/api/products');
      setProducts(data?.products ?? []);
      setProductsError('');
    } catch (error) {
      console.error('Failed to load products', error);
      setProductsError('Unable to load marketplace products right now.');
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    const handleRefresh = () => fetchProducts();
    window.addEventListener('marketplace:products:updated', handleRefresh);
    return () => window.removeEventListener('marketplace:products:updated', handleRefresh);
  }, []);

  useEffect(() => {
    if (location.search.includes('cart=open')) {
      setIsCartOpen(true);
    }
  }, [location.search]);

  useEffect(() => {
    writeStorage(WISHLIST_STORAGE_KEY, wishlist);
  }, [wishlist]);

  const updateCart = updater => {
    setCartItems(prev => {
      const nextItems = typeof updater === 'function' ? updater(prev) : updater;
      writeStorage(CART_STORAGE_KEY, nextItems);
      window.dispatchEvent(new Event('cart:updated'));
      return nextItems;
    });
  };

  const handleToggleWishlist = id => {
    setWishlist(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));
  };

  const handleAddToCart = (product, quantity = 1) => {
    if (quantity < 1) return;
    const productId = product._id ?? product.id;
    updateCart(prev =>
      prev.some(item => item.id === productId)
        ? prev.map(item =>
            item.id === productId
              ? {
                  ...item,
                  quantity: Math.min(item.quantity + quantity, product.stockQuantity || quantity),
                }
              : item
          )
        : [...prev, { id: productId, quantity }]
    );
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id, quantity) => {
    const product = products.find(item => (item._id ?? item.id) === id);
    const maxQuantity = product ? product.stockQuantity ?? quantity : quantity;
    if (quantity <= 0) {
      updateCart(prev => prev.filter(item => item.id !== id));
      return;
    }
    const safeQuantity = Math.min(quantity, maxQuantity);
    updateCart(prev =>
      prev.map(item => (item.id === id ? { ...item, quantity: safeQuantity } : item))
    );
  };

  const handleRemoveItem = id => {
    updateCart(prev => prev.filter(item => item.id !== id));
  };

  const handleCheckout = () => {
    alert('Checkout flow not implemented in demo.');
  };

  const handleBuyNow = (product, quantity) => {
    handleAddToCart(product, quantity);
    setIsCartOpen(true);
  };

  const handleResetFilters = () => {
    setFilters({
      categories: [],
      ratings: [],
      availability: [],
      brands: [],
      priceRange: { min: MARKETPLACE_PRICE_MIN, max: MARKETPLACE_PRICE_MAX },
    });
  };

  const handlePriceChange = nextRange => {
    setFilters(prev => {
      const max = Math.min(MARKETPLACE_PRICE_MAX, Math.max(MARKETPLACE_PRICE_MIN, nextRange.max));
      return { ...prev, priceRange: { min: MARKETPLACE_PRICE_MIN, max } };
    });
  };

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const minRating = filters.ratings.length ? Math.min(...filters.ratings) : 0;

    return products.filter(product => {
      const matchesQuery =
        !normalizedQuery ||
        product.name?.toLowerCase().includes(normalizedQuery) ||
        product.category?.toLowerCase().includes(normalizedQuery) ||
        product.shortDescription?.toLowerCase().includes(normalizedQuery) ||
        product.fullDescription?.toLowerCase().includes(normalizedQuery) ||
        product.brand?.toLowerCase().includes(normalizedQuery);

      const matchesCategory =
        filters.categories.length === 0 || filters.categories.includes(product.category);

      const matchesPrice =
        Number(product.price) >= filters.priceRange.min &&
        Number(product.price) <= filters.priceRange.max;

      const matchesRating = Number(product.rating) >= minRating;

      const availability =
        product.availabilityStatus || (product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock');
      const matchesAvailability =
        filters.availability.length === 0 ||
        (filters.availability.includes('in') && availability === 'In Stock') ||
        (filters.availability.includes('out') && availability === 'Out of Stock');

      const matchesBrand =
        filters.brands.length === 0 || filters.brands.includes(product.brand);

      return (
        matchesQuery &&
        matchesCategory &&
        matchesPrice &&
        matchesRating &&
        matchesAvailability &&
        matchesBrand
      );
    });
  }, [products, query, filters]);

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case 'price-low':
        return list.sort((a, b) => a.price - b.price);
      case 'price-high':
        return list.sort((a, b) => b.price - a.price);
      case 'rating':
        return list.sort((a, b) => b.rating - a.rating);
      case 'newest':
        return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      default:
        return list;
    }
  }, [filteredProducts, sortBy]);

  useEffect(() => {
    setPage(1);
  }, [query, filters, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const relatedProducts = useMemo(() => {
    if (!selectedProduct) return [];
    return products
      .filter(
        product =>
          product.category === selectedProduct.category &&
          (product._id ?? product.id) !== (selectedProduct._id ?? selectedProduct.id)
      )
      .slice(0, 3);
  }, [products, selectedProduct]);

  const handleViewDetails = product => {
    setSelectedProductId(product._id ?? product.id);
    setDetailsError('');
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!selectedProductId) {
        setSelectedProduct(null);
        return;
      }
      try {
        setDetailsLoading(true);
        const { data } = await axios.get(`/api/products/${selectedProductId}`);
        setSelectedProduct(data?.product ?? null);
        setDetailsError('');
      } catch (error) {
        console.error('Failed to load product details', error);
        setDetailsError('Unable to load product details.');
      } finally {
        setDetailsLoading(false);
      }
    };
    fetchProductDetails();
  }, [selectedProductId]);

  const handleUpdateProduct = async payload => {
    if (!authConfig || !selectedProduct) return;
    try {
      const productId = selectedProduct._id ?? selectedProduct.id;
      const { data } = await axios.put(`/api/products/${productId}`, payload, authConfig);
      const updated = data?.product ?? selectedProduct;
      setSelectedProduct(updated);
      setProducts(prev =>
        prev.map(item => ((item._id ?? item.id) === productId ? updated : item))
      );
      window.dispatchEvent(new Event('marketplace:products:updated'));
    } catch (error) {
      console.error('Failed to update product', error);
      setDetailsError(error?.response?.data?.message ?? 'Failed to update product.');
    }
  };

  const handleDeleteProduct = async () => {
    if (!authConfig || !selectedProduct) return;
    if (!window.confirm('Delete this product listing?')) return;
    try {
      const productId = selectedProduct._id ?? selectedProduct.id;
      await axios.delete(`/api/products/${productId}`, authConfig);
      setProducts(prev => prev.filter(item => (item._id ?? item.id) !== productId));
      setSelectedProduct(null);
      setSelectedProductId(null);
      window.dispatchEvent(new Event('marketplace:products:updated'));
    } catch (error) {
      console.error('Failed to delete product', error);
      setDetailsError(error?.response?.data?.message ?? 'Failed to delete product.');
    }
  };

  const handleAddReview = async payload => {
    if (!authConfig || !selectedProduct) {
      throw new Error('Please sign in to add a review.');
    }

    try {
      setReviewSubmitting(true);
      const productId = selectedProduct._id ?? selectedProduct.id;
      const { data } = await axios.post(`/api/products/${productId}/reviews`, payload, authConfig);
      const updated = data?.product ?? selectedProduct;

      setSelectedProduct(updated);
      setProducts(prev => prev.map(item => ((item._id ?? item.id) === productId ? updated : item)));
      window.dispatchEvent(new Event('marketplace:products:updated'));
      setDetailsError('');
    } catch (error) {
      const message = error?.response?.data?.message ?? 'Failed to add review.';
      setDetailsError(message);
      throw new Error(message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="page-layout marketplace-page">
      <Navbar forceSolid />
      <main className="page-content">
        <div className="marketplace-container">
          <div className="marketplace-hero">
            <span className="section-tag">Solar Marketplace</span>
            <h1 className="page-title">Solar Equipment Marketplace</h1>
            <p className="page-subtitle">
              Buy and sell solar panels, batteries and solar accessories. Curated products with
              transparent specs, reviews, and stock availability.
            </p>
          </div>

          <div className="marketplace-search-card">
            <SearchBar value={query} onChange={setQuery} onSubmit={event => event.preventDefault()} />
          </div>

          <div className="marketplace-layout">
            <FilterPanel
              categories={categories}
              brands={brands}
              filters={filters}
              priceBounds={priceBounds}
              onToggleCategory={category =>
                setFilters(prev => ({
                  ...prev,
                  categories: prev.categories.includes(category)
                    ? prev.categories.filter(item => item !== category)
                    : [...prev.categories, category],
                }))
              }
              onToggleAvailability={availability =>
                setFilters(prev => ({
                  ...prev,
                  availability: prev.availability.includes(availability)
                    ? prev.availability.filter(item => item !== availability)
                    : [...prev.availability, availability],
                }))
              }
              onToggleRating={rating =>
                setFilters(prev => ({
                  ...prev,
                  ratings: prev.ratings.includes(rating)
                    ? prev.ratings.filter(item => item !== rating)
                    : [...prev.ratings, rating],
                }))
              }
              onToggleBrand={brand =>
                setFilters(prev => ({
                  ...prev,
                  brands: prev.brands.includes(brand)
                    ? prev.brands.filter(item => item !== brand)
                    : [...prev.brands, brand],
                }))
              }
              onPriceChange={handlePriceChange}
              onReset={handleResetFilters}
            />

            <section className="marketplace-panel marketplace-products">
              <div className="marketplace-toolbar">
                <div>
                  <h3>Product Listing</h3>
                  <p>{sortedProducts.length} items available</p>
                </div>
                <div className="marketplace-toolbar__actions">
                  <button
                    type="button"
                    className="marketplace-btn marketplace-btn--ghost"
                    onClick={() => setIsCartOpen(true)}
                  >
                    View Cart ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
                  </button>
                  <div className="sort-control">
                    <span>Sort by</span>
                    <select value={sortBy} onChange={event => setSortBy(event.target.value)}>
                      <option value="featured">Featured</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                      <option value="newest">Newest Items</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="marketplace-products-grid">
                {productsLoading ? (
                  <div className="marketplace-empty">
                    <p>Loading products…</p>
                  </div>
                ) : productsError ? (
                  <div className="marketplace-empty">
                    <p>{productsError}</p>
                  </div>
                ) : paginatedProducts.length === 0 ? (
                  <div className="marketplace-empty">
                    <p>No products match your filters.</p>
                  </div>
                ) : (
                  paginatedProducts.map(product => (
                    <ProductCard
                      key={product._id ?? product.id}
                      product={product}
                      onViewDetails={handleViewDetails}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={handleToggleWishlist}
                      isWishlisted={wishlist.includes(product._id ?? product.id)}
                    />
                  ))
                )}
              </div>

              <div className="marketplace-pagination">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                >
                  Previous
                </button>
                <div className="pagination-pages">
                  {Array.from({ length: totalPages }, (_, idx) => {
                    const pageNumber = idx + 1;
                    return (
                      <button
                        key={pageNumber}
                        type="button"
                        className={pageNumber === currentPage ? 'active' : ''}
                        onClick={() => setPage(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                >
                  Next
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />

      <ProductDetails
        product={selectedProduct}
        relatedProducts={relatedProducts}
        onClose={() => {
          setSelectedProduct(null);
          setSelectedProductId(null);
        }}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={
          selectedProduct ? wishlist.includes(selectedProduct._id ?? selectedProduct.id) : false
        }
        loading={detailsLoading}
        error={detailsError}
        canEdit={
          Boolean(selectedProduct && user && user.role?.toLowerCase() === 'admin')
        }
        onUpdate={handleUpdateProduct}
        onDelete={handleDeleteProduct}
        canReview={Boolean(user && token && user.role?.toLowerCase() === 'user')}
        onAddReview={handleAddReview}
        reviewSubmitting={reviewSubmitting}
      />

      <Cart
        isOpen={isCartOpen}
        items={cartItems}
        products={products}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveItem}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />
    </div>
  );
}

export default SolarMarketplace;
