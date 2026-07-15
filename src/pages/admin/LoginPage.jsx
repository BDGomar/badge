import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ErrorBanner, FieldError, Spinner } from '../../components/ui'

export default function AdminLoginPage() {
  const { login, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('admin@sahaltech.com')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname || '/admin'} replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setErrors(null)
    try {
      await login(email, password)
      navigate(location.state?.from?.pathname || '/admin', { replace: true })
    } catch (err) {
      setErrors(err.errors || null)
      setError(err.errors?.email?.[0] || err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20'

  return (
    <div className="min-h-screen soft-grid flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md fade-up">
        <Link to="/" className="font-display text-2xl font-bold text-ink">
          Sahal Tech
        </Link>
        <h1 className="mt-6 font-display text-3xl font-bold">Administration</h1>
        <p className="mt-2 text-ink-soft text-sm">
          Connectez-vous pour gérer les événements et les badges.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl border border-line bg-paper p-6 space-y-4 shadow-[0_20px_50px_-30px_rgba(16,42,67,0.35)]"
        >
          {error && <ErrorBanner message={error} />}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
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
            <label className="block text-sm font-medium mb-1" htmlFor="password">
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
            className="w-full inline-flex justify-center items-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-paper hover:bg-ink-soft transition-colors disabled:opacity-60"
          >
            {submitting && <Spinner />}
            Se connecter
          </button>
        </form>
      </div>
    </div>
  )
}
