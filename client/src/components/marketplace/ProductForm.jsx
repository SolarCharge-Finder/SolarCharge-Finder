import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import useAuth from '../../context/useAuth';
import {
  isLikelyDirectImageUrl,
  normalizeImageUrl,
  normalizeImageUrls,
} from '../../utils/productImage';
import './ProductForm.css';

const CATEGORIES = [
  'Solar Panels',
  'Batteries',
  'Inverters',
  'Charge Controllers',
  'Solar Lights',
  'Solar Cables',
  'Solar Kits',
];

const buildInitialState = initialValues => ({
  name: initialValues?.name ?? '',
  shortDescription: initialValues?.shortDescription ?? '',
  fullDescription: initialValues?.fullDescription ?? '',
  category: initialValues?.category ?? CATEGORIES[0],
  price: initialValues?.price ?? '',
  discount: initialValues?.discount ?? '',
  rating: initialValues?.rating ?? 0,
  stockQuantity: initialValues?.stockQuantity ?? 0,
  availabilityStatus: initialValues?.availabilityStatus ?? 'In Stock',
  brand: initialValues?.brand ?? '',
  technicalSpecifications: initialValues?.technicalSpecifications ?? '',
  imageUrls: initialValues?.imageUrls ?? [],
});

const parseSpecs = rawSpecs => {
  if (!rawSpecs) return {};
  if (typeof rawSpecs === 'object') return rawSpecs;
  const text = String(rawSpecs);
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  const specs = {};
  let hasPairs = false;
  lines.forEach(line => {
    const [key, ...rest] = line.split(':');
    if (!rest.length) return;
    specs[key.trim()] = rest.join(':').trim();
    hasPairs = true;
  });

  return hasPairs ? specs : text.trim();
};

const stringifySpecs = specs => {
  if (!specs) return '';
  if (typeof specs === 'string') return specs;
  if (typeof specs === 'object') {
    return Object.entries(specs)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  }
  return '';
};

function ProductForm({ initialValues, onSubmit, onCancel, submitLabel, loading, showCancel }) {
  const { token } = useAuth();
  const [formState, setFormState] = useState(() => buildInitialState(initialValues));
  const [errors, setErrors] = useState({});
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [processingImages, setProcessingImages] = useState(false);

  useEffect(() => {
    setFormState(buildInitialState(initialValues));
    setErrors({});
    setImageUrlInput('');
  }, [initialValues]);

  const specsText = useMemo(
    () => stringifySpecs(formState.technicalSpecifications),
    [formState.technicalSpecifications]
  );

  const updateField = (field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async event => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setProcessingImages(true);
    const dataUrls = await Promise.all(
      files.map(
        file =>
          new Promise(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
          })
      )
    );
    setFormState(prev => ({
      ...prev,
      imageUrls: [...prev.imageUrls, ...dataUrls.filter(Boolean)],
    }));
    setProcessingImages(false);
    event.target.value = '';
  };

  const handleAddImageUrl = async () => {
    if (!imageUrlInput.trim()) return;

    const normalized = normalizeImageUrl(imageUrlInput);
    if (!normalized) return;

    let finalUrl = normalized;

    if (/^https?:\/\//i.test(normalized) && !isLikelyDirectImageUrl(normalized)) {
      try {
        setProcessingImages(true);
        const { data } = await axios.get('/api/products/resolve-image', {
          params: { url: normalized },
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        finalUrl = normalizeImageUrl(data?.imageUrl || normalized);
      } catch (error) {
        const message = error?.response?.data?.message || 'Could not extract preview image from URL.';
        alert(message);
        return;
      } finally {
        setProcessingImages(false);
      }
    }

    setFormState(prev => ({
      ...prev,
      imageUrls: [...prev.imageUrls, finalUrl],
    }));
    setImageUrlInput('');
  };

  const handleRemoveImage = index => {
    setFormState(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, idx) => idx !== index),
    }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!formState.name || formState.name.trim().length < 5) {
      nextErrors.name = 'Product name must be at least 5 characters.';
    }
    if (!formState.shortDescription) {
      nextErrors.shortDescription = 'Short description is required.';
    }
    if (!formState.fullDescription) {
      nextErrors.fullDescription = 'Full description is required.';
    }
    if (!formState.price || Number(formState.price) <= 0) {
      nextErrors.price = 'Price must be a positive number.';
    }
    if (Number(formState.rating) < 0 || Number(formState.rating) > 5) {
      nextErrors.rating = 'Rating must be between 0 and 5.';
    }
    if (Number(formState.stockQuantity) < 0) {
      nextErrors.stockQuantity = 'Stock quantity cannot be negative.';
    }
    if (!formState.imageUrls.length) {
      nextErrors.imageUrls = 'At least one product image is required.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = event => {
    event.preventDefault();
    if (!validate()) return;
    const payload = {
      ...formState,
      name: formState.name.trim(),
      shortDescription: formState.shortDescription.trim(),
      fullDescription: formState.fullDescription.trim(),
      brand: formState.brand.trim(),
      price: Number(formState.price),
      discount: formState.discount === '' ? 0 : Number(formState.discount),
      rating: Number(formState.rating),
      stockQuantity: Number(formState.stockQuantity),
      availabilityStatus:
        Number(formState.stockQuantity) <= 0 ? 'Out of Stock' : formState.availabilityStatus,
      technicalSpecifications: parseSpecs(formState.technicalSpecifications),
      imageUrls: normalizeImageUrls(formState.imageUrls),
    };
    onSubmit(payload);
  };

  return (
    <form className="product-form" onSubmit={handleSubmit}>
      <div className="product-form__section">
        <h3>Basic Info</h3>
        <div className="product-form__grid">
          <label className="product-form__field">
            Product name
            <input
              type="text"
              value={formState.name}
              onChange={event => updateField('name', event.target.value)}
              className="product-form__input"
              placeholder="e.g. Solar Panel 300W"
            />
            {errors.name && <span className="product-form__error">{errors.name}</span>}
          </label>

          <label className="product-form__field">
            Category
            <select
              value={formState.category}
              onChange={event => updateField('category', event.target.value)}
              className="product-form__select"
            >
              {CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="product-form__field product-form__field--wide">
            Short description
            <input
              type="text"
              value={formState.shortDescription}
              onChange={event => updateField('shortDescription', event.target.value)}
              className="product-form__input"
              placeholder="One line summary for listings"
            />
            {errors.shortDescription && (
              <span className="product-form__error">{errors.shortDescription}</span>
            )}
          </label>

          <label className="product-form__field">
            Price (LKR)
            <input
              type="number"
              min="0"
              step="0.01"
              value={formState.price}
              onChange={event => updateField('price', event.target.value)}
              className="product-form__input"
            />
            {errors.price && <span className="product-form__error">{errors.price}</span>}
          </label>

          <label className="product-form__field">
            Discount (optional)
            <input
              type="number"
              min="0"
              step="0.01"
              value={formState.discount}
              onChange={event => updateField('discount', event.target.value)}
              className="product-form__input"
            />
          </label>

          <label className="product-form__field">
            Stock quantity
            <input
              type="number"
              min="0"
              step="1"
              value={formState.stockQuantity}
              onChange={event => updateField('stockQuantity', event.target.value)}
              className="product-form__input"
            />
            {errors.stockQuantity && (
              <span className="product-form__error">{errors.stockQuantity}</span>
            )}
          </label>

          <label className="product-form__field">
            Availability status
            <select
              value={formState.availabilityStatus}
              onChange={event => updateField('availabilityStatus', event.target.value)}
              className="product-form__select"
            >
              <option value="In Stock">In Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </label>

          <label className="product-form__field">
            Brand (optional)
            <input
              type="text"
              value={formState.brand}
              onChange={event => updateField('brand', event.target.value)}
              className="product-form__input"
              placeholder="Brand name"
            />
          </label>

          <label className="product-form__field">
            Rating (0-5)
            <div className="product-form__stars">
              {[1, 2, 3, 4, 5].map(value => (
                <button
                  type="button"
                  key={value}
                  className={`product-form__star ${Number(formState.rating) >= value ? 'is-active' : ''}`}
                  onClick={() => updateField('rating', value)}
                >
                  ★
                </button>
              ))}
              <button
                type="button"
                className="product-form__star product-form__star--clear"
                onClick={() => updateField('rating', 0)}
              >
                Clear
              </button>
            </div>
            {errors.rating && <span className="product-form__error">{errors.rating}</span>}
          </label>
        </div>
      </div>

      <div className="product-form__section">
        <h3>Product Details</h3>
        <div className="product-form__grid">
          <label className="product-form__field product-form__field--wide">
            Full description
            <textarea
              rows={4}
              value={formState.fullDescription}
              onChange={event => updateField('fullDescription', event.target.value)}
              className="product-form__textarea"
              placeholder="Detailed description for buyers"
            />
            {errors.fullDescription && (
              <span className="product-form__error">{errors.fullDescription}</span>
            )}
          </label>

          <label className="product-form__field product-form__field--wide">
            Technical specifications (one per line)
            <textarea
              rows={4}
              value={specsText}
              onChange={event => updateField('technicalSpecifications', event.target.value)}
              className="product-form__textarea"
              placeholder="Power: 300W&#10;Voltage: 24V&#10;Efficiency: 21%"
            />
          </label>
        </div>
      </div>

      <div className="product-form__section">
        <h3>Images</h3>
        <p className="product-form__helper">Upload images or paste image URLs.</p>
        <div className="product-form__image-tools">
          <label className="product-form__upload">
            Upload images
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
          </label>
          <div className="product-form__url">
            <input
              type="text"
              value={imageUrlInput}
              onChange={event => setImageUrlInput(event.target.value)}
              placeholder="Paste image URL"
              className="product-form__input"
            />
            <button type="button" className="product-form__add" onClick={handleAddImageUrl}>
              Add
            </button>
          </div>
        </div>
        {errors.imageUrls && <span className="product-form__error">{errors.imageUrls}</span>}
        {processingImages && <span className="product-form__helper">Processing images...</span>}
        <div className="product-form__preview">
          {formState.imageUrls.map((url, idx) => (
            <div key={`${url}-${idx}`} className="product-form__preview-item">
              <img src={normalizeImageUrl(url)} alt={`Preview ${idx + 1}`} />
              <button type="button" onClick={() => handleRemoveImage(idx)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="product-form__actions">
        {showCancel && (
          <button
            type="button"
            className="product-form__button product-form__button--ghost"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
        <button type="submit" className="product-form__button" disabled={loading}>
          {loading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

ProductForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  submitLabel: PropTypes.string,
  loading: PropTypes.bool,
  showCancel: PropTypes.bool,
};

ProductForm.defaultProps = {
  initialValues: null,
  onCancel: null,
  submitLabel: 'Submit Listing',
  loading: false,
  showCancel: false,
};

export default ProductForm;
