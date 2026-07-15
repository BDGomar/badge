import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useScannerAuth } from '../../context/ScannerAuthContext'
import { ErrorBanner, FieldError, Spinner } from '../../components/ui'

export default function ScannerLoginPage() {
  const { login, isAuthenticated, loading } = useScannerAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('scanner@sahaltech.com')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && isAuthenticated) {
    return <Navigate to="/scanner" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setErrors(null)
    try {
      await login(email, password)
      navigate('/scanner', { replace: true })
    } catch (err) {
      setErrors(err.errors || null)
      setError(err.errors?.email?.[0] || err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 placeholder:text-white/35'

  return (
    <div className="min-h-screen bg-[#0b1c2c] text-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="font-display text-2xl font-bold tracking-tight">
          Sahal Tech
        </Link>
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-emerald-300/80 font-semibold">
          Contrôle d’accès
        </p>
        <h1 className="mt-5 font-display text-3xl font-bold">Scanner badges</h1>
        <p className="mt-2 text-white/60 text-sm">
          Connectez-vous pour vérifier les participants à l’entrée.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
          {error && <ErrorBanner message={error} />}
          <div>
            <label className="block text-sm font-medium mb-1 text-white/80" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <FieldError errors={errors} name="email" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-white/80" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex justify-center items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-[#042016] hover:bg-emerald-400 transition-colors disabled:opacity-60"
          >
            {submitting && <Spinner />}
            Ouvrir le scanner
          </button>
        </form>
      </div>
    </div>
  )
}
