import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import AdminSidebar from '../../components/admin/AdminSidebar';
import '../../styles/admin.css';
import useAuth from '../../context/useAuth';
import { Link } from 'react-router-dom';

// Requires Admin Role
function ManageUsers() {
  const { token } = useAuth();
  const authConfig = useMemo(() => {
    if (!token) return null;
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, [token]);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      if (!authConfig) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await axios.get('/api/users', authConfig);
        const userList = response.data?.data?.users ?? response.data?.users ?? response.data ?? [];
        setUsers(userList);
        setError('');
      } catch (err) {
        console.error('Failed to load users', err);
        setError('Unable to load users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [authConfig]);

  const handlePromote = async userId => {
    if (!authConfig) {
      alert('Admin authentication required.');
      return;
    }

    const targetUser = users.find(u => (u.id ?? u._id) === userId);
    const currentRole = (targetUser?.role || '').toLowerCase();
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const confirmMsg =
      newRole === 'admin' ? 'Promote this user to Admin?' : 'Demote this user to regular user?';
    if (!window.confirm(confirmMsg)) return;

    try {
      const { data } = await axios.patch(
        `/api/users/${userId}/role`,
        { role: newRole },
        authConfig
      );
      setUsers(prev =>
        prev.map(user => {
          const currentId = user.id ?? user._id;
          return currentId === userId ? { ...user, role: data?.data?.user?.role ?? newRole } : user;
        })
      );
    } catch (err) {
      console.error('Update role failed', err);
      alert('Could not update user role. Please retry.');
    }
  };

  const handleDelete = async userId => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;

    if (!authConfig) {
      alert('Admin authentication required.');
      return;
    }

    try {
      await axios.delete(`/api/users/${userId}`, authConfig);
      setUsers(prev => prev.filter(user => (user.id ?? user._id) !== userId));
    } catch (err) {
      console.error('Delete failed', err);
      alert('Unable to delete user right now.');
    }
  };

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
            <h1>Manage Users</h1>
          </div>
        </header>

        {loading && <p className="admin-card__title">Loading users...</p>}
        {error && !loading && (
          <p className="admin-card__change" style={{ color: '#ef4444' }}>
            {error}
          </p>
        )}

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
                {users.map(user => {
                  const userId = user.id ?? user._id;
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
                            {(user.role || '').toString().toLowerCase() === 'admin'
                              ? 'Promote to user'
                              : 'Promote to Admin'}
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
                  );
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
  );
}

export default ManageUsers;
