import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ScannerAuthProvider } from './context/ScannerAuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ScannerProtectedRoute } from './components/ScannerProtectedRoute'
import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'
import HomePage from './pages/public/HomePage'
import EventPage from './pages/public/EventPage'
import VerifyBadgePage from './pages/public/VerifyBadgePage'
import AdminLoginPage from './pages/admin/LoginPage'
import DashboardPage from './pages/admin/DashboardPage'
import EventsListPage from './pages/admin/EventsListPage'
import EventFormPage from './pages/admin/EventFormPage'
import EventDetailPage from './pages/admin/EventDetailPage'
import ReservationsPage from './pages/admin/ReservationsPage'
import ReservationDetailPage from './pages/admin/ReservationDetailPage'
import ScannerLoginPage from './pages/scanner/ScannerLoginPage'
import ScannerPage from './pages/scanner/ScannerPage'

export default function App() {
  return (
    <AuthProvider>
      <ScannerAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="events/:slug" element={<EventPage />} />
              <Route path="verify/:code" element={<VerifyBadgePage />} />
            </Route>

            <Route path="/admin/login" element={<AdminLoginPage />} />

            <Route path="/admin" element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="events" element={<EventsListPage />} />
                <Route path="events/new" element={<EventFormPage />} />
                <Route path="events/:id" element={<EventDetailPage />} />
                <Route path="events/:id/edit" element={<EventFormPage />} />
                <Route path="reservations" element={<ReservationsPage />} />
                <Route path="reservations/:id" element={<ReservationDetailPage />} />
              </Route>
            </Route>

            <Route path="/scanner/login" element={<ScannerLoginPage />} />
            <Route path="/scanner" element={<ScannerProtectedRoute />}>
              <Route index element={<ScannerPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ScannerAuthProvider>
    </AuthProvider>
  )
}
