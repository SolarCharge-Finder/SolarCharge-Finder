import { useEffect, useRef } from "react";

function FilterDropdown({
  city,
  setCity,
  status,
  setStatus,
  connectorType,
  setConnectorType,
  onClose
}) {
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

  return (
    <div className="filter-dropdown" ref={dropdownRef}>


      <div className="filter-group">
        <label>City</label>
        <select value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">All Cities</option>
          <option value="Colombo">Colombo</option>
          <option value="Kandy">Kandy</option>
          <option value="Galle">Galle</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="Open">Open</option>
          <option value="Under Maintenance">Under Maintenance</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Connector Type</label>
        <select
          value={connectorType}
          onChange={(e) => setConnectorType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="Type 1">Type 1</option>
          <option value="Type 2">Type 2</option>
        </select>
      </div>
    </div>
  );
}

export default FilterDropdown;
