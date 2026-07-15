import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { publicApi } from '../../api/client'
import { EmptyState, ErrorBanner, Spinner, formatDate } from '../../components/ui'

const HERO_IMG =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1800&q=80'

export default function HomePage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    publicApi
      .events()
      .then((res) => setEvents(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <section className="relative min-h-[88vh] overflow-hidden">
        <img
          src={HERO_IMG}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/70 to-ink/35" />
        <div className="relative mx-auto max-w-6xl px-4 min-h-[88vh] flex flex-col justify-end pb-16 pt-28">
          <p className="fade-up font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold text-paper tracking-tight max-w-3xl">
            Sahal Tech
          </p>
          <h1 className="fade-up-delay mt-4 max-w-xl text-xl sm:text-2xl text-paper/90 font-medium leading-snug">
            Réservez votre badge pour les événements tech et digitaux.
          </h1>
          <p className="fade-up-delay-2 mt-3 max-w-lg text-paper/70">
            Une place, une identité, un badge nominatif pour chaque rencontre.
          </p>
          <div className="fade-up-delay-2 mt-8">
            <a
              href="#evenements"
              className="inline-flex items-center rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-paper hover:bg-accent-deep transition-colors"
            >
              Voir les événements
            </a>
          </div>
        </div>
      </section>

      <section id="evenements" className="mx-auto max-w-6xl px-4 py-20">
        <div className="max-w-2xl mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-ink">Événements ouverts</h2>
          <p className="mt-3 text-ink-soft">
            Choisissez un événement et réservez votre badge en quelques minutes.
          </p>
        </div>

        {error && <ErrorBanner message={error} />}

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner className="h-8 w-8" />
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            title="Aucun événement pour le moment"
            description="Revenez bientôt — de nouveaux rendez-vous seront publiés ici."
          />
        ) : (
          <ul className="divide-y divide-line">
            {events.map((event, i) => (
              <li
                key={event.id}
                className="fade-up py-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.16em] text-accent font-semibold mb-2">
                    {event.is_open ? 'Inscriptions ouvertes' : 'Complet / fermé'}
                  </p>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-ink">
                    {event.title}
                  </h3>
                  <p className="mt-2 text-ink-soft line-clamp-2 max-w-2xl">
                    {event.description || 'Réservez votre badge pour cet événement.'}
                  </p>
                  <p className="mt-3 text-sm text-ink-soft">
                    {[event.location, formatDate(event.starts_at)].filter(Boolean).join(' · ')}
                    {event.reservations_count != null && (
                      <> · {event.reservations_count} réservation{event.reservations_count > 1 ? 's' : ''}</>
                    )}
                  </p>
                </div>
                <Link
                  to={`/events/${event.slug}`}
                  className="shrink-0 inline-flex items-center justify-center rounded-xl border border-ink px-5 py-2.5 text-sm font-semibold text-ink hover:bg-ink hover:text-paper transition-colors"
                >
                  Réserver mon badge
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
