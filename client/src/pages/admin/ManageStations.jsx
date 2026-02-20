import { useEffect, useMemo, useState, useCallback } from 'react'
import axios from 'axios'
import AdminSidebar from '../../components/admin/AdminSidebar'
import '../../styles/admin.css'
import useAuth from '../../context/useAuth'
import { Link, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Sri Lanka bounds
const SRI_LANKA_BOUNDS = [
  [5.916, 79.652], // Southwest
  [9.835, 81.879]  // Northeast
]
const SRI_LANKA_CENTER = [7.8731, 80.7718]

// Connector types
const CONNECTOR_TYPES = ['CCS2', 'TYPE2', 'CHADEMO', 'GBT', 'TYPE1', 'DOMESTIC']
const STATUS_OPTIONS = ['Open', 'Under Maintenance', 'Closed']

// Empty form state
const getEmptyFormState = () => ({
  name: '',
  description: '',
  address: '',
  city: '',
  district: '',
  status: 'Open',
  latitude: '',
  longitude: '',
  connectors: [{ type: 'TYPE2', powerKW: 22, totalSlots: 1, availableSlots: 1 }],
  photos: [],
})

// Map click handler component
function LocationMarker({ position, setPosition, onLocationSelect }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      // Check if within Sri Lanka bounds
      if (lat >= 5.916 && lat <= 9.835 && lng >= 79.652 && lng <= 81.879) {
        setPosition([lat, lng])
        if (onLocationSelect) {
          onLocationSelect(lat, lng)
        }
      } else {
        alert('Please select a location within Sri Lanka')
      }
    },
  })

  return position ? <Marker position={position} /> : null
}

// Map recenter component
function RecenterMap({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, 13)
    }
  }, [center, map])
  return null
}

// Photo Slideshow component
function PhotoSlideshow({ photos, interval = 3000 }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!photos || photos.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length)
    }, interval)

    return () => clearInterval(timer)
  }, [photos, interval])

  if (!photos || photos.length === 0) {
    return (
      <div className="photo-slideshow photo-slideshow--empty">
        <span>No Photos</span>
      </div>
    )
  }

  return (
    <div className="photo-slideshow">
      <img
        src={photos[currentIndex]}
        alt={`Station photo ${currentIndex + 1}`}
        className="photo-slideshow__image"
      />
      {photos.length > 1 && (
        <div className="photo-slideshow__indicators">
          {photos.map((_, idx) => (
            <span
              key={idx}
              className={`photo-slideshow__dot ${idx === currentIndex ? 'photo-slideshow__dot--active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ManageStations() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const adminRequestConfig = useMemo(() => {
    if (!token) return null
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  }, [token])

  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [ratingFilter, setRatingFilter] = useState('all')
  
  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingStation, setEditingStation] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState(getEmptyFormState())
  const [markerPosition, setMarkerPosition] = useState(null)
  const [addressSearch, setAddressSearch] = useState('')
  const [searchingAddress, setSearchingAddress] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError, setGpsError] = useState('')
  const [newPhotoUrl, setNewPhotoUrl] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [uploadingPhotos, setUploadingPhotos] = useState(false)

  // Fetch stations
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true)
        const response = await axios.get('/api/stations')
        setStations(response.data.data || [])
        setError('')
      } catch (err) {
        console.error('Failed to load stations', err)
        setError('Unable to load stations. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    fetchStations()
  }, [])

  const filteredStations = useMemo(() => {
    return stations.filter((station) => {
      const stationName = (station.name ?? '').toLowerCase()
      const matchesSearch = stationName.includes(searchTerm.toLowerCase())
      const avgRating = Number(station.rating ?? 0)
      const matchesRating = ratingFilter === 'all' || avgRating >= Number(ratingFilter)
      return matchesSearch && matchesRating
    })
  }, [stations, searchTerm, ratingFilter])

  // Handle marker position change
  useEffect(() => {
    if (markerPosition) {
      setFormData(prev => ({
        ...prev,
        latitude: markerPosition[0].toFixed(6),
        longitude: markerPosition[1].toFixed(6)
      }))
    }
  }, [markerPosition])

  // Reverse geocode to get address from coordinates
  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      )
      if (response.data && response.data.address) {
        const addr = response.data.address
        const addressParts = []
        
        // Build address string
        if (addr.road) addressParts.push(addr.road)
        if (addr.suburb || addr.neighbourhood) addressParts.push(addr.suburb || addr.neighbourhood)
        if (addr.city || addr.town || addr.village) addressParts.push(addr.city || addr.town || addr.village)
        if (addr.state_district || addr.district) addressParts.push(addr.state_district || addr.district)
        
        const fullAddress = addressParts.join(', ')
        const city = addr.city || addr.town || addr.village || ''
        const district = addr.state_district || addr.district || addr.county || ''
        
        return { address: fullAddress, city, district }
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err)
    }
    return { address: '', city: '', district: '' }
  }, [])

  // Get current GPS location
  const handleGetGPS = useCallback(async () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser')
      return
    }

    setGpsLoading(true)
    setGpsError('')
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        // Check if within Sri Lanka
        if (latitude >= 5.916 && latitude <= 9.835 && longitude >= 79.652 && longitude <= 81.879) {
          // User is in Sri Lanka - use their location
          setMarkerPosition([latitude, longitude])
          
          // Get address from coordinates
          const { address, city, district } = await reverseGeocode(latitude, longitude)
          
          setFormData(prev => ({
            ...prev,
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6),
            address: address || prev.address,
            city: city || prev.city,
            district: district || prev.district
          }))
          setGpsError('')
        } else {
          // User is outside Sri Lanka - set default Colombo location for convenience
          const defaultLat = 6.9271
          const defaultLng = 79.8612
          setMarkerPosition([defaultLat, defaultLng])
          
          // Get address for Colombo
          const { address, city, district } = await reverseGeocode(defaultLat, defaultLng)
          
          setFormData(prev => ({
            ...prev,
            latitude: defaultLat.toFixed(6),
            longitude: defaultLng.toFixed(6),
            address: address || prev.address,
            city: city || prev.city,
            district: district || prev.district
          }))
          setGpsError('You are outside Sri Lanka. Map centered on Colombo - please click to select station location.')
        }
        setGpsLoading(false)
      },
      (error) => {
        console.error('GPS error:', error)
        let errorMsg = 'Unable to get location. '
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += 'Location permission denied. Please click on the map to select location.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMsg += 'Location unavailable. Please click on the map to select location.'
            break
          case error.TIMEOUT:
            errorMsg += 'Request timed out. Please click on the map to select location.'
            break
          default:
            errorMsg += 'Please click on the map to select location.'
        }
        setGpsError(errorMsg)
        setGpsLoading(false)
      },
      { 
        enableHighAccuracy: false,  // false = use network/WiFi location (works on desktops)
        timeout: 15000,             // 15 seconds timeout
        maximumAge: 300000          // Accept cached position up to 5 minutes old
      }
    )
  }, [reverseGeocode])

  // Handle map click - reverse geocode to get address
  const handleMapLocationSelect = useCallback(async (lat, lng) => {
    const { address, city, district } = await reverseGeocode(lat, lng)
    setFormData(prev => ({
      ...prev,
      address: address || prev.address,
      city: city || prev.city,
      district: district || prev.district
    }))
  }, [reverseGeocode])

  // Photo management
  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return
    // Basic URL validation
    try {
      new URL(newPhotoUrl)
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, newPhotoUrl.trim()]
      }))
      setNewPhotoUrl('')
    } catch {
      alert('Please enter a valid URL')
    }
  }

  const handleRemovePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }))
  }

  // Drag & drop / file upload handlers
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return
    if (!adminRequestConfig) return
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (imageFiles.length === 0) {
      alert('Please select valid image files (JPG, PNG, GIF, WebP)')
      return
    }
    setUploadingPhotos(true)
    try {
      const formPayload = new FormData()
      imageFiles.forEach(f => formPayload.append('photos', f))
      const response = await axios.post('/api/upload/photos', formPayload, {
        headers: {
          ...adminRequestConfig.headers,
          'Content-Type': 'multipart/form-data',
        },
      })
      if (response.data.success && response.data.urls) {
        setFormData(prev => ({
          ...prev,
          photos: [...prev.photos, ...response.data.urls],
        }))
      }
    } catch (err) {
      console.error('Photo upload failed:', err)
      alert(err.response?.data?.message || 'Photo upload failed. Please try again.')
    } finally {
      setUploadingPhotos(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const handleFileInputChange = (e) => {
    handleFileUpload(e.target.files)
    e.target.value = '' // reset so same file can be re-selected
  }

  // Search address using Nominatim
  const handleAddressSearch = useCallback(async () => {
    if (!addressSearch.trim()) return

    setSearchingAddress(true)
    try {
      const query = `${addressSearch}, Sri Lanka`
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=lk&limit=1&addressdetails=1`
      )
      
      if (response.data && response.data.length > 0) {
        const { lat, lon, display_name, address: addr } = response.data[0]
        const latitude = parseFloat(lat)
        const longitude = parseFloat(lon)
        
        // Extract city and district from address details
        const city = addr?.city || addr?.town || addr?.village || addr?.suburb || ''
        const district = addr?.state_district || addr?.district || addr?.county || ''
        const addressStr = display_name.split(',').slice(0, 3).join(', ')
        
        setMarkerPosition([latitude, longitude])
        setFormData(prev => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
          address: addressStr,
          city: city || prev.city,
          district: district || prev.district
        }))
      } else {
        alert('Address not found. Please try a different search term or select on the map.')
      }
    } catch (err) {
      console.error('Address search error:', err)
      alert('Failed to search address. Please try again.')
    } finally {
      setSearchingAddress(false)
    }
  }, [addressSearch])

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Update marker if lat/lng manually changed
    if (name === 'latitude' || name === 'longitude') {
      const lat = name === 'latitude' ? parseFloat(value) : parseFloat(formData.latitude)
      const lng = name === 'longitude' ? parseFloat(value) : parseFloat(formData.longitude)
      if (!isNaN(lat) && !isNaN(lng) && lat >= 5.916 && lat <= 9.835 && lng >= 79.652 && lng <= 81.879) {
        setMarkerPosition([lat, lng])
      }
    }
  }

  // Handle connector change
  const handleConnectorChange = (index, field, value) => {
    setFormData(prev => {
      const newConnectors = [...prev.connectors]
      newConnectors[index] = { ...newConnectors[index], [field]: field === 'type' ? value : Number(value) }
      return { ...prev, connectors: newConnectors }
    })
  }

  // Add connector
  const handleAddConnector = () => {
    setFormData(prev => ({
      ...prev,
      connectors: [...prev.connectors, { type: 'TYPE2', powerKW: 22, totalSlots: 1, availableSlots: 1 }]
    }))
  }

  // Remove connector
  const handleRemoveConnector = (index) => {
    if (formData.connectors.length <= 1) {
      alert('At least one connector is required')
      return
    }
    setFormData(prev => ({
      ...prev,
      connectors: prev.connectors.filter((_, i) => i !== index)
    }))
  }

  // Open Add modal
  const openAddModal = () => {
    setFormData(getEmptyFormState())
    setMarkerPosition(null)
    setAddressSearch('')
    setNewPhotoUrl('')
    setGpsError('')
    setIsAddOpen(true)
  }

  // Open Edit modal
  const openEditModal = (station) => {
    const stationId = station.id ?? station._id
    const lat = station.location?.coordinates?.[1] || ''
    const lng = station.location?.coordinates?.[0] || ''
    
    setFormData({
      name: station.name || '',
      description: station.description || '',
      address: station.address || '',
      city: station.city || '',
      district: station.district || '',
      status: station.status || 'Open',
      latitude: lat.toString(),
      longitude: lng.toString(),
      connectors: station.connectors?.length > 0 
        ? station.connectors.map(c => ({
            type: c.type,
            powerKW: c.powerKW,
            totalSlots: c.totalSlots,
            availableSlots: c.availableSlots
          }))
        : [{ type: 'TYPE2', powerKW: 22, totalSlots: 1, availableSlots: 1 }],
      photos: station.photos || []
    })
    
    if (lat && lng) {
      setMarkerPosition([parseFloat(lat), parseFloat(lng)])
    } else {
      setMarkerPosition(null)
    }
    
    setEditingStation({ ...station, _id: stationId })
    setAddressSearch('')
    setNewPhotoUrl('')
    setGpsError('')
    setIsEditOpen(true)
  }

  // Close modals
  const closeModals = () => {
    setIsAddOpen(false)
    setIsEditOpen(false)
    setEditingStation(null)
    setFormData(getEmptyFormState())
    setMarkerPosition(null)
    setAddressSearch('')
    setNewPhotoUrl('')
    setGpsError('')
  }

  // Validate form
  const validateForm = () => {
    if (!formData.name.trim()) {
      alert('Station name is required')
      return false
    }
    if (!formData.latitude || !formData.longitude) {
      alert('Please select a location on the map')
      return false
    }
    if (formData.connectors.length === 0) {
      alert('At least one connector is required')
      return false
    }
    for (const conn of formData.connectors) {
      if (conn.totalSlots <= 0) {
        alert('Total slots must be greater than 0')
        return false
      }
      if (conn.availableSlots < 0 || conn.availableSlots > conn.totalSlots) {
        alert('Available slots must be between 0 and total slots')
        return false
      }
    }
    return true
  }

  // Handle Add Station
  const handleAddStation = async () => {
    if (!adminRequestConfig) {
      alert('Admin authentication required.')
      return
    }
    if (!validateForm()) return

    setSaving(true)
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        district: formData.district,
        status: formData.status,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        connectors: formData.connectors,
        photos: formData.photos,
      }

      const response = await axios.post('/api/stations', payload, adminRequestConfig)
      setStations(prev => [response.data.data, ...prev])
      closeModals()
      alert('Station added successfully!')
    } catch (err) {
      console.error('Add station failed:', err)
      alert(err.response?.data?.message || 'Failed to add station. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Handle Update Station
  const handleUpdateStation = async () => {
    if (!adminRequestConfig || !editingStation) {
      alert('Admin authentication required.')
      return
    }
    if (!validateForm()) return

    setSaving(true)
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        district: formData.district,
        status: formData.status,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        connectors: formData.connectors,
        photos: formData.photos,
      }

      const response = await axios.put(`/api/stations/${editingStation._id}`, payload, adminRequestConfig)
      setStations(prev => prev.map(s => 
        (s.id ?? s._id) === editingStation._id ? response.data.data : s
      ))
      closeModals()
      alert('Station updated successfully!')
    } catch (err) {
      console.error('Update station failed:', err)
      alert(err.response?.data?.message || 'Failed to update station. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Handle Delete Station
  const handleDelete = async (stationId) => {
    if (!window.confirm('Delete this station?')) return

    if (!adminRequestConfig) {
      alert('Admin authentication required.')
      return
    }
    try {
      await axios.delete(`/api/stations/${stationId}`, adminRequestConfig)
      setStations((prev) => prev.filter((station) => (station.id ?? station._id) !== stationId))
    } catch (err) {
      console.error('Delete failed', err)
      alert('Unable to delete station right now.')
    }
  }

  // Station Form Modal
  const renderStationForm = (isEdit = false) => (
    <div className="modal-backdrop" onClick={closeModals}>
      <div className="modal station-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Station' : 'Add New Station'}</h2>
          <button className="modal-close" onClick={closeModals}>&times;</button>
        </div>
        
        <div className="modal-body">
          <div className="form-grid">
            {/* Basic Info Section */}
            <div className="form-section">
              <h3 className="form-section-title">Basic Information</h3>
              
              <div className="form-group">
                <label>Station Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter station name"
                  maxLength={100}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                  rows={3}
                  maxLength={500}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    maxLength={60}
                  />
                </div>
                <div className="form-group">
                  <label>District</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    placeholder="District"
                    maxLength={60}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Full address"
                  maxLength={200}
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  {STATUS_OPTIONS.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location Section */}
            <div className="form-section">
              <h3 className="form-section-title">Location (Sri Lanka Only)</h3>
              
              <div className="location-search">
                <input
                  type="text"
                  value={addressSearch}
                  onChange={(e) => setAddressSearch(e.target.value)}
                  placeholder="Search address in Sri Lanka..."
                  onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch()}
                />
                <button 
                  type="button" 
                  onClick={handleAddressSearch}
                  disabled={searchingAddress}
                  className="admin-button admin-button--ghost"
                >
                  {searchingAddress ? 'Searching...' : 'Search'}
                </button>
                <button 
                  type="button" 
                  onClick={handleGetGPS}
                  disabled={gpsLoading}
                  className="admin-button admin-button--outline"
                >
                  {gpsLoading ? 'Getting GPS...' : '📍 Use GPS'}
                </button>
              </div>

              {gpsError && (
                <p className="gps-error">{gpsError}</p>
              )}

              <div className="map-container">
                <MapContainer
                  center={markerPosition || SRI_LANKA_CENTER}
                  zoom={markerPosition ? 13 : 8}
                  maxBounds={SRI_LANKA_BOUNDS}
                  maxBoundsViscosity={1.0}
                  minZoom={7}
                  style={{ height: '300px', width: '100%', borderRadius: '12px' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker 
                    position={markerPosition} 
                    setPosition={setMarkerPosition} 
                    onLocationSelect={handleMapLocationSelect}
                  />
                  {markerPosition && <RecenterMap center={markerPosition} />}
                </MapContainer>
              </div>

              <p className="map-hint">Click on the map to select location</p>

              <div className="form-row">
                <div className="form-group">
                  <label>Latitude *</label>
                  <input
                    type="text"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    placeholder="e.g., 6.9271"
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Longitude *</label>
                  <input
                    type="text"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    placeholder="e.g., 79.8612"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Connectors Section */}
          <div className="form-section connectors-section">
            <div className="section-header">
              <h3 className="form-section-title">Connectors</h3>
              <button type="button" onClick={handleAddConnector} className="admin-button admin-button--ghost">
                + Add Connector
              </button>
            </div>

            <div className="connectors-list">
              {formData.connectors.map((connector, index) => (
                <div key={index} className="connector-card">
                  <div className="connector-header">
                    <span className="connector-number">Connector {index + 1}</span>
                    {formData.connectors.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => handleRemoveConnector(index)}
                        className="connector-remove"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="connector-fields">
                    <div className="form-group">
                      <label>Type</label>
                      <select
                        value={connector.type}
                        onChange={(e) => handleConnectorChange(index, 'type', e.target.value)}
                      >
                        {CONNECTOR_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Power (kW)</label>
                      <input
                        type="number"
                        value={connector.powerKW}
                        onChange={(e) => handleConnectorChange(index, 'powerKW', e.target.value)}
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label>Total Slots</label>
                      <input
                        type="number"
                        value={connector.totalSlots}
                        onChange={(e) => handleConnectorChange(index, 'totalSlots', e.target.value)}
                        min="1"
                      />
                    </div>
                    <div className="form-group">
                      <label>Available Slots</label>
                      <input
                        type="number"
                        value={connector.availableSlots}
                        onChange={(e) => handleConnectorChange(index, 'availableSlots', e.target.value)}
                        min="0"
                        max={connector.totalSlots}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Photos Section */}
          <div className="form-section photos-section">
            <div className="section-header">
              <h3 className="form-section-title">Photos</h3>
            </div>

            {/* Drag & drop upload zone */}
            <div
              className={`photo-dropzone${isDragging ? ' photo-dropzone--active' : ''}${uploadingPhotos ? ' photo-dropzone--uploading' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !uploadingPhotos && document.getElementById('photo-file-input').click()}
            >
              <input
                id="photo-file-input"
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileInputChange}
              />
              <div className="dropzone-content">
                {uploadingPhotos ? (
                  <>
                    <div className="upload-spinner" />
                    <p>Uploading photos…</p>
                  </>
                ) : (
                  <>
                    <span className="dropzone-icon">📷</span>
                    <p>Drag &amp; drop photos here, or <strong>click to browse</strong></p>
                    <span className="dropzone-hint">JPG, PNG, GIF, WebP · max 5 MB each · up to 10 photos</span>
                  </>
                )}
              </div>
            </div>

            {/* URL fallback */}
            <div className="photo-url-section">
              <div className="photo-add-form">
                <input
                  type="text"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="Or paste a photo URL…"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPhoto())}
                />
                <button
                  type="button"
                  onClick={handleAddPhoto}
                  className="admin-button admin-button--ghost"
                >
                  + Add URL
                </button>
              </div>
            </div>

            {formData.photos.length > 0 && (
              <div className="photos-grid">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="photo-item">
                    <img
                      src={photo}
                      alt={`Station photo ${index + 1}`}
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = 'https://via.placeholder.com/150?text=Invalid+URL'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="photo-remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {formData.photos.length === 0 && !uploadingPhotos && (
              <p className="photos-empty">No photos yet. Upload files above or paste a URL.</p>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={closeModals} className="admin-button admin-button--outline">
            Cancel
          </button>
          <button 
            type="button" 
            onClick={isEdit ? handleUpdateStation : handleAddStation}
            disabled={saving}
            className="admin-button admin-button--primary"
          >
            {saving ? 'Saving...' : (isEdit ? 'Update Station' : 'Add Station')}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <header className="admin-header">
          <div className="admin-header__title">
            <Link to="/" className="admin-back-link">
              ← Home
            </Link>
            <p className="admin-card__title">Admin Panel</p>
            <h1>Manage Stations</h1>
          </div>
          <div className="admin-header__actions">
            <button onClick={openAddModal} className="admin-button admin-button--primary">
              + Add Station
            </button>
          </div>
        </header>

        <div className="admin-filters">
          <div className="admin-filter">
            <label>Search Stations</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name"
            />
          </div>
          <div className="admin-filter" style={{ maxWidth: '220px' }}>
            <label>Filter by rating</label>
            <select value={ratingFilter} onChange={(event) => setRatingFilter(event.target.value)}>
              <option value="all">All ratings</option>
              <option value="4">4★ & up</option>
              <option value="4.5">4.5★ & up</option>
              <option value="5">5★ only</option>
            </select>
          </div>
        </div>

        {loading && <p className="admin-card__title">Loading stations...</p>}
        {error && !loading && <p className="admin-card__change" style={{ color: '#ef4444' }}>{error}</p>}

        {!loading && !error && (
          <div className="admin-card-grid">
            {filteredStations.map((station) => {
              const stationId = station.id ?? station._id
              const ratingValue = Number(station.rating ?? 0)
              return (
                <article
                  key={stationId}
                  className="admin-card admin-card--with-photo admin-card--clickable"
                  onClick={() => navigate(`/stations/${stationId}`)}
                >
                  <PhotoSlideshow photos={station.photos} />
                  <div className="admin-card__content">
                    <p className="admin-card__title">Station</p>
                    <h3 style={{ marginTop: '0.5rem' }}>{station.name}</h3>
                    <p className="admin-card__title" style={{ marginTop: '0.25rem' }}>
                      {station.city && station.district 
                        ? `${station.city}, ${station.district}` 
                        : station.address 
                          ? station.address 
                          : station.location?.coordinates 
                            ? `📍 ${station.location.coordinates[1]?.toFixed(4)}, ${station.location.coordinates[0]?.toFixed(4)}`
                            : 'No location'}
                    </p>
                    <p className="admin-card__title" style={{ marginTop: '0.25rem' }}>
                      Status: <span style={{ 
                        color: station.status === 'Open' ? '#109867' : 
                               station.status === 'Closed' ? '#ef4444' : '#f59e0b'
                      }}>{station.status || 'Open'}</span>
                    </p>
                    <div style={{ marginTop: '0.75rem', fontWeight: 600 }}>⭐ {ratingValue.toFixed(1)}</div>
                    <div className="admin-table-actions" style={{ marginTop: '1rem' }}>
                      <button onClick={(e) => { e.stopPropagation(); openEditModal(station) }} className="admin-button admin-button--ghost">
                        Edit
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(stationId) }} className="admin-button admin-button--danger">
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
            {!filteredStations.length && (
              <div className="admin-empty-state">No stations match your filters.</div>
            )}
          </div>
        )}

        {/* Add Station Modal */}
        {isAddOpen && renderStationForm(false)}

        {/* Edit Station Modal */}
        {isEditOpen && editingStation && renderStationForm(true)}
      </main>
    </div>
  )
}

export default ManageStations
