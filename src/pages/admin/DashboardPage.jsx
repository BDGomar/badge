import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi, resolvePhotoUrl } from '../../api/client'
import { ErrorBanner, Spinner, formatDate } from '../../components/ui'

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi
      .dashboard()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error) return <ErrorBanner message={error} />

  const stats = [
    { label: 'Événements', value: data.stats.events },
    { label: 'Actifs', value: data.stats.active_events },
    { label: 'Réservations', value: data.stats.reservations },
    { label: "Aujourd'hui", value: data.stats.reservations_today },
  ]

  const recentReservations = data.recent_reservations?.data || data.recent_reservations || []
  const recentEvents = data.recent_events?.data || data.recent_events || []

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Dashboard</h1>
          <p className="mt-1 text-ink-soft text-sm">Vue d’ensemble des événements et badges.</p>
        </div>
        <Link
          to="/admin/events/new"
          className="inline-flex rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-paper hover:bg-accent-deep transition-colors"
        >
          Nouvel événement
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-paper p-5">
            <p className="text-xs uppercase tracking-wide text-ink-soft">{s.label}</p>
            <p className="mt-2 font-display text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-line bg-paper overflow-hidden">
          <div className="px-5 py-4 border-b border-line flex justify-between items-center">
            <h2 className="font-display font-bold">Dernières réservations</h2>
            <Link to="/admin/reservations" className="text-sm text-accent font-medium">
              Voir tout
            </Link>
          </div>
          <ul className="divide-y divide-line">
            {recentReservations.length === 0 && (
              <li className="px-5 py-10 text-center text-sm text-ink-soft">Aucune réservation.</li>
            )}
            {recentReservations.map((r) => (
              <li key={r.id}>
                <Link
                  to={`/admin/reservations/${r.id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-mist/70 transition-colors"
                >
                  <img
                    src={resolvePhotoUrl(r.photo_url)}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover bg-mist"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">
                      {r.prenom} {r.nom}
                    </p>
                    <p className="text-xs text-ink-soft truncate">
                      {r.event?.title || '—'} · {r.code}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-line bg-paper overflow-hidden">
          <div className="px-5 py-4 border-b border-line flex justify-between items-center">
            <h2 className="font-display font-bold">Événements récents</h2>
            <Link to="/admin/events" className="text-sm text-accent font-medium">
              Voir tout
            </Link>
          </div>
          <ul className="divide-y divide-line">
            {recentEvents.length === 0 && (
              <li className="px-5 py-10 text-center text-sm text-ink-soft">Aucun événement.</li>
            )}
            {recentEvents.map((e) => (
              <li key={e.id}>
                <Link
                  to={`/admin/events/${e.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-mist/70 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{e.title}</p>
                    <p className="text-xs text-ink-soft">
                      {e.is_active ? 'Actif' : 'Inactif'}
                      {e.starts_at ? ` · ${formatDate(e.starts_at)}` : ''}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-ink-soft">
                    {e.reservations_count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
