import PropTypes from 'prop-types';
import { formatLKRWhole } from '../../utils/currency';

function FilterPanel({
  categories,
  brands,
  filters,
  priceBounds,
  onToggleCategory,
  onToggleAvailability,
  onToggleRating,
  onToggleBrand,
  onPriceChange,
  onReset,
}) {
  const handleMaxChange = event => {
    onPriceChange({ min: 0, max: Number(event.target.value) });
  };

  return (
    <aside className="marketplace-panel marketplace-filters">
      <div className="filters-header">
        <div>
          <h3>Filters</h3>
          <p>Refine solar gear by category, rating, and price.</p>
        </div>
        <button type="button" className="filters-reset" onClick={onReset}>
          Reset
        </button>
      </div>

      <div className="filters-group">
        <h4>Category</h4>
        <div className="filters-options">
          {categories.map(category => (
            <label key={category} className="filters-option">
              <input
                type="checkbox"
                checked={filters.categories.includes(category)}
                onChange={() => onToggleCategory(category)}
              />
              <span>{category}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filters-group">
        <h4>Price Range</h4>
        <div className="price-range">
          <div className="price-values">
            <span>{formatLKRWhole(priceBounds.min)}</span>
            <span>{formatLKRWhole(priceBounds.max)}</span>
          </div>
          <input
            type="range"
            min={priceBounds.min}
            max={priceBounds.max}
            value={filters.priceRange.max}
            onChange={handleMaxChange}
          />
          <p className="price-range__selected">Up to {formatLKRWhole(filters.priceRange.max)}</p>
        </div>
      </div>

      <div className="filters-group">
        <h4>Rating</h4>
        <div className="filters-options">
          {[4, 3].map(value => (
            <label key={value} className="filters-option">
              <input
                type="checkbox"
                checked={filters.ratings.includes(value)}
                onChange={() => onToggleRating(value)}
              />
              <span>{value} stars &amp; above</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filters-group">
        <h4>Availability</h4>
        <div className="filters-options">
          {[
            { id: 'in', label: 'In Stock' },
            { id: 'out', label: 'Out of Stock' },
          ].map(option => (
            <label key={option.id} className="filters-option">
              <input
                type="checkbox"
                checked={filters.availability.includes(option.id)}
                onChange={() => onToggleAvailability(option.id)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {brands.length > 0 && (
        <div className="filters-group">
          <h4>Brand</h4>
          <div className="filters-options">
            {brands.map(brand => (
              <label key={brand} className="filters-option">
                <input
                  type="checkbox"
                  checked={filters.brands.includes(brand)}
                  onChange={() => onToggleBrand(brand)}
                />
                <span>{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

FilterPanel.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  brands: PropTypes.arrayOf(PropTypes.string).isRequired,
  filters: PropTypes.shape({
    categories: PropTypes.arrayOf(PropTypes.string).isRequired,
    ratings: PropTypes.arrayOf(PropTypes.number).isRequired,
    availability: PropTypes.arrayOf(PropTypes.string).isRequired,
    brands: PropTypes.arrayOf(PropTypes.string).isRequired,
    priceRange: PropTypes.shape({
      min: PropTypes.number.isRequired,
      max: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
  priceBounds: PropTypes.shape({
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
  }).isRequired,
  onToggleCategory: PropTypes.func.isRequired,
  onToggleAvailability: PropTypes.func.isRequired,
  onToggleRating: PropTypes.func.isRequired,
  onToggleBrand: PropTypes.func.isRequired,
  onPriceChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
};

export default FilterPanel;
