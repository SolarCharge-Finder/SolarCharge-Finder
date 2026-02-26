import { useEffect, useRef } from "react";
import PropTypes from 'prop-types';

const cities = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo",
  "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
  "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar",
  "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
];
const statuses = ["Open", "Under Maintenance", "Closed"];
const connectorTypes = ["Type1", "Type2", "CCS2", "CHADEMO", "DOMESTIC", "GBT"];

function FilterDropdown({city, setCity, status, setStatus, connectorType, setConnectorType, onClose}) {
  const dropdownRef = useRef(null);

  // minimize when clicking outside 
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  //render filter options from the lists 
  const renderOptions = (options) => [
    <option key="" value="">All</option>,
    ...options.map(opt => <option key={opt} value={opt}>{opt}</option>)
  ]; 

  return (
    <div className="filter-dropdown" ref={dropdownRef}>


      <div className="filter-group">
        <label>City</label>
        <select value={city} onChange={(e) => setCity(e.target.value)}>
          {renderOptions(cities)}
        </select>
      </div>

      <div className="filter-group">
        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          {renderOptions(statuses)}
        </select>
      </div>

      <div className="filter-group">
        <label>Connector Type</label>
        <select value={connectorType} onChange={(e) => setConnectorType(e.target.value)}>
          {renderOptions(connectorTypes)}
        </select>
      </div>
    </div>
  );
}

//prop types validation
FilterDropdown.propTypes = {
  city: PropTypes.string.isRequired,
  setCity: PropTypes.func.isRequired,
  status: PropTypes.string.isRequired,
  setStatus: PropTypes.func.isRequired,
  connectorType: PropTypes.string.isRequired,
  setConnectorType: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default FilterDropdown;
