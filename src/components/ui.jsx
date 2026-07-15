export function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function Spinner({ className = '' }) {
  return (
    <div
      className={`h-5 w-5 animate-spin rounded-full border-2 border-accent/30 border-t-accent ${className}`}
      aria-hidden
    />
  )
}

export function ErrorBanner({ message }) {
  if (!message) return null
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {message}
    </div>
  )
}

export function FieldError({ errors, name }) {
  const msg = errors?.[name]?.[0]
  if (!msg) return null
  return <p className="mt-1 text-sm text-red-600">{msg}</p>
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="py-16 text-center">
      <h3 className="font-display text-xl text-ink">{title}</h3>
      {description && <p className="mt-2 text-ink-soft">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
