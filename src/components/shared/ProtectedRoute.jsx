import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { PageLoader } from './LoadingSpinner'
import { ROLE_REDIRECT } from '../../constants/roles'

export function ProtectedRoute({ allowedRoles, children }) {
  const { user, role, loading, initialized } = useAuth()
  const location = useLocation()

  if (!initialized || loading) {
    return <PageLoader text="Vérification de votre session..." />
  }

  if (!user) {
    return <Navigate to="/connexion" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    const redirect = ROLE_REDIRECT[role] || '/'
    return <Navigate to={redirect} replace />
  }

  return children
}

export function GuestRoute({ children }) {
  const { user, role, loading, initialized } = useAuth()

  if (!initialized || loading) {
    return <PageLoader text="Chargement..." />
  }

  if (user && role) {
    const redirect = ROLE_REDIRECT[role] || '/'
    return <Navigate to={redirect} replace />
  }

  return children
}

export default ProtectedRoute