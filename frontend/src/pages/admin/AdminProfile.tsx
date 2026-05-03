import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { api, type Profile } from '../../api'

export function AdminProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.adminProfile()
      .then((d) => setProfile(d.profile))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed'))
  }, [])

  async function save() {
    if (!profile) return
    setBusy(true)
    setSaved(null)
    setError(null)
    try {
      const res = await api.adminProfileUpdate(profile)
      setProfile(res.profile)
      setSaved('Saved.')
      window.setTimeout(() => setSaved(null), 1200)
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
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>Public site</div>
          <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.01em' }}>Profile</div>
        </div>
        <button className="btn btnPrimary" onClick={save} disabled={busy || !profile} style={{ height: 42 }}>
          {busy ? 'Saving…' : 'Save'}
        </button>
      </div>

      {error ? <div style={{ marginTop: 12, color: 'rgba(255,120,120,0.95)', fontSize: 13 }}>{error}</div> : null}
      {saved ? <div style={{ marginTop: 12, color: 'rgba(182,243,90,0.92)', fontSize: 13 }}>{saved}</div> : null}

      <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
        <Field label="Full name" value={profile?.full_name ?? ''} onChange={(v) => setProfile((p) => (p ? { ...p, full_name: v } : p))} />
        <Field label="Headline" value={profile?.headline ?? ''} onChange={(v) => setProfile((p) => (p ? { ...p, headline: v } : p))} />
        <Field
          label="Hero image URL (PNG recommended)"
          value={profile?.hero_image ?? ''}
          onChange={(v) => setProfile((p) => (p ? { ...p, hero_image: v } : p))}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          <Field label="Location" value={profile?.location ?? ''} onChange={(v) => setProfile((p) => (p ? { ...p, location: v } : p))} />
          <Field label="Phone" value={profile?.phone ?? ''} onChange={(v) => setProfile((p) => (p ? { ...p, phone: v } : p))} />
          <Field label="Email" value={profile?.email ?? ''} onChange={(v) => setProfile((p) => (p ? { ...p, email: v } : p))} />
          <Field label="LinkedIn URL" value={profile?.linkedin_url ?? ''} onChange={(v) => setProfile((p) => (p ? { ...p, linkedin_url: v } : p))} />
        </div>

        <TextArea label="Summary" value={profile?.summary ?? ''} onChange={(v) => setProfile((p) => (p ? { ...p, summary: v } : p))} rows={7} />
      </div>
    </motion.div>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label style={{ display: 'grid', gap: 8 }}>
      <span style={{ color: 'rgba(255,255,255,0.62)', fontSize: 13 }}>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          height: 44,
          borderRadius: 14,
          padding: '0 14px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.92)',
          outline: 'none',
        }}
      />
    </label>
  )
}

function TextArea({ label, value, onChange, rows }: { label: string; value: string; onChange: (v: string) => void; rows: number }) {
  return (
    <label style={{ display: 'grid', gap: 8 }}>
      <span style={{ color: 'rgba(255,255,255,0.62)', fontSize: 13 }}>{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        style={{
          borderRadius: 14,
          padding: '12px 14px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.92)',
          outline: 'none',
          resize: 'vertical',
        }}
      />
    </label>
  )
}

