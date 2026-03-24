import { Navigate, Outlet, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import useAuth from '../../context/useAuth';

const normalizeRoles = (roles = []) =>
  roles.filter(Boolean).map(role => role.toString().toLowerCase());

function ProtectedRoute({ allowedRoles = [] }) {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  const normalizedUserRole = user?.role?.toLowerCase() ?? '';
  const normalizedAllowedRoles = normalizeRoles(allowedRoles);
  const requiresRoleCheck = normalizedAllowedRoles.length > 0;
  const isAuthorized = !requiresRoleCheck || normalizedAllowedRoles.includes(normalizedUserRole);

  const getFallbackPath = () => {
    if (normalizedUserRole === 'admin') return '/admin';
    if (normalizedUserRole === 'user') return '/user';
    return '/auth';
  };

  if (loading) {
    return (
      <div style={{ minHeight: '50vh', display: 'grid', placeItems: 'center' }}>
        <p style={{ color: '#5f6b7a' }}>Validating your session...</p>
      </div>
    );
  }

  if (!user || !token) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!isAuthorized) {
    return <Navigate to={getFallbackPath()} replace />;
  }

  return <Outlet />;
}

ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

export default ProtectedRoute;
