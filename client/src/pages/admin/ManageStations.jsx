import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import AdminSidebar from '../../components/admin/AdminSidebar'
import '../../styles/admin.css'

function ManageStations() {
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingStation, setEditingStation] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true)
        const { data } = await axios.get('/api/stations')
        setStations(Array.isArray(data.data) ? data.data : [])
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
      const avgRating = Number(station.averageRating ?? 0)
      const matchesRating = ratingFilter === 'all' || avgRating >= Number(ratingFilter)
      return matchesSearch && matchesRating
    })
  }, [stations, searchTerm, ratingFilter])

  const handleDelete = async (stationId) => {
    if (!window.confirm('Delete this station?')) return
    try {
      await axios.delete(`/api/stations/${stationId}`)
      setStations((prev) => prev.filter((s) => (s._id ?? s.id) !== String(stationId)))
    } catch (err) {
      console.error('Delete failed', err)
      alert('Unable to delete station right now.')
    }
  }

  const handleEdit = (stationId) => {
    setEditingStation({
      _id: station._id,
      name: station.name || "",
      status: station.status || "ACTIVE",
      latitude: station.location?.coordinates?.[1] ?? "",
      longitude: station.location?.coordinates?.[0] ?? "",
      connectors: station.connectors || []
    })
    setIsEditOpen(true)
  }

  const handleUpdate = async () => {
    try {
      setSaving(true)

      const stationId = editingStation._id
      const playload = {
        name: editingStation.name,
        status: editingStation.status,
        connectors: editingStation.connectors,
      }

      //send lat/lng only if both provided
      if (editingStation.latitude !== "" && editingStation.longitude !== "") {
        playload.latitude = Number(editingStation.latitude)
        playload.longitude = Number(editingStation.longitude)
      }

      const res = await axios.put(`api/stations/${stationId}`, playload)
      const updatedStation = res.data?.data

      setStations((prev) =>
        prev.map((s) => (String(s._id) === String(stationId) ? updatedStation : s))
      )
      setIsEditOpen(false)
      setEditingStation(null)

    } catch (err) {
      console.error('Update failed:', err)
      alert('Failed to update station.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <header className="admin-header">
          <div>
            <p className="admin-card__title">Admin Panel</p>
            <h1>Manage Stations</h1>
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
              const ratingValue = Number(station.averageRating ?? 0)
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


        {idEditOpen && editingStation && (
          <div className="modal-backdrop">
            <div className="modal">
              <h2>Edit Station</h2>

            </div>

          </div>
        )}



      </main>
    </div>
  )
}

export default ManageStations
