import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { api, type Achievement } from '../../api'

type Draft = Omit<Achievement, 'id'> & { id?: number }
const empty: Draft = { text: '', sort_order: 0 }

export function AdminAchievements() {
  const [items, setItems] = useState<Achievement[]>([])
  const [draft, setDraft] = useState<Draft>(empty)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  const isEdit = useMemo(() => typeof draft.id === 'number', [draft.id])

  function load() {
    api.adminAchievements()
      .then((d) => setItems(d.items))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed'))
  }

  useEffect(() => load(), [])

  async function save() {
    setBusy(true)
    setError(null)
    setOk(null)
    try {
      if (isEdit && draft.id != null) {
        await api.adminAchievementUpdate(draft.id, draft)
        setOk('Updated.')
      } else {
        await api.adminAchievementCreate(draft)
        setOk('Created.')
      }
      setDraft(empty)
      load()
      window.setTimeout(() => setOk(null), 1200)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  async function del(id: number) {
    if (!confirm('Delete this achievement?')) return
    setBusy(true)
    setError(null)
    try {
      await api.adminAchievementDelete(id)
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
            <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.01em' }}>Achievements</div>
          </div>
          <button className="btn btnPrimary" onClick={save} disabled={busy || !draft.text.trim()} style={{ height: 42 }}>
            {busy ? 'Saving…' : isEdit ? 'Update' : 'Add'}
          </button>
        </div>

        {error ? <div style={{ marginTop: 12, color: 'rgba(255,120,120,0.95)', fontSize: 13 }}>{error}</div> : null}
        {ok ? <div style={{ marginTop: 12, color: 'rgba(182,243,90,0.92)', fontSize: 13 }}>{ok}</div> : null}

        <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            <Field label="Sort order" value={String(draft.sort_order)} onChange={(v) => setDraft((d) => ({ ...d, sort_order: Number(v || 0) }))} />
          </div>
          <TextArea label="Text" value={draft.text} onChange={(v) => setDraft((d) => ({ ...d, text: v }))} rows={5} />
        </div>
      </div>

      <div style={{ height: 12 }} />

      <div className="glass" style={{ borderRadius: 22, padding: 18 }}>
        <div style={{ fontWeight: 900, letterSpacing: '-0.01em' }}>Current items</div>
        <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
          {items.map((a) => (
            <div key={a.id} style={{ borderRadius: 18, padding: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ maxWidth: 780 }}>
                  <div style={{ fontWeight: 900 }}>sort {a.sort_order}</div>
                  <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.76)', lineHeight: 1.55 }}>{a.text}</div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn" style={{ height: 38, padding: '0 12px' }} onClick={() => setDraft({ ...a })} disabled={busy}>
                    Edit
                  </button>
                  <button className="btn" style={{ height: 38, padding: '0 12px' }} onClick={() => del(a.id)} disabled={busy}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!items.length ? <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>No items yet.</div> : null}
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

