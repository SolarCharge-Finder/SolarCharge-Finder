import { useEffect, useState } from 'react'
import axios from 'axios'
import useAuth from '../../context/useAuth'
import "./SellRequest.css"

function SellRequestPage() {
    const { token } = useAuth()
    const [sellRequests, setSellRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [editingId, setEditingId] = useState(null)
    const [editData, setEditData] = useState({ energyAmount: '', comment: '', location: { coordinates: [] } })

    const authConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : null

    const fetchSellRequests = async () => {
        if (!authConfig) return
        setLoading(true)
        try {
            const { data } = await axios.get('/api/sell-request/my-requests', authConfig)
            setSellRequests(data?.requests ?? [])
            setError('')
        } catch (err) {
            console.error('Failed to load sell requests', err)
            setError('Unable to load your sell requests.')
            setSellRequests([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSellRequests()
    }, [token])

    const startEdit = (request) => {
        setEditingId(request._id)
        setEditData({
        energyAmount: request.energyAmount ?? '',
        comment: request.comment ?? '',
        location: request.location ?? { coordinates: [] },
        })
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditData({ energyAmount: '', comment: '', location: { coordinates: [] } })
    }

    const saveEdit = async () => {
        if (!authConfig || !editingId) return
        try {
            const { data } = await axios.put(`/api/sell-request/${editingId}`, editData, authConfig)
            setSellRequests((prev) =>
                prev.map((r) => (r._id === editingId ? { ...r, ...data.request } : r))
            )
            cancelEdit()
        } catch (err) {
            console.error('Failed to update sell request', err)
            alert(err?.response?.data?.message ?? 'Could not update sell request.')
        }
    }

    const deleteRequest = async (id) => {
        if (!authConfig) return
        if (!window.confirm('Delete this sell request?')) return
        try {
            await axios.delete(`/api/sell-request/${id}`, authConfig)
            setSellRequests((prev) => prev.filter((r) => r._id !== id))
        } catch (err) {
            console.error('Failed to delete sell request', err)
            alert(err?.response?.data?.message ?? 'Could not delete sell request.')
        }
    }

    if (loading) return <p>Loading your sell requests…</p>
    if (error) return <p style={{ color: '#ef4444' }}>{error}</p>

    return (
        <div className="user-my-sellrequests">
        {sellRequests.length === 0 ? (
            <p className="user-my-sellrequests__empty">You haven&apos;t created any sell requests yet.</p>
        ) : (
            sellRequests.map((req) => {
            const isEditing = editingId === req._id
            return (
                <div key={req._id} className="user-sellrequest-item">
                {!isEditing ? (
                    <>
                    <p>
                        <strong>Energy:</strong> {req.energyAmount} kWh
                    </p>
                    {req.comment && <p><strong>Comment:</strong> {req.comment}</p>}
                    {req.location?.coordinates?.length === 2 && (
                        <p>
                        <strong>Location:</strong> {req.location.coordinates[1]}, {req.location.coordinates[0]}
                        </p>
                    )}
                    <div className="user-sellrequest-actions">
                        <button className="user-button user-button--ghost" onClick={() => startEdit(req)}>
                        Edit
                        </button>
                        <button className="user-button user-button--danger" onClick={() => deleteRequest(req._id)}>
                        Delete
                        </button>
                    </div>
                    </>
                ) : (
                    <div className="user-sellrequest-edit">
                    <label>
                        Energy (kWh):
                        <input
                        type="number"
                        value={editData.energyAmount}
                        onChange={(e) => setEditData({ ...editData, energyAmount: e.target.value })}
                        />
                    </label>
                    <label>
                        Comment:
                        <input
                        type="text"
                        value={editData.comment}
                        onChange={(e) => setEditData({ ...editData, comment: e.target.value })}
                        />
                    </label>
                    <label>
                        Location (lat,lng):
                        <input
                        type="text"
                        value={editData.location.coordinates.join(',')}
                        onChange={(e) =>
                            setEditData({
                            ...editData,
                            location: { coordinates: e.target.value.split(',').map(Number) },
                            })
                        }
                        />
                    </label>
                    <div className="user-sellrequest-actions">
                        <button className="user-button" onClick={saveEdit}>
                        Save
                        </button>
                        <button className="user-button user-button--ghost" onClick={cancelEdit}>
                        Cancel
                        </button>
                    </div>
                    </div>
                )}
                </div>
            )
            })
        )}
        </div>
    )
}

export default SellRequestPage