import { useContext } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { AuthContext } from '../../contexts/AuthContext'

function AdminRoute() {
  const { user, loading } = useContext(AuthContext)
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <p className="text-sm font-medium text-slate-600">Checking credentials...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  return <Outlet />
}

export default AdminRoute
