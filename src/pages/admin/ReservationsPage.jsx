import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { adminApi, resolvePhotoUrl } from '../../api/client'
import { EmptyState, ErrorBanner, Spinner, formatDate } from '../../components/ui'

export default function ReservationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [events, setEvents] = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState(searchParams.get('q') || '')
  const eventId = searchParams.get('event_id') || ''

  useEffect(() => {
    adminApi
      .events()
      .then((res) => setEvents(res.data || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    adminApi
      .reservations({
        event_id: eventId || undefined,
        q: searchParams.get('q') || undefined,
      })
      .then((res) => setReservations(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [eventId, searchParams])

  function applyFilters(e) {
    e.preventDefault()
    const next = {}
    if (eventId) next.event_id = eventId
    if (q.trim()) next.q = q.trim()
    setSearchParams(next)
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Réservations</h1>
      <p className="mt-1 text-sm text-ink-soft">Tous les participants ayant réservé un badge.</p>

      <form onSubmit={applyFilters} className="mt-6 grid sm:grid-cols-[1fr_1fr_auto] gap-3">
        <select
          className="rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm"
          value={eventId}
          onChange={(e) => {
            const next = { ...Object.fromEntries(searchParams) }
            if (e.target.value) next.event_id = e.target.value
            else delete next.event_id
            setSearchParams(next)
          }}
        >
          <option value="">Tous les événements</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.title}
            </option>
          ))}
        </select>
        <input
          className="rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm"
          placeholder="Rechercher nom, email, code…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          type="submit"
          className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-paper hover:bg-ink-soft"
        >
          Filtrer
        </button>
      </form>

      {error && (
        <div className="mt-4">
          <ErrorBanner message={error} />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      ) : reservations.length === 0 ? (
        <EmptyState title="Aucune réservation" description="Modifiez les filtres ou attendez les inscriptions." />
      ) : (
        <div className="mt-6 rounded-2xl border border-line bg-paper overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-mist/80 text-left text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-medium">Participant</th>
                <th className="px-4 py-3 font-medium">Événement</th>
                <th className="px-4 py-3 font-medium">Profession</th>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Entrée</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {reservations.map((r) => (
                <tr key={r.id} className="hover:bg-mist/40">
                  <td className="px-4 py-3">
                    <Link to={`/admin/reservations/${r.id}`} className="flex items-center gap-3">
                      <img
                        src={resolvePhotoUrl(r.photo_url)}
                        alt=""
                        className="h-9 w-9 rounded-full object-cover bg-mist"
                      />
                      <div>
                        <p className="font-semibold">
                          {r.prenom} {r.nom}
                        </p>
                        <p className="text-xs text-ink-soft">{r.email}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {r.event ? (
                      <Link to={`/admin/events/${r.event.id}`} className="hover:text-accent">
                        {r.event.title}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3">{r.profession_label}</td>
                  <td className="px-4 py-3 font-mono text-xs">{r.code}</td>
                  <td className="px-4 py-3">
                    {r.checked_in ? (
                      <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        Entrée
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-mist px-2 py-0.5 text-xs font-semibold text-ink-soft">
                        En attente
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{formatDate(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
