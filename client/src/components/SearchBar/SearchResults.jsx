import PropTypes from 'prop-types';
import { useState } from 'react';
import StationResultCard from '../station/StationResultCard';

const SearchResults = ({ stations, error, onSelect }) => {
  const [activeId, setActiveId] = useState(null);

  if (stations.length === 0 && !error) {
    return (
      <p className="no-results">
        No stations found. Try adjusting your search criteria.
      </p>
    );
  }

  const handleSelect = (station) => {
    setActiveId(station._id ?? station.id);
    if (onSelect) onSelect(station);
  };

  const handleDirections = () => {
    // Google Maps is opened inside StationResultCard itself
  };

  return (
    <div className="stations-grid">
      {stations.map((station) => (
        <StationResultCard
          key={station._id ?? station.id}
          station={station}
          active={activeId === (station._id ?? station.id)}
          onSelect={handleSelect}
          onDirections={handleDirections}
        />
      ))}
    </div>
  );
};

SearchResults.propTypes = {
  stations: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      address: PropTypes.string,
      status: PropTypes.string,
      rating: PropTypes.number,
      distance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      photos: PropTypes.arrayOf(PropTypes.string),
      location: PropTypes.shape({
        coordinates: PropTypes.arrayOf(PropTypes.number),
      }),
    })
  ).isRequired,
  error: PropTypes.string,
  onSelect: PropTypes.func,
};

export default SearchResults;
