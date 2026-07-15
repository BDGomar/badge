import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../api/client'
import { EmptyState, ErrorBanner, Spinner, formatDate } from '../../components/ui'

export default function EventsListPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    adminApi
      .events()
      .then((res) => setEvents(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Événements</h1>
          <p className="mt-1 text-sm text-ink-soft">Créer et gérer vos événements.</p>
        </div>
        <Link
          to="/admin/events/new"
          className="inline-flex rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-paper hover:bg-accent-deep transition-colors"
        >
          Nouvel événement
        </Link>
      </div>

      {error && <ErrorBanner message={error} />}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          title="Aucun événement"
          description="Créez votre premier événement pour commencer à recevoir des réservations."
          action={
            <Link
              to="/admin/events/new"
              className="inline-flex rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-paper"
            >
              Créer un événement
            </Link>
          }
        />
      ) : (
        <div className="rounded-2xl border border-line bg-paper overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-mist/80 text-left text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-medium">Titre</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Date</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium text-right">Réservations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-mist/40">
                  <td className="px-4 py-3">
                    <Link to={`/admin/events/${event.id}`} className="font-semibold text-ink hover:text-accent">
                      {event.title}
                    </Link>
                    <p className="text-xs text-ink-soft mt-0.5">{event.location || '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-soft hidden md:table-cell">
                    {formatDate(event.starts_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        event.is_active
                          ? 'bg-glow/50 text-accent-deep'
                          : 'bg-mist text-ink-soft'
                      }`}
                    >
                      {event.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{event.reservations_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
