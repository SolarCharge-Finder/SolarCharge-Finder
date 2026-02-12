import { useEffect, useState } from 'react'
import axios from 'axios'
import AdminSidebar from '../../components/admin/AdminSidebar'
import '../../styles/admin.css'

// Requires Admin Role
function ManageUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const { data } = await axios.get('/api/users')
        setUsers(data)
        setError('')
      } catch (err) {
        console.error('Failed to load users', err)
        setError('Unable to load users. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handlePromote = async (userId) => {
    if (!window.confirm('Promote this user to Admin?')) return

    try {
      await axios.patch(`/api/users/${userId}/promote`)
      setUsers((prev) =>
        prev.map((user) => {
          const currentId = user.id ?? user._id
          return currentId === userId ? { ...user, role: 'Admin' } : user
        }),
      )
    } catch (err) {
      console.error('Promotion failed', err)
      alert('Could not promote user. Please retry.')
    }
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return

    try {
      await axios.delete(`/api/users/${userId}`)
      setUsers((prev) => prev.filter((user) => (user.id ?? user._id) !== userId))
    } catch (err) {
      console.error('Delete failed', err)
      alert('Unable to delete user right now.')
    }
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <header className="admin-header">
          <div>
            <p className="admin-card__title">Admin Panel</p>
            <h1>Manage Users</h1>
          </div>
        </header>

        {loading && <p className="admin-card__title">Loading users...</p>}
        {error && !loading && <p className="admin-card__change" style={{ color: '#ef4444' }}>{error}</p>}

        {!loading && !error && (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const userId = user.id ?? user._id
                  return (
                    <tr key={userId}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className="admin-chip">{user.role}</span>
                      </td>
                      <td>
                        <div className="admin-table-actions">
                          <button
                            onClick={() => handlePromote(userId)}
                            className="admin-button admin-button--ghost"
                          >
                            Promote to Admin
                          </button>
                          <button
                            onClick={() => handleDelete(userId)}
                            className="admin-button admin-button--danger"
                          >
                            Delete User
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {!users.length && (
                  <tr>
                    <td colSpan="4" className="admin-empty-state">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}

export default ManageUsers
