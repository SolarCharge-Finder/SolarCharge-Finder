import { useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import AdminSidebar from '../../components/admin/AdminSidebar'
import '../../styles/admin.css'
import useAuth from '../../context/useAuth'
import AddStations from "../../components/station/AddStations"
import { Link } from 'react-router-dom'

// Station Card Component with auto-changing photos
function StationCard({ station, onEdit, onDelete }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const stationId = station.id ?? station._id
  const ratingValue = Number(station.rating ?? 0)
  const photos = station.photos || []
  const hasPhotos = photos.length > 0

  // Auto-change photos every 3 seconds
  useEffect(() => {
    if (photos.length <= 1) return

    const interval = setInterval(() => {
      setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % photos.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [photos.length])

  // Format location
  const location = [station.city, station.district]
    .filter(Boolean)
    .join(', ')
    .toUpperCase()

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return '#109867'
      case 'Closed':
        return '#ef4444'
      case 'Maintenance':
        return '#f8c537'
      default:
        return '#5f6b7a'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'Maintenance':
        return 'UNDER MAINTENANCE'
      default:
        return status?.toUpperCase() || 'UNKNOWN'
    }
  }

  return (
    <article className="station-card">
      <div className="station-card-image">
        {hasPhotos ? (
          <>
            <img
              src={photos[currentPhotoIndex]}
              alt={station.name}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x200?text=No+Image'
              }}
            />
            {photos.length > 1 && (
              <div className="photo-indicators">
                {photos.map((_, index) => (
                  <span
                    key={index}
                    className={`photo-dot ${index === currentPhotoIndex ? 'active' : ''}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="no-photo-placeholder">
            <span>No Photos</span>
          </div>
        )}
      </div>

      <div className="station-card-content">
        <p className="station-label">STATION</p>
        <h3 className="station-name">{station.name}</h3>

        {location && (
          <p className="station-location">{location}</p>
        )}

        <p className="station-status" style={{ color: getStatusColor(station.status) }}>
          STATUS: <span style={{ fontWeight: 700 }}>{getStatusText(station.status)}</span>
        </p>

        <div className="station-rating">⭐ {ratingValue.toFixed(1)}</div>

        <div className="station-card-actions">
          <button onClick={() => onEdit(stationId)} className="admin-button admin-button--ghost">
            Edit
          </button>
          <button onClick={() => onDelete(stationId)} className="admin-button admin-button--danger">
            Delete
          </button>
        </div>
      </div>
    </article>
  )
}

StationCard.propTypes = {
  station: PropTypes.shape({
    id: PropTypes.string,
    _id: PropTypes.string,
    name: PropTypes.string.isRequired,
    city: PropTypes.string,
    district: PropTypes.string,
    status: PropTypes.string,
    rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    photos: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
}

function ManageStations() {
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

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [marker, setMarker] = useState(null)
  const [editingStationId, setEditingStationId] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    district: "",
    status: "Open",
    latitude: "",
    longitude: "",
    connectors: [{ type: "TYPE2", powerKW: 22, totalSlots: 1, availableSlots: 1 }],
    photos: [],
  })

  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true)
        //did this work before? u were treating it like an array instead of an object...
        //i fixed it like this & it works, might be because u were using a different database ig (-adeesha)
        const response = await axios.get('/api/stations')
        setStations(response.data.data || []) //setStations(data)
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

  //Add handleStations
  const handleAddStation = async () => {
    if (!adminRequestConfig) return alert("Admin authentication required.")

    if (!formData.name.trim()) return alert("Station name is required")
    if (!formData.latitude || !formData.longitude) return alert("Please select a location on the map")

    try {
      setSaving(true)
      const payload = {
        ...formData,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      }

      const res = await axios.post("/api/stations", payload, adminRequestConfig)
      setStations((prev) => [res.data.data, ...prev])
      setIsAddOpen(false)
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || "Failed to add station")
    } finally {
      setSaving(false)
    }
  }

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

  const handleEdit = (stationId) => {
    if (!adminRequestConfig) {
      alert('Admin authentication required.')
      return
    }
    
    // Use cached station data for instant opening
    const stationToEdit = stations.find(s => (s.id ?? s._id) === stationId)
    
    if (!stationToEdit) {
      alert('Station not found')
      return
    }

    // Extract location - handle both GeoJSON format and direct lat/lng fields
    let lat = null
    let lng = null
    
    if (stationToEdit.location?.coordinates?.length === 2) {
      // GeoJSON format: [longitude, latitude]
      lng = Number(stationToEdit.location.coordinates[0])
      lat = Number(stationToEdit.location.coordinates[1])
    } else if (stationToEdit.latitude && stationToEdit.longitude) {
      // Direct fields
      lat = Number(stationToEdit.latitude)
      lng = Number(stationToEdit.longitude)
    }
    
    // Set marker for map FIRST (before opening modal)
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      setMarker([lat, lng])
    } else {
      setMarker(null)
    }

    // Populate form with station data
    setFormData({
      name: stationToEdit.name || "",
      description: stationToEdit.description || "",
      address: stationToEdit.address || "",
      city: stationToEdit.city || "",
      district: stationToEdit.district || "",
      status: stationToEdit.status || "Open",
      latitude: lat?.toString() || "",
      longitude: lng?.toString() || "",
      connectors: stationToEdit.connectors && stationToEdit.connectors.length > 0 
        ? stationToEdit.connectors 
        : [{ type: "TYPE2", powerKW: 22, totalSlots: 1, availableSlots: 1 }],
      photos: stationToEdit.photos || [],
    })

    // Set editing mode and open modal
    setEditingStationId(stationId)
    setIsAddOpen(true)
  }

  const handleUpdateStation = async () => {
    if (!adminRequestConfig) return alert("Admin authentication required.")
    if (!editingStationId) return

    if (!formData.name.trim()) return alert("Station name is required")
    if (!formData.latitude || !formData.longitude) return alert("Please select a location on the map")

    try {
      setSaving(true)
      const payload = {
        ...formData,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      }

      const res = await axios.put(`/api/stations/${editingStationId}`, payload, adminRequestConfig)
      
      // Update the station in the list
      setStations((prev) => 
        prev.map((station) => 
          (station.id ?? station._id) === editingStationId ? res.data.data : station
        )
      )
      
      setIsAddOpen(false)
      setEditingStationId(null)
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || "Failed to update station")
    } finally {
      setSaving(false)
    }
  }

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

          <button
            className="admin-button admin-button--primary"
            onClick={() => {
              setEditingStationId(null)
              setIsAddOpen(true)
              setMarker(null)
              setFormData({
                name: "",
                description: "",
                address: "",
                city: "",
                district: "",
                status: "Open",
                latitude: "",
                longitude: "",
                connectors: [{ type: "TYPE2", powerKW: 22, totalSlots: 1, availableSlots: 1 }],
                photos: [],
              })
            }}
          >
            + Add Station
          </button>
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
            {filteredStations.map((station) => (
              <StationCard
                key={station.id ?? station._id}
                station={station}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
            {!filteredStations.length && (
              <div className="admin-empty-state">No stations match your filters.</div>
            )}
          </div>
        )}

        <AddStations
          open={isAddOpen}
          onClose={() => {
            setIsAddOpen(false)
            setEditingStationId(null)
          }}
          formData={formData}
          setFormData={setFormData}
          marker={marker}
          setMarker={setMarker}
          onSubmit={editingStationId ? handleUpdateStation : handleAddStation}
          saving={saving}
          isEditMode={!!editingStationId}
        />

      </main>
    </div>
  )
}

export default ManageStations
