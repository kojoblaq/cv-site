import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { api, type MediaItem } from '../../api'

export function AdminMedia() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  function load() {
    api.adminMedia()
      .then((d) => setItems(d.items))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed'))
  }

  useEffect(() => load(), [])

  async function upload() {
    if (!file) return
    setBusy(true)
    setError(null)
    setOk(null)
    try {
      await api.adminMediaUpload({ file, title, description })
      setTitle('')
      setDescription('')
      setFile(null)
      load()
      setOk('Uploaded.')
      window.setTimeout(() => setOk(null), 1200)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  async function del(id: number) {
    if (!confirm('Delete this media item?')) return
    setBusy(true)
    setError(null)
    try {
      await api.adminMediaDelete(id)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
      <div className="glass" style={{ borderRadius: 22, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>Public site</div>
            <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.01em' }}>Media</div>
          </div>
          <button className="btn btnPrimary" onClick={upload} disabled={busy || !file} style={{ height: 42 }}>
            {busy ? 'Uploading…' : 'Upload'}
          </button>
        </div>

        {error ? <div style={{ marginTop: 12, color: 'rgba(255,120,120,0.95)', fontSize: 13 }}>{error}</div> : null}
        {ok ? <div style={{ marginTop: 12, color: 'rgba(182,243,90,0.92)', fontSize: 13 }}>{ok}</div> : null}

        <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
          <Field label="Title" value={title} onChange={setTitle} />
          <TextArea label="Description" value={description} onChange={setDescription} rows={4} />
          <label style={{ display: 'grid', gap: 8 }}>
            <span style={{ color: 'rgba(255,255,255,0.62)', fontSize: 13 }}>File (JPG/PNG/WEBP)</span>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              style={{
                height: 44,
                borderRadius: 14,
                padding: '9px 14px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.76)',
                outline: 'none',
              }}
            />
          </label>
        </div>
      </div>

      <div style={{ height: 12 }} />

      <div className="glass" style={{ borderRadius: 22, padding: 18 }}>
        <div style={{ fontWeight: 900, letterSpacing: '-0.01em' }}>Library</div>
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          {items.map((m) => (
            <div key={m.id} style={{ borderRadius: 18, overflow: 'hidden', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)' }}>
              <a href={m.url} target="_blank" rel="noreferrer" style={{ display: 'block', aspectRatio: '4/3', background: 'rgba(255,255,255,0.03)' }}>
                <img src={m.url} alt={m.title ?? 'Media'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </a>
              <div style={{ padding: 12 }}>
                <div style={{ fontWeight: 900 }}>{m.title ?? 'Untitled'}</div>
                {m.description ? <div style={{ color: 'rgba(255,255,255,0.66)', fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>{m.description}</div> : null}
                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>{m.created_at ? m.created_at.slice(0, 10) : ''}</div>
                  <button className="btn" style={{ height: 34, padding: '0 12px' }} onClick={() => del(m.id)} disabled={busy}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!items.length ? <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>No uploads yet.</div> : null}
        </div>
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

