import PropTypes from 'prop-types';

function SearchBar({ value, onChange, onSubmit }) {
  return (
    <form className="marketplace-search" onSubmit={onSubmit}>
      <span className="marketplace-search__icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </span>
      <input
        type="text"
        className="marketplace-search__input"
        placeholder="Search products, categories, or keywords..."
        value={value}
        onChange={event => onChange(event.target.value)}
      />
      <button type="submit" className="marketplace-btn marketplace-btn--primary">
        Search
      </button>
    </form>
  );
}

SearchBar.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default SearchBar;
