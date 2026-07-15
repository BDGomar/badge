import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { adminApi, publicApi, resolvePhotoUrl } from '../../api/client'
import { ErrorBanner, Spinner, formatDate } from '../../components/ui'

export default function ReservationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [reservation, setReservation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    adminApi
      .reservation(id)
      .then((res) => setReservation(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  async function handleDelete() {
    if (!confirm('Supprimer cette réservation ?')) return
    setDeleting(true)
    try {
      await adminApi.deleteReservation(id)
      if (reservation?.event_id) navigate(`/admin/events/${reservation.event_id}`)
      else navigate('/admin/reservations')
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

  if (error && !reservation) return <ErrorBanner message={error} />

  return (
    <div className="max-w-3xl">
      <Link to="/admin/reservations" className="text-sm text-ink-soft hover:text-ink">
        ← Réservations
      </Link>

      {error && (
        <div className="mt-4">
          <ErrorBanner message={error} />
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-line bg-paper p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <img
            src={resolvePhotoUrl(reservation.photo_url)}
            alt=""
            className="h-28 w-28 rounded-2xl object-cover bg-mist"
          />
          <div className="flex-1 min-w-0">
            <p className="font-mono text-xs text-accent font-semibold">{reservation.code}</p>
            <h1 className="mt-1 font-display text-3xl font-bold">
              {reservation.prenom} {reservation.nom}
            </h1>
            <p className="mt-1 text-ink-soft">{reservation.profession_label}</p>
            <p className="mt-3">
              {reservation.checked_in ? (
                <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  Entrée validée
                  {reservation.checked_in_at
                    ? ` · ${formatDate(reservation.checked_in_at)}`
                    : ''}
                </span>
              ) : (
                <span className="inline-flex rounded-full bg-mist px-2.5 py-1 text-xs font-semibold text-ink-soft">
                  Pas encore scanné
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
          >
            Supprimer
          </button>
          <a
            href={publicApi.badgeDownloadUrl(reservation.code)}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-paper hover:bg-accent-deep"
          >
            Télécharger PDF
          </a>
        </div>

        <dl className="mt-8 grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-ink-soft">Email</dt>
            <dd className="font-medium">{reservation.email}</dd>
          </div>
          <div>
            <dt className="text-ink-soft">Téléphone</dt>
            <dd className="font-medium">{reservation.telephone}</dd>
          </div>
          <div>
            <dt className="text-ink-soft">Événement</dt>
            <dd className="font-medium">
              {reservation.event ? (
                <Link to={`/admin/events/${reservation.event.id}`} className="text-accent">
                  {reservation.event.title}
                </Link>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div>
            <dt className="text-ink-soft">Réservé le</dt>
            <dd className="font-medium">{formatDate(reservation.created_at)}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
