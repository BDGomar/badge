import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { adminApi, resolvePhotoUrl } from '../../api/client'
import { ErrorBanner, FieldError, Spinner } from '../../components/ui'

const empty = {
  title: '',
  slug: '',
  description: '',
  location: '',
  organisateur: '',
  starts_at: '',
  ends_at: '',
  max_badges: '',
  is_active: true,
  affiche: null,
  logo: null,
}

function toLocalInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function EventFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState(empty)
  const [existing, setExisting] = useState({ affiche_url: null, logo_url: null })
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    adminApi
      .event(id)
      .then((res) => {
        const e = res.data
        setForm({
          title: e.title || '',
          slug: e.slug || '',
          description: e.description || '',
          location: e.location || '',
          organisateur: e.organisateur || '',
          starts_at: toLocalInput(e.starts_at),
          ends_at: toLocalInput(e.ends_at),
          max_badges: e.max_badges ?? '',
          is_active: !!e.is_active,
          affiche: null,
          logo: null,
        })
        setExisting({
          affiche_url: e.affiche_url,
          logo_url: e.logo_url,
        })
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setErrors(null)

    if (!isEdit && (!form.affiche || !form.logo)) {
      setErrors({
        affiche: !form.affiche ? ["L'affiche est obligatoire."] : undefined,
        logo: !form.logo ? ['Le logo est obligatoire.'] : undefined,
      })
      setError("L'affiche et le logo sont obligatoires.")
      setSubmitting(false)
      return
    }

    const fd = new FormData()
    fd.append('title', form.title)
    if (form.slug.trim()) fd.append('slug', form.slug.trim())
    if (form.description) fd.append('description', form.description)
    if (form.location) fd.append('location', form.location)
    if (form.organisateur) fd.append('organisateur', form.organisateur)
    if (form.starts_at) fd.append('starts_at', form.starts_at)
    if (form.ends_at) fd.append('ends_at', form.ends_at)
    if (form.max_badges !== '') fd.append('max_badges', String(form.max_badges))
    fd.append('is_active', form.is_active ? '1' : '0')
    if (form.affiche) fd.append('affiche', form.affiche)
    if (form.logo) fd.append('logo', form.logo)

    try {
      const res = isEdit
        ? await adminApi.updateEvent(id, fd)
        : await adminApi.createEvent(fd)
      navigate(`/admin/events/${res.data.id}`)
    } catch (err) {
      setErrors(err.errors || null)
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20'

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <Link to={isEdit ? `/admin/events/${id}` : '/admin/events'} className="text-sm text-ink-soft hover:text-ink">
        ← Retour
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold">
        {isEdit ? 'Modifier l’événement' : 'Nouvel événement'}
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-line bg-paper p-6">
        {error && <ErrorBanner message={error} />}

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="title">
            Titre
          </label>
          <input
            id="title"
            className={inputClass}
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            required
          />
          <FieldError errors={errors} name="title" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="organisateur">
            Entreprise organisatrice
          </label>
          <input
            id="organisateur"
            className={inputClass}
            value={form.organisateur}
            onChange={(e) => update('organisateur', e.target.value)}
            placeholder="Ex. Sahal Tech"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="affiche">
              Affiche de l’événement {isEdit ? '(optionnel)' : '*'}
            </label>
            <input
              id="affiche"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => update('affiche', e.target.files?.[0] || null)}
              className="block w-full text-sm text-ink-soft file:mr-3 file:rounded-lg file:border-0 file:bg-mist file:px-3 file:py-2 file:text-sm file:font-semibold"
              required={!isEdit}
            />
            <FieldError errors={errors} name="affiche" />
            {existing.affiche_url && !form.affiche && (
              <img
                src={resolvePhotoUrl(existing.affiche_url)}
                alt=""
                className="mt-2 h-24 w-full object-cover rounded-lg"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="logo">
              Logo organisateur {isEdit ? '(optionnel)' : '*'}
            </label>
            <input
              id="logo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => update('logo', e.target.files?.[0] || null)}
              className="block w-full text-sm text-ink-soft file:mr-3 file:rounded-lg file:border-0 file:bg-mist file:px-3 file:py-2 file:text-sm file:font-semibold"
              required={!isEdit}
            />
            <FieldError errors={errors} name="logo" />
            {existing.logo_url && !form.logo && (
              <img
                src={resolvePhotoUrl(existing.logo_url)}
                alt=""
                className="mt-2 h-16 w-auto object-contain"
              />
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="slug">
            Slug (optionnel)
          </label>
          <input
            id="slug"
            className={inputClass}
            value={form.slug}
            onChange={(e) => update('slug', e.target.value)}
            placeholder="genere-automatiquement"
          />
          <FieldError errors={errors} name="slug" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            className={inputClass}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="location">
            Lieu
          </label>
          <input
            id="location"
            className={inputClass}
            value={form.location}
            onChange={(e) => update('location', e.target.value)}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="starts_at">
              Début
            </label>
            <input
              id="starts_at"
              type="datetime-local"
              className={inputClass}
              value={form.starts_at}
              onChange={(e) => update('starts_at', e.target.value)}
            />
            <FieldError errors={errors} name="starts_at" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="ends_at">
              Fin
            </label>
            <input
              id="ends_at"
              type="datetime-local"
              className={inputClass}
              value={form.ends_at}
              onChange={(e) => update('ends_at', e.target.value)}
            />
            <FieldError errors={errors} name="ends_at" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="max_badges">
            Nombre max de badges (optionnel)
          </label>
          <input
            id="max_badges"
            type="number"
            min="1"
            className={inputClass}
            value={form.max_badges}
            onChange={(e) => update('max_badges', e.target.value)}
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => update('is_active', e.target.checked)}
            className="rounded border-line"
          />
          Événement actif
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex justify-center items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-paper hover:bg-accent-deep transition-colors disabled:opacity-60"
        >
          {submitting && <Spinner />}
          {isEdit ? 'Enregistrer' : 'Créer l’événement'}
        </button>
      </form>
    </div>
  )
}
