import { resolvePhotoUrl } from '../api/client'

export default function BadgePreview({ reservation }) {
  if (!reservation?.code) return null

  const apiBase = import.meta.env.VITE_API_URL || '/api'
  const previewUrl = resolvePhotoUrl(
    reservation.preview_url ||
      `${apiBase}/badges/${encodeURIComponent(reservation.code)}/preview`
  )

  return (
    <div className="w-full max-w-[420px] mx-auto">
      <img
        src={previewUrl}
        alt={`Badge ${reservation.code}`}
        className="w-full h-auto rounded-2xl shadow-[0_30px_80px_-40px_rgba(11,31,42,0.55)] border border-line/60 bg-ink"
      />
    </div>
  )
}
