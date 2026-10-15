import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const HOME_BY_ROLE = {
  admin: '/admin/dashboard',
  secretaire: '/secretaire/dashboard',
  docteur: '/docteur/dashboard',
  patient: '/patient/dashboard',
}

/** Restreint l'acces aux roles autorises ; redirige vers l'espace du role sinon. */
export default function RoleGuard({ allowedRoles }) {
  const { role } = useAuth()

  if (!allowedRoles.includes(role)) {
    return <Navigate to={HOME_BY_ROLE[role] || '/login'} replace />
  }

  return <Outlet />
}
