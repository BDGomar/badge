import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { adminApi, resolvePhotoUrl } from '../../api/client'
import { EmptyState, ErrorBanner, Spinner, formatDate } from '../../components/ui'

export default function EventDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setLoading(true)
    adminApi
      .event(id)
      .then((res) => {
        setEvent(res.data)
        const list = res.reservations?.data || res.reservations || []
        setReservations(list)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  async function handleDelete() {
    if (!confirm('Supprimer cet événement et toutes ses réservations ?')) return
    setDeleting(true)
    try {
      await adminApi.deleteEvent(id)
      navigate('/admin/events')
    } catch (err) {
      setError(err.message)
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error && !event) return <ErrorBanner message={error} />

  return (
    <div>
      <Link to="/admin/events" className="text-sm text-ink-soft hover:text-ink">
        ← Événements
      </Link>

      {error && (
        <div className="mt-4">
          <ErrorBanner message={error} />
        </div>
      )}

      <div className="mt-4 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-accent font-semibold">
            {event.is_active ? 'Actif' : 'Inactif'} · {event.slug}
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold">{event.title}</h1>
          {event.description && <p className="mt-3 text-ink-soft max-w-2xl">{event.description}</p>}
          <dl className="mt-5 grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div>
              <dt className="text-ink-soft">Lieu</dt>
              <dd className="font-medium">{event.location || '—'}</dd>
            </div>
            <div>
              <dt className="text-ink-soft">Début</dt>
              <dd className="font-medium">{formatDate(event.starts_at)}</dd>
            </div>
            <div>
              <dt className="text-ink-soft">Fin</dt>
              <dd className="font-medium">{formatDate(event.ends_at)}</dd>
            </div>
            <div>
              <dt className="text-ink-soft">Réservations</dt>
              <dd className="font-medium">
                {event.reservations_count}
                {event.max_badges ? ` / ${event.max_badges}` : ''}
              </dd>
            </div>
          </dl>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/events/${event.slug}`}
            className="rounded-xl border border-line px-4 py-2 text-sm font-semibold hover:bg-mist"
          >
            Voir la page publique
          </Link>
          <Link
            to={`/admin/events/${event.id}/edit`}
            className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-ink-soft"
          >
            Modifier
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
          >
            Supprimer
          </button>
        </div>
      </div>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4 mb-4">
          <h2 className="font-display text-2xl font-bold">Réservations</h2>
          <Link
            to={`/admin/reservations?event_id=${event.id}`}
            className="text-sm text-accent font-medium"
          >
            Filtrer dans la liste
          </Link>
        </div>

        {reservations.length === 0 ? (
          <EmptyState
            title="Aucune réservation"
            description="Les participants apparaîtront ici dès qu’ils auront réservé un badge."
          />
        ) : (
          <div className="rounded-2xl border border-line bg-paper overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-mist/80 text-left text-ink-soft">
                <tr>
                  <th className="px-4 py-3 font-medium">Participant</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Profession</th>
                  <th className="px-4 py-3 font-medium">Code</th>
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
                        <span className="font-semibold">
                          {r.prenom} {r.nom}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      <div>{r.email}</div>
                      <div>{r.telephone}</div>
                    </td>
                    <td className="px-4 py-3">{r.profession_label}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.code}</td>
                    <td className="px-4 py-3 text-ink-soft">{formatDate(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
