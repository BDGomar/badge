import { useEffect, useState } from 'react'
import { publicApi } from '../api/client'
import { ErrorBanner, FieldError, Spinner } from './ui'

const MAX_PHOTO_BYTES = 20 * 1024 * 1024

const initial = {
  email: '',
  nom: '',
  prenom: '',
  telephone: '',
  profession: '',
  photo: null,
}

export default function ReserveForm({ slug, onSuccess }) {
  const [form, setForm] = useState(initial)
  const [professions, setProfessions] = useState([])
  const [preview, setPreview] = useState(null)
  const [errors, setErrors] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    publicApi
      .professions()
      .then((res) => setProfessions(res.data || []))
      .catch(() => setProfessions([]))
  }, [])

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function onPhotoChange(e) {
    const file = e.target.files?.[0] || null
    setErrors((prev) => (prev ? { ...prev, photo: undefined } : null))
    setError('')

    if (file && file.size > MAX_PHOTO_BYTES) {
      update('photo', null)
      if (preview) URL.revokeObjectURL(preview)
      setPreview(null)
      e.target.value = ''
      setErrors({ photo: ['La photo ne doit pas dépasser 20 Mo.'] })
      setError('La photo est trop volumineuse (max. 20 Mo).')
      return
    }

    update('photo', file)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(file ? URL.createObjectURL(file) : null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setErrors(null)

    if (!form.photo) {
      setErrors({ photo: ['La photo est obligatoire.'] })
      setError('La photo est obligatoire.')
      setSubmitting(false)
      return
    }

    if (form.photo.size > MAX_PHOTO_BYTES) {
      setErrors({ photo: ['La photo ne doit pas dépasser 20 Mo.'] })
      setError('La photo est trop volumineuse (max. 20 Mo).')
      setSubmitting(false)
      return
    }

    const fd = new FormData()
    fd.append('email', form.email)
    fd.append('nom', form.nom)
    fd.append('prenom', form.prenom)
    fd.append('telephone', form.telephone)
    fd.append('profession', form.profession)
    fd.append('photo', form.photo)

    try {
      const res = await publicApi.reserveBadge(slug, fd)
      onSuccess(res.data)
    } catch (err) {
      setErrors(err.errors || null)
      setError(
        err.errors?.photo?.[0] ||
          err.errors?.event?.[0] ||
          err.message ||
          'Impossible de réserver.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20'

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-line bg-paper p-6 sm:p-8 shadow-[0_20px_50px_-30px_rgba(16,42,67,0.35)]"
    >
      <h2 className="font-display text-2xl font-bold text-ink">Réserver mon badge</h2>
      <p className="mt-1 text-sm text-ink-soft">Tous les champs sont obligatoires.</p>

      <div className="mt-6 space-y-4">
        {error && <ErrorBanner message={error} />}

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="prenom">
              Prénom
            </label>
            <input
              id="prenom"
              className={inputClass}
              value={form.prenom}
              onChange={(e) => update('prenom', e.target.value)}
              required
            />
            <FieldError errors={errors} name="prenom" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="nom">
              Nom
            </label>
            <input
              id="nom"
              className={inputClass}
              value={form.nom}
              onChange={(e) => update('nom', e.target.value)}
              required
            />
            <FieldError errors={errors} name="nom" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className={inputClass}
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            required
          />
          <FieldError errors={errors} name="email" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="telephone">
            Téléphone
          </label>
          <input
            id="telephone"
            className={inputClass}
            value={form.telephone}
            onChange={(e) => update('telephone', e.target.value)}
            required
          />
          <FieldError errors={errors} name="telephone" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="profession">
            Profession
          </label>
          <select
            id="profession"
            className={inputClass}
            value={form.profession}
            onChange={(e) => update('profession', e.target.value)}
            required
          >
            <option value="">Sélectionner…</option>
            {professions.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <FieldError errors={errors} name="profession" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="photo">
            Photo
          </label>
          <input
            id="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            onChange={onPhotoChange}
            className="block w-full text-sm text-ink-soft file:mr-3 file:rounded-lg file:border-0 file:bg-mist file:px-3 file:py-2 file:text-sm file:font-semibold file:text-ink hover:file:bg-line"
            required
          />
          <p className="mt-1 text-xs text-ink-soft">JPG, PNG ou WEBP — 20 Mo maximum.</p>
          <FieldError errors={errors} name="photo" />
          {preview && (
            <img
              src={preview}
              alt="Aperçu"
              className="mt-3 h-24 w-24 rounded-full object-cover border border-line"
            />
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-paper hover:bg-accent-deep transition-colors disabled:opacity-60"
      >
        {submitting && <Spinner />}
        {submitting ? 'Envoi…' : 'Confirmer ma réservation'}
      </button>
    </form>
  )
}
