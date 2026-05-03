import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { api, type SkillGroup } from '../../api'

type Draft = Omit<SkillGroup, 'id'> & { id?: number }

const empty: Draft = { category: '', items: [], sort_order: 0 }

export function AdminSkills() {
  const [items, setItems] = useState<SkillGroup[]>([])
  const [draft, setDraft] = useState<Draft>(empty)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  const isEdit = useMemo(() => typeof draft.id === 'number', [draft.id])

  function load() {
    api.adminSkills()
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
        await api.adminSkillUpdate(draft.id, draft)
        setOk('Updated.')
      } else {
        await api.adminSkillCreate(draft)
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
    if (!confirm('Delete this skill group?')) return
    setBusy(true)
    setError(null)
    try {
      await api.adminSkillDelete(id)
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
            <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.01em' }}>Skills</div>
          </div>
          <button className="btn btnPrimary" onClick={save} disabled={busy || !draft.category.trim()} style={{ height: 42 }}>
            {busy ? 'Saving…' : isEdit ? 'Update' : 'Add'}
          </button>
        </div>

        {error ? <div style={{ marginTop: 12, color: 'rgba(255,120,120,0.95)', fontSize: 13 }}>{error}</div> : null}
        {ok ? <div style={{ marginTop: 12, color: 'rgba(182,243,90,0.92)', fontSize: 13 }}>{ok}</div> : null}

        <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            <Field label="Category" value={draft.category} onChange={(v) => setDraft((d) => ({ ...d, category: v }))} />
            <Field label="Sort order" value={String(draft.sort_order)} onChange={(v) => setDraft((d) => ({ ...d, sort_order: Number(v || 0) }))} />
          </div>
          <TextArea
            label="Items (one per line)"
            value={(draft.items ?? []).join('\n')}
            onChange={(v) => setDraft((d) => ({ ...d, items: v.split('\n').map((x) => x.trim()).filter(Boolean) }))}
            rows={7}
          />
        </div>
      </div>

      <div style={{ height: 12 }} />

      <div className="glass" style={{ borderRadius: 22, padding: 18 }}>
        <div style={{ fontWeight: 900, letterSpacing: '-0.01em' }}>Current groups</div>
        <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
          {items.map((s) => (
            <div key={s.id} style={{ borderRadius: 18, padding: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 900 }}>{s.category}</div>
                  <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {s.items.slice(0, 8).map((it, idx) => (
                      <span key={idx} className="chip" style={{ fontSize: 12 }}>
                        {it}
                      </span>
                    ))}
                    {s.items.length > 8 ? <span className="chip">+{s.items.length - 8}</span> : null}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn" style={{ height: 38, padding: '0 12px' }} onClick={() => setDraft({ ...s })} disabled={busy}>
                    Edit
                  </button>
                  <button className="btn" style={{ height: 38, padding: '0 12px' }} onClick={() => del(s.id)} disabled={busy}>
                    Delete
                  </button>
                </div>
              </div>
              <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>sort {s.sort_order}</div>
            </div>
          ))}
          {!items.length ? <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>No groups yet.</div> : null}
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

