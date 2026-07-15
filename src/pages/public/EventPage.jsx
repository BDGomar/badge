import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { publicApi, resolvePhotoUrl } from '../../api/client'
import { ErrorBanner, Spinner, formatDate } from '../../components/ui'
import ReserveForm from '../../components/ReserveForm'
import BadgePreview from '../../components/BadgePreview'

export default function EventPage() {
  const { slug } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    setLoading(true)
    setSuccess(null)
    publicApi
      .event(slug)
      .then((res) => setEvent(res.data))
      .catch((err) => setError(err.message || 'Événement introuvable.'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <ErrorBanner message={error || 'Événement introuvable.'} />
        <Link to="/" className="inline-block mt-6 text-accent font-semibold">
          Retour aux événements
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 lg:py-14">
        <div className="text-center mb-8 fade-up">
          <p className="text-xs uppercase tracking-[0.18em] text-accent font-semibold">
            Badge réservé
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold text-ink">
            Voici votre badge
          </h1>
          <p className="mt-2 text-ink-soft">
            Merci {success.prenom}. Vérifiez-le ci-dessous puis téléchargez-le en PDF.
          </p>
        </div>

        <div className="fade-up-delay">
          <BadgePreview reservation={success} />
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 fade-up-delay-2">
          <a
            href={publicApi.badgeDownloadUrl(success.code)}
            className="inline-flex items-center justify-center rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-paper hover:bg-accent-deep transition-colors"
          >
            Télécharger mon badge PDF
          </a>
          <Link
            to={`/verify/${success.code}`}
            className="inline-flex items-center justify-center rounded-xl border border-ink px-6 py-3 text-sm font-semibold text-ink hover:bg-ink hover:text-paper transition-colors"
          >
            Page de vérification
          </Link>
        </div>
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-ink-soft hover:text-ink">
            Retour aux événements
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:py-16">
      <Link to="/" className="text-sm text-ink-soft hover:text-ink">
        ← Événements
      </Link>

      <div className="mt-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        <div className="fade-up">
          {event.affiche_url && (
            <img
              src={resolvePhotoUrl(event.affiche_url)}
              alt=""
              className="mb-6 w-full aspect-[16/10] object-cover rounded-2xl"
            />
          )}
          <p className="text-xs uppercase tracking-[0.16em] text-accent font-semibold">
            {event.is_open ? 'Réservation ouverte' : 'Réservation fermée'}
          </p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl font-extrabold text-ink">
            {event.title}
          </h1>
          {event.organisateur && (
            <p className="mt-2 text-sm font-medium text-ink-soft">Organisé par {event.organisateur}</p>
          )}
          {event.description && (
            <p className="mt-5 text-lg text-ink-soft leading-relaxed">{event.description}</p>
          )}
          <dl className="mt-8 space-y-3 text-sm">
            {event.location && (
              <div className="flex gap-3">
                <dt className="w-28 text-ink-soft">Lieu</dt>
                <dd className="font-medium">{event.location}</dd>
              </div>
            )}
            {event.starts_at && (
              <div className="flex gap-3">
                <dt className="w-28 text-ink-soft">Début</dt>
                <dd className="font-medium">{formatDate(event.starts_at)}</dd>
              </div>
            )}
            <div className="flex gap-3">
              <dt className="w-28 text-ink-soft">Badges</dt>
              <dd className="font-medium">
                {event.reservations_count}
                {event.max_badges ? ` / ${event.max_badges}` : ''} réservés
              </dd>
            </div>
          </dl>
        </div>

        <div className="fade-up-delay">
          {event.is_open ? (
            <ReserveForm
              slug={event.slug}
              onSuccess={(reservation) => {
                // Keep event visuals on the reservation for the badge preview
                setSuccess({
                  ...reservation,
                  event: {
                    ...(reservation.event || {}),
                    title: reservation.event?.title || event.title,
                    location: reservation.event?.location || event.location,
                    organisateur: reservation.event?.organisateur || event.organisateur,
                    affiche_url: reservation.event?.affiche_url || event.affiche_url,
                    logo_url: reservation.event?.logo_url || event.logo_url,
                    starts_at: reservation.event?.starts_at || event.starts_at,
                  },
                })
              }}
            />
          ) : (
            <div className="rounded-2xl border border-line bg-paper p-8">
              <h2 className="font-display text-2xl font-bold">Inscriptions fermées</h2>
              <p className="mt-2 text-ink-soft">
                Cet événement n’accepte plus de nouvelles réservations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
