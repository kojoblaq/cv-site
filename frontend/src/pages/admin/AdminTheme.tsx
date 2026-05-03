import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { api } from '../../api'

export function AdminTheme() {
  const [primary, setPrimary] = useState('#84cc16')
  const [secondary, setSecondary] = useState('#6366f1')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  useEffect(() => {
    api.adminSettings()
      .then((d) => {
        setPrimary(d.settings.primary_color)
        setSecondary(d.settings.secondary_color)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed'))
  }, [])

  async function save() {
    setBusy(true)
    setError(null)
    setOk(null)
    try {
      const res = await api.adminSettingsUpdate({ primary_color: primary, secondary_color: secondary })
      const root = document.documentElement
      root.style.setProperty('--primary', res.settings.primary_color)
      root.style.setProperty('--secondary', res.settings.secondary_color)
      setOk('Saved.')
      window.setTimeout(() => setOk(null), 1200)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.div className="glass" style={{ borderRadius: 22, padding: 18 }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>Site-wide</div>
          <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.01em' }}>Theme colors</div>
        </div>
        <button className="btn btnPrimary" onClick={save} disabled={busy} style={{ height: 42 }}>
          {busy ? 'Saving…' : 'Save'}
        </button>
      </div>

      {error ? <div style={{ marginTop: 12, color: 'rgba(255,120,120,0.95)', fontSize: 13 }}>{error}</div> : null}
      {ok ? <div style={{ marginTop: 12, color: 'rgba(182,243,90,0.92)', fontSize: 13 }}>{ok}</div> : null}

      <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
        <ColorField label="Primary color" value={primary} onChange={setPrimary} />
        <ColorField label="Secondary color" value={secondary} onChange={setSecondary} />
      </div>

      <div style={{ marginTop: 14, borderRadius: 18, padding: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)' }}>
        <div style={{ fontWeight: 900, letterSpacing: '-0.01em' }}>Preview</div>
        <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span className="chip" style={{ borderColor: 'color-mix(in srgb, var(--primary) 40%, rgba(255,255,255,0.10))' }}>Accent chip</span>
          <button className="btn btnPrimary" type="button" onClick={() => void 0}>Primary button</button>
          <span className="chip" style={{ background: 'color-mix(in srgb, var(--secondary) 18%, rgba(255,255,255,0.04))' }}>Secondary glow</span>
        </div>
      </div>
    </motion.div>
  )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label style={{ display: 'grid', gap: 8 }}>
      <span style={{ color: 'rgba(255,255,255,0.62)', fontSize: 13 }}>{label}</span>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 54, height: 44, borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent' }}
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          style={{
            height: 44,
            flex: 1,
            borderRadius: 14,
            padding: '0 14px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.92)',
            outline: 'none',
          }}
        />
      </div>
    </label>
  )
}

