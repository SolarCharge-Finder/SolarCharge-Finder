import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import AdminSidebar from '../../components/admin/AdminSidebar'
import '../../styles/admin.css'
import useAuth from '../../context/useAuth'
import AddStations from "../../components/station/AddStations"
import { Link } from 'react-router-dom'



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
    alert(`Edit flow not yet implemented for station ${stationId}`)
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
            {filteredStations.map((station) => {
              const stationId = station.id ?? station._id
              const ratingValue = Number(station.rating ?? 0) // station.averageRating => station.rating
              //model doesnt hv a field called averageRating bruh, gavindu will write the average into the model anyway (-adeesha)
              return (
                <article key={stationId} className="admin-card">
                  <p className="admin-card__title">Station</p>
                  <h3 style={{ marginTop: '0.5rem' }}>{station.name}</h3>
                  <p className="admin-card__title" style={{ marginTop: '0.25rem' }}>
                    Created by {station.createdBy || 'Unknown'}
                  </p>
                  <div style={{ marginTop: '0.75rem', fontWeight: 600 }}>⭐ {ratingValue.toFixed(1)}</div>
                  <div className="admin-table-actions" style={{ marginTop: '1rem' }}>
                    <button onClick={() => handleEdit(stationId)} className="admin-button admin-button--ghost">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(stationId)} className="admin-button admin-button--danger">
                      Delete
                    </button>
                  </div>
                </article>
              )
            })}
            {!filteredStations.length && (
              <div className="admin-empty-state">No stations match your filters.</div>
            )}
          </div>
        )}

        <AddStations
          open={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          formData={formData}
          setFormData={setFormData}
          marker={marker}
          setMarker={setMarker}
          onSubmit={handleAddStation}
          saving={saving}
        />

      </main>
    </div>
  )
}

export default ManageStations
