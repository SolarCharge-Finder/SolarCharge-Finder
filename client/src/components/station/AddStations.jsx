import PropTypes from "prop-types"
import { useState, useEffect } from "react"
import LocationPickerMap from "../map/LocationPickerMap"

export default function AddStations({
  open,
  onClose,
  formData,
  setFormData,
  marker,
  setMarker,
  onSubmit,
  saving,
  isEditMode = false,
}) {
  const [photoPreview, setPhotoPreview] = useState([])
  const [searchAddress, setSearchAddress] = useState("")
  const [dragActive, setDragActive] = useState(false)

  // Clear photo previews when modal closes
  useEffect(() => {
    if (!open) {
      setPhotoPreview([])
    }
  }, [open])

  // Load existing photos when modal opens in edit mode
  useEffect(() => {
    if (open && isEditMode && formData.photos && formData.photos.length > 0) {
      setPhotoPreview(formData.photos)
    }
  }, [open, isEditMode, formData.photos])

  if (!open) return null

  // Reverse geocoding to get address from coordinates
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      )
      const data = await response.json()
      
      if (data && data.address) {
        const address = data.address
        
        // Extract city (try multiple possible fields)
        const city = address.city || address.town || address.village || address.municipality || ""
        
        // Extract district/county
        const district = address.county || address.state_district || address.district || ""
        
        // Build full address
        const road = address.road || ""
        const suburb = address.suburb || ""
        const fullAddress = [road, suburb, city].filter(Boolean).join(", ")
        
        // Update form data
        setFormData(p => ({
          ...p,
          city: city,
          district: district,
          address: fullAddress || data.display_name
        }))
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error)
    }
  }

  const handleSearchAddress = async () => {
    if (!searchAddress.trim()) return
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress + ", Sri Lanka")}&limit=1`
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        const location = data[0]
        const lat = parseFloat(location.lat)
        const lng = parseFloat(location.lon)
        
        // Check if location is in Sri Lanka (approximate bounds)
        if (lat >= 5.9 && lat <= 9.9 && lng >= 79.5 && lng <= 82.0) {
          const pos = [lat, lng]
          setMarker(pos)
          setFormData((p) => ({
            ...p,
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6),
          }))
          
          // Get detailed address info
          await reverseGeocode(lat, lng)
        } else {
          alert("Location not found in Sri Lanka. Please try again.")
        }
      } else {
        alert("Location not found. Please try a different search term.")
      }
    } catch (error) {
      console.error("Geocoding failed:", error)
      alert("Failed to search location. Please try again.")
    }
  }

  const handleUseGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const pos = [position.coords.latitude, position.coords.longitude]
          setMarker(pos)
          setFormData((p) => ({
            ...p,
            latitude: pos[0].toFixed(6),
            longitude: pos[1].toFixed(6),
          }))
          
          // Get address details from coordinates
          await reverseGeocode(pos[0], pos[1])
        },
        () => {
          alert("Unable to get your location")
        }
      )
    } else {
      alert("Geolocation is not supported by your browser")
    }
  }

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + photoPreview.length > 10) {
      alert("Maximum 10 photos allowed")
      return
    }

    // Validate file size (5MB max each)
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Max 5MB per file.`)
        return false
      }
      return true
    })

    // Convert files to data URLs
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUrl = reader.result
        setPhotoPreview(prev => [...prev, dataUrl])
        setFormData(p => ({ ...p, photos: [...p.photos, dataUrl] }))
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files)
      if (files.length + photoPreview.length > 10) {
        alert("Maximum 10 photos allowed")
        return
      }

      const validFiles = files.filter(file => {
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not an image file`)
          return false
        }
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is too large. Max 5MB per file.`)
          return false
        }
        return true
      })

      // Convert files to data URLs
      validFiles.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const dataUrl = reader.result
          setPhotoPreview(prev => [...prev, dataUrl])
          setFormData(p => ({ ...p, photos: [...p.photos, dataUrl] }))
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removePhoto = (index) => {
    setPhotoPreview(prev => prev.filter((_, i) => i !== index))
    setFormData(p => ({ ...p, photos: p.photos.filter((_, i) => i !== index) }))
  }

  const addConnector = () => {
    setFormData(p => ({
      ...p,
      connectors: [
        ...p.connectors,
        { type: "TYPE2", powerKW: 22, totalSlots: 1, availableSlots: 1 }
      ]
    }))
  }

  const removeConnector = (index) => {
    if (formData.connectors.length === 1) {
      alert("At least one connector is required")
      return
    }
    setFormData(p => ({
      ...p,
      connectors: p.connectors.filter((_, i) => i !== index)
    }))
  }

  const updateConnector = (index, field, value) => {
    setFormData(p => ({
      ...p,
      connectors: p.connectors.map((c, i) => 
        i === index ? { ...c, [field]: value } : c
      )
    }))
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal station-modal modern-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditMode ? 'Edit Station' : 'Add New Station'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="form-grid">
            {/* Column 1: Basic Information */}
            <div className="form-section">
              <h3 className="form-section-title">BASIC INFORMATION</h3>

              <div className="form-group">
                <label>Station Name *</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Enter station name"
                  className="modern-input"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Enter description"
                  rows={3}
                  className="modern-input"
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                  className="modern-input"
                >
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    value={formData.city}
                    onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
                    placeholder="City"
                    className="modern-input"
                  />
                </div>
                <div className="form-group">
                  <label>District</label>
                  <input
                    value={formData.district}
                    onChange={(e) => setFormData((p) => ({ ...p, district: e.target.value }))}
                    placeholder="District"
                    className="modern-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  value={formData.address}
                  onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                  placeholder="Full address"
                  className="modern-input"
                />
              </div>
            </div>

            {/* Column 2: Location */}
            <div className="form-section">
              <h3 className="form-section-title">LOCATION (SRI LANKA ONLY)</h3>

              <div className="location-search">
                <input
                  type="text"
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  placeholder="Search address in Sri Lanka..."
                  className="search-input"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchAddress()}
                />
                <button
                  type="button"
                  onClick={handleSearchAddress}
                  className="search-btn"
                >
                  Search
                </button>
              </div>

              <button
                type="button"
                onClick={handleUseGPS}
                className="gps-btn"
              >
                📍 Use GPS
              </button>

              <LocationPickerMap
                value={marker}
                onChange={async (pos) => {
                  setMarker(pos)
                  setFormData((p) => ({
                    ...p,
                    latitude: pos[0].toFixed(6),
                    longitude: pos[1].toFixed(6),
                  }))
                  
                  // Get address details from coordinates
                  await reverseGeocode(pos[0], pos[1])
                }}
              />

              <p className="map-hint">Click on the map to select location</p>

              <div className="form-row">
                <div className="form-group">
                  <label>Latitude *</label>
                  <input
                    value={formData.latitude}
                    placeholder="e.g., 6.9271"
                    readOnly
                    className="modern-input"
                  />
                </div>
                <div className="form-group">
                  <label>Longitude *</label>
                  <input
                    value={formData.longitude}
                    placeholder="e.g., 79.8612"
                    readOnly
                    className="modern-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Full Width Connectors Section */}
          <div className="form-section full-width-section">
            <div className="section-header">
              <h3 className="form-section-title">CONNECTORS</h3>
              <button
                type="button"
                onClick={addConnector}
                className="add-connector-btn"
              >
                + Add Connector
              </button>
            </div>

            <div className="connectors-list-horizontal">
              {formData.connectors.map((connector, index) => (
                <div key={index} className="connector-item-horizontal">
                  <div className="connector-item-header">
                    <span className="connector-label">Connector {index + 1}</span>
                    {formData.connectors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeConnector(index)}
                        className="remove-connector-btn-small"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  
                  <div className="connector-fields-row">
                    <div className="form-group">
                      <label>Type</label>
                      <select
                        value={connector.type}
                        onChange={(e) => updateConnector(index, "type", e.target.value)}
                        className="modern-input"
                      >
                        <option value="TYPE2">TYPE2</option>
                        <option value="CCS2">CCS2</option>
                        <option value="CHADEMO">CHAdeMO</option>
                        <option value="TYPE1">TYPE1</option>
                        <option value="GBT">GBT</option>
                        <option value="DOMESTIC">DOMESTIC</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Power (kW)</label>
                      <input
                        type="number"
                        value={connector.powerKW}
                        onChange={(e) => updateConnector(index, "powerKW", Number(e.target.value))}
                        min="0"
                        className="modern-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Total Slots</label>
                      <input
                        type="number"
                        value={connector.totalSlots}
                        onChange={(e) => updateConnector(index, "totalSlots", Number(e.target.value))}
                        min="1"
                        className="modern-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Available Slots</label>
                      <input
                        type="number"
                        value={connector.availableSlots}
                        onChange={(e) => updateConnector(index, "availableSlots", Number(e.target.value))}
                        min="0"
                        max={connector.totalSlots}
                        className="modern-input"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Full Width Photos Section */}
          <div className="form-section full-width-section">
            <h3 className="form-section-title">PHOTOS</h3>

            <div
              className={`photo-dropzone ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('photo-upload').click()}
            >
              <input
                type="file"
                id="photo-upload"
                multiple
                accept="image/*"
                onChange={handlePhotoChange}
                className="photo-input"
              />
              <div className="dropzone-content">
                <div className="camera-icon">📷</div>
                <p className="dropzone-text">
                  Drag & drop photos here, or <span className="click-text">click to browse</span>
                </p>
                <p className="dropzone-hint">
                  JPG, PNG, GIF, WebP · max 5 MB each · up to 10 photos
                </p>
              </div>
            </div>

            {photoPreview.length > 0 ? (
              <div className="photo-preview-grid">
                {photoPreview.map((url, index) => (
                  <div key={index} className="photo-preview-item">
                    <img src={url} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="photo-remove-btn"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-photos-text">
                No photos yet. Upload files above.
              </p>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="admin-button admin-button--outline" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="admin-button admin-button--primary" onClick={onSubmit} disabled={saving}>
            {saving ? "Saving..." : (isEditMode ? "Update Station" : "Add Station")}
          </button>
        </div>
      </div>
    </div>
  )
}

AddStations.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  marker: PropTypes.arrayOf(PropTypes.number),
  setMarker: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  saving: PropTypes.bool.isRequired,
  isEditMode: PropTypes.bool,
}