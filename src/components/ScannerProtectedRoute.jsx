import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useScannerAuth } from '../context/ScannerAuthContext'

export function ScannerProtectedRoute() {
  const { isAuthenticated, loading } = useScannerAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-ink-soft bg-[#0b1c2c]">
        Chargement…
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/scanner/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
