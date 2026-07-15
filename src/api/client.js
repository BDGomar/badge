const API_URL = import.meta.env.VITE_API_URL || '/api'

function getToken() {
  return localStorage.getItem('admin_token')
}

function getScannerToken() {
  return localStorage.getItem('scanner_token')
}

export function setToken(token) {
  if (token) localStorage.setItem('admin_token', token)
  else localStorage.removeItem('admin_token')
}

export function setScannerToken(token) {
  if (token) localStorage.setItem('scanner_token', token)
  else localStorage.removeItem('scanner_token')
}

/**
 * Rewrite absolute backend URLs (/stic/storage, /stic/api, …) to same-origin
 * paths so HTTPS frontends (Vercel) avoid mixed-content blocks.
 */
export function resolvePhotoUrl(url) {
  if (!url) return null

  const toSameOrigin = (path) => {
    const storage = path.match(/(\/storage\/.+)$/)
    if (storage) return storage[1]
    const api = path.match(/(\/api\/.+)$/)
    if (api) return api[1]
    return null
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const rewritten = toSameOrigin(new URL(url).pathname)
      return rewritten || url
    } catch {
      return url
    }
  }

  return toSameOrigin(url) || url
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const data = isJson ? await response.json() : null

  if (!response.ok) {
    const error = new Error(data?.message || 'Une erreur est survenue.')
    error.status = response.status
    error.data = data
    error.errors = data?.errors || null
    throw error
  }

  return data
}

export async function api(path, { method = 'GET', body, token, formData } = {}) {
  const headers = {
    Accept: 'application/json',
  }

  const authToken = token === undefined ? getToken() : token
  if (authToken) headers.Authorization = `Bearer ${authToken}`

  let payload = body
  if (formData) {
    payload = formData
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: payload,
  })

  return parseResponse(response)
}

export const publicApi = {
  professions: () => api('/professions', { token: null }),
  events: () => api('/events', { token: null }),
  event: (slug) => api(`/events/${slug}`, { token: null }),
  reserveBadge: (slug, formData) =>
    api(`/events/${slug}/badges`, { method: 'POST', formData, token: null }),
  verifyBadge: (code) => api(`/badges/${encodeURIComponent(code)}/verify`, { token: null }),
  badgeDownloadUrl: (code) => `${API_URL}/badges/${encodeURIComponent(code)}/download`,
  badgePreviewUrl: (code) => `${API_URL}/badges/${encodeURIComponent(code)}/preview`,
}

export const adminApi = {
  login: (email, password) =>
    api('/admin/login', { method: 'POST', body: { email, password }, token: null }),
  me: () => api('/admin/me'),
  logout: () => api('/admin/logout', { method: 'POST' }),
  dashboard: () => api('/admin/dashboard'),
  events: () => api('/admin/events'),
  event: (id) => api(`/admin/events/${id}`),
  createEvent: (formData) => api('/admin/events', { method: 'POST', formData }),
  updateEvent: (id, formData) => {
    if (formData instanceof FormData) {
      formData.append('_method', 'PUT')
      return api(`/admin/events/${id}`, { method: 'POST', formData })
    }
    return api(`/admin/events/${id}`, { method: 'PUT', body: formData })
  },
  deleteEvent: (id) => api(`/admin/events/${id}`, { method: 'DELETE' }),
  reservations: (params = {}) => {
    const q = new URLSearchParams()
    if (params.event_id) q.set('event_id', params.event_id)
    if (params.q) q.set('q', params.q)
    const qs = q.toString()
    return api(`/admin/reservations${qs ? `?${qs}` : ''}`)
  },
  reservation: (id) => api(`/admin/reservations/${id}`),
  deleteReservation: (id) => api(`/admin/reservations/${id}`, { method: 'DELETE' }),
}

export const scannerApi = {
  login: (email, password) =>
    api('/scanner/login', { method: 'POST', body: { email, password }, token: null }),
  me: () => api('/scanner/me', { token: getScannerToken() }),
  logout: () => api('/scanner/logout', { method: 'POST', token: getScannerToken() }),
  stats: (params = {}) => {
    const q = new URLSearchParams()
    if (params.event_id) q.set('event_id', params.event_id)
    const qs = q.toString()
    return api(`/scanner/stats${qs ? `?${qs}` : ''}`, { token: getScannerToken() })
  },
  lookup: (code) =>
    api('/scanner/lookup', { method: 'POST', body: { code }, token: getScannerToken() }),
  checkIn: (code) =>
    api('/scanner/check-in', { method: 'POST', body: { code }, token: getScannerToken() }),
}
