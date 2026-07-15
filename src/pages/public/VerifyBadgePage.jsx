import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { publicApi } from '../../api/client'
import { ErrorBanner, Spinner } from '../../components/ui'
import BadgePreview from '../../components/BadgePreview'

export default function VerifyBadgePage() {
  const { code } = useParams()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!code) return
    setLoading(true)
    publicApi
      .verifyBadge(code)
      .then(setResult)
      .catch((err) => setError(err.message || 'Badge introuvable ou invalide.'))
      .finally(() => setLoading(false))
  }, [code])

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error || !result?.valid) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="text-xs uppercase tracking-[0.16em] text-warm font-semibold">Vérification</p>
        <h1 className="mt-3 font-display text-3xl font-bold">Badge non valide</h1>
        <div className="mt-6">
          <ErrorBanner message={error || 'Ce code ne correspond à aucun badge.'} />
        </div>
        <Link to="/" className="inline-block mt-8 text-accent font-semibold">
          Retour à l’accueil
        </Link>
      </div>
    )
  }

  const data = result.data
  const reservation = {
    ...data,
    verify_url: `${window.location.origin}/verify/${data.code}`,
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-accent font-semibold">
          Badge authentique
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold">Vérification réussie</h1>
      </div>

      <BadgePreview reservation={reservation} />

      <div className="mt-8 text-center">
        <a
          href={publicApi.badgeDownloadUrl(data.code)}
          className="inline-flex rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-paper hover:bg-accent-deep"
        >
          Télécharger le badge PDF
        </a>
      </div>
    </div>
  )
}
