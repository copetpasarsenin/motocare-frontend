import { Navigate, Outlet, useLocation } from 'react-router'
import { getUserRole, isAuthenticated } from '../utils/auth'

function ProtectedRoute({ allowedRoles, redirectTo = '/bookings' }) {
  const location = useLocation()

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedRoles?.length && !allowedRoles.includes(getUserRole())) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
