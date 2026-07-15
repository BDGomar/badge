import { Link, NavLink, Outlet } from 'react-router-dom'

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="relative z-20">
        <div className="mx-auto max-w-6xl px-4 py-5 flex items-center justify-between">
          <Link to="/" className="font-display text-xl font-bold tracking-tight text-ink">
            Sahal Tech
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-ink-soft">
            <NavLink to="/" className={({ isActive }) => (isActive ? 'text-ink' : 'hover:text-ink')}>
              Événements
            </NavLink>
            <Link to="/scanner/login" className="hover:text-ink">
              Scanner
            </Link>
            <Link to="/admin/login" className="hover:text-ink">
              Admin
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-line/80 py-8 mt-16">
        <div className="mx-auto max-w-6xl px-4 text-sm text-ink-soft flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <p className="font-display font-semibold text-ink">Sahal Tech</p>
          <p>Réservation de badges pour vos événements digitaux.</p>
        </div>
      </footer>
    </div>
  )
}
