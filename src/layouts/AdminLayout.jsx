import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/admin', end: true, label: 'Dashboard' },
  { to: '/admin/events', label: 'Événements' },
  { to: '/admin/reservations', label: 'Réservations' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-mist">
      <header className="border-b border-line bg-paper/90 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link to="/admin" className="font-display font-bold text-ink">
              Admin · Sahal Tech
            </Link>
            <nav className="hidden sm:flex items-center gap-4 text-sm">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    isActive ? 'text-accent font-semibold' : 'text-ink-soft hover:text-ink'
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden md:inline text-ink-soft">{user?.email}</span>
            <Link to="/" className="text-ink-soft hover:text-ink">
              Site
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg bg-ink px-3 py-1.5 text-paper hover:bg-ink-soft transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
