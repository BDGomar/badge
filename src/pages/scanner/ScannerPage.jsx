import { useCallback, useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { useScannerAuth } from '../../context/ScannerAuthContext'
import { publicApi, scannerApi } from '../../api/client'
import { Spinner } from '../../components/ui'

const SCANNER_ID = 'badge-qr-reader'

function extractHint(payload) {
  if (!payload) return ''
  const m = String(payload).match(/\b((?:STIC|BADGE)-[A-Z0-9\-]+)\b/i)
  return m ? m[1].toUpperCase() : payload.slice(0, 80)
}

function statusCopy(status) {
  switch (status) {
    case 'checked_in':
      return {
        label: 'Accès autorisé',
        hint: 'Comparez la photo du badge avec la personne présente.',
        className: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-50',
      }
    case 'already_checked_in':
      return {
        label: 'Déjà scanné',
        hint: 'Ce badge a déjà servi à l’entrée. Vérifiez tout de même l’identité.',
        className: 'border-amber-400/40 bg-amber-500/15 text-amber-50',
      }
    case 'valid':
      return {
        label: 'Badge valide',
        hint: 'Comparez la photo du badge avec la personne présente.',
        className: 'border-sky-400/40 bg-sky-500/15 text-sky-50',
      }
    case 'error':
      return {
        label: 'Refusé',
        hint: 'Aucun badge trouvé pour ce code.',
        className: 'border-rose-400/40 bg-rose-500/15 text-rose-50',
      }
    default:
      return {
        label: 'Résultat',
        hint: '',
        className: 'border-white/10 bg-white/5 text-white',
      }
  }
}

export default function ScannerPage() {
  const { user, logout } = useScannerAuth()
  const [scanning, setScanning] = useState(false)
  const [busy, setBusy] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [result, setResult] = useState(null)
  const [badgeLoaded, setBadgeLoaded] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [stats, setStats] = useState(null)
  const [eventId, setEventId] = useState('')
  const scannerRef = useRef(null)
  const lastScanRef = useRef({ value: '', at: 0 })
  const processScanRef = useRef(null)

  const refreshStats = useCallback(() => {
    scannerApi
      .stats(eventId ? { event_id: eventId } : {})
      .then((res) => setStats(res.data))
      .catch(() => {})
  }, [eventId])

  useEffect(() => {
    refreshStats()
  }, [refreshStats])

  const stopCamera = useCallback(async () => {
    const scanner = scannerRef.current
    scannerRef.current = null
    setScanning(false)
    if (!scanner) return
    try {
      if (scanner.isScanning) await scanner.stop()
      await scanner.clear()
    } catch {
      // ignore cleanup errors
    }
  }, [])

  const startCamera = useCallback(async () => {
    setCameraError('')
    await stopCamera()
    try {
      const scanner = new Html5Qrcode(SCANNER_ID)
      scannerRef.current = scanner
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 8, qrbox: { width: 260, height: 260 }, aspectRatio: 1 },
        (decoded) => {
          processScanRef.current?.(decoded, { autoCheckIn: true })
        },
        () => {}
      )
      setScanning(true)
    } catch (err) {
      setCameraError(
        err?.message?.includes('Permission')
          ? 'Autorisez l’accès à la caméra pour scanner.'
          : 'Caméra indisponible. Saisissez le code manuellement.'
      )
      setScanning(false)
    }
  }, [stopCamera])

  const processScan = useCallback(
    async (payload, { autoCheckIn = true } = {}) => {
      const now = Date.now()
      const normalized = String(payload).trim()
      if (
        normalized === lastScanRef.current.value &&
        now - lastScanRef.current.at < 3500
      ) {
        return
      }
      lastScanRef.current = { value: normalized, at: now }

      setBusy(true)
      setBadgeLoaded(false)
      try {
        const res = autoCheckIn
          ? await scannerApi.checkIn(normalized)
          : await scannerApi.lookup(normalized)
        setResult(res)
        refreshStats()
        await stopCamera()
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(
            res.status === 'already_checked_in'
              ? [70, 40, 70]
              : res.status === 'checked_in'
                ? 35
                : 20
          )
        }
      } catch (err) {
        setResult({
          status: 'error',
          message: err.errors?.code?.[0] || err.message || 'Scan impossible.',
          data: { code: extractHint(normalized) },
        })
        await stopCamera()
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([80, 40, 80])
        }
      } finally {
        setBusy(false)
      }
    },
    [refreshStats, stopCamera]
  )

  processScanRef.current = processScan

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [startCamera, stopCamera])

  async function handleManual(e) {
    e.preventDefault()
    if (!manualCode.trim()) return
    await processScan(manualCode.trim(), { autoCheckIn: true })
    setManualCode('')
  }

  async function scanNext() {
    setResult(null)
    setBadgeLoaded(false)
    lastScanRef.current = { value: '', at: 0 }
    await startCamera()
  }

  const participant = result?.data
  const tone = statusCopy(result?.status)
  const showBadge = participant?.code && result?.status !== 'error'
  const badgeUrl = showBadge
    ? `${publicApi.badgePreviewUrl(participant.code)}?t=${participant.checked_in_at || participant.id || Date.now()}`
    : null

  return (
    <div className="min-h-screen bg-[#0b1c2c] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b1c2c]/90 backdrop-blur px-4 py-3">
        <div className="mx-auto max-w-lg flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-300/80 font-semibold">
              Entrée événement
            </p>
            <p className="font-display font-bold text-lg leading-tight">{user?.name}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/5"
          >
            Quitter
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-5 space-y-5 pb-16">
        {stats && (
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Inscrits" value={stats.total} />
            <Stat label="Entrés" value={stats.checked_in} accent />
            <Stat label="Restants" value={stats.pending} />
          </div>
        )}

        {stats?.events?.length > 0 && !result && (
          <select
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
          >
            <option value="">Tous les événements</option>
            {stats.events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>
        )}

        {/* Conteneur caméra toujours monté (caché pendant l’affichage du badge) */}
        <section
          className={`rounded-2xl border border-white/10 overflow-hidden bg-black/30 ${
            result ? 'hidden' : ''
          }`}
        >
          <div className="px-4 py-3 flex items-center justify-between gap-2 border-b border-white/10">
            <p className="text-sm font-semibold">Scanner le QR du badge</p>
            <button
              type="button"
              onClick={() => (scanning ? stopCamera() : startCamera())}
              className="text-xs font-semibold text-emerald-300"
            >
              {scanning ? 'Pause caméra' : 'Relancer'}
            </button>
          </div>
          <div id={SCANNER_ID} className="min-h-[280px] bg-black" />
          {cameraError && (
            <p className="px-4 py-3 text-sm text-amber-200 border-t border-white/10">
              {cameraError}
            </p>
          )}
          {busy && (
            <div className="px-4 py-2 border-t border-white/10 flex items-center gap-2 text-sm text-white/70">
              <Spinner className="h-4 w-4" /> Vérification…
            </div>
          )}
        </section>

        {result ? (
          <section className="space-y-4">
            <div className={`rounded-2xl border p-4 ${tone.className}`}>
              <p className="text-xs uppercase tracking-[0.16em] font-semibold opacity-80">
                {tone.label}
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold leading-tight">
                {result.message}
              </h2>
              <p className="mt-2 text-sm opacity-85">{tone.hint}</p>
            </div>

            {showBadge && (
              <div className="rounded-2xl border border-white/10 bg-black/25 p-3 sm:p-4">
                <p className="mb-3 text-center text-xs uppercase tracking-[0.14em] text-white/55 font-semibold">
                  Badge numérique du participant
                </p>
                <div className="relative mx-auto max-w-[360px]">
                  {!badgeLoaded && (
                    <div className="absolute inset-0 grid place-items-center rounded-xl bg-black/40 min-h-[420px]">
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <Spinner className="h-5 w-5" />
                        Chargement du badge…
                      </div>
                    </div>
                  )}
                  <img
                    src={badgeUrl}
                    alt={`Badge ${participant.code}`}
                    onLoad={() => setBadgeLoaded(true)}
                    className={`w-full h-auto rounded-xl border border-white/10 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.75)] bg-[#08131f] transition-opacity ${
                      badgeLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </div>
                <div className="mt-4 text-center">
                  <p className="font-display text-xl font-bold">
                    {participant.prenom} {participant.nom}
                  </p>
                  <p className="text-sm text-white/65">{participant.profession_label}</p>
                  <p className="mt-1 font-mono text-xs text-emerald-300/90">{participant.code}</p>
                  {participant.event && (
                    <p className="mt-1 text-xs text-white/50">{participant.event.title}</p>
                  )}
                  {participant.checked_in_at && (
                    <p className="mt-2 text-xs text-white/50">
                      Entrée :{' '}
                      {new Date(participant.checked_in_at).toLocaleString('fr-FR')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {result.status === 'error' && (
              <p className="text-center font-mono text-sm text-rose-200/90">
                {participant?.code || '—'}
              </p>
            )}

            <button
              type="button"
              onClick={scanNext}
              className="w-full rounded-xl bg-emerald-500 px-5 py-3.5 text-sm font-semibold text-[#042016] hover:bg-emerald-400"
            >
              Scanner le suivant
            </button>
          </section>
        ) : (
          <>
            <form onSubmit={handleManual} className="flex gap-2">
              <input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                placeholder="Code manuel STIC-XXXX-YYYY"
                className="flex-1 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm font-mono tracking-wide outline-none focus:border-emerald-400/50"
              />
              <button
                type="submit"
                disabled={busy || !manualCode.trim()}
                className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-[#042016] disabled:opacity-50"
              >
                Valider
              </button>
            </form>

            <p className="text-center text-xs text-white/40">
              Après le scan, le badge numérique s’affiche pour contrôle photo.
            </p>
          </>
        )}
      </main>
    </div>
  )
}

function Stat({ label, value, accent }) {
  return (
    <div
      className={`rounded-xl border px-3 py-2.5 ${
        accent ? 'border-emerald-400/30 bg-emerald-500/10' : 'border-white/10 bg-white/5'
      }`}
    >
      <p className="text-[10px] uppercase tracking-wider text-white/50">{label}</p>
      <p className="font-display text-xl font-bold tabular-nums">{value}</p>
    </div>
  )
}
