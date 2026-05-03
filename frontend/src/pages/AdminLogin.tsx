import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

export function AdminLogin() {
  const nav = useNavigate()
  const [email, setEmail] = useState('admin@local')
  const [password, setPassword] = useState('admin12345')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await api.login(email, password)
      nav('/cx/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container" style={{ paddingTop: 64, paddingBottom: 64 }}>
      <motion.div className="glass" style={{ borderRadius: 26, padding: 22, maxWidth: 520, margin: '0 auto' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
        <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>Hidden admin</div>
        <h1 style={{ margin: '10px 0 0', fontSize: 24, letterSpacing: '-0.02em' }}>Sign in</h1>
        <p className="p" style={{ marginTop: 10, fontSize: 14 }}>Manage content, upload media, and update sections anytime.</p>

        <form onSubmit={onSubmit} style={{ marginTop: 16, display: 'grid', gap: 12 }}>
          <label style={{ display: 'grid', gap: 8 }}>
            <span style={{ color: 'rgba(255,255,255,0.62)', fontSize: 13 }}>Email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required
              style={{ height: 44, borderRadius: 14, padding: '0 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.92)', outline: 'none' }} />
          </label>
          <label style={{ display: 'grid', gap: 8 }}>
            <span style={{ color: 'rgba(255,255,255,0.62)', fontSize: 13 }}>Password</span>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required
              style={{ height: 44, borderRadius: 14, padding: '0 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.92)', outline: 'none' }} />
          </label>

          {error ? <div style={{ color: 'rgba(255,120,120,0.95)', fontSize: 13 }}>{error}</div> : null}

          <button className="btn btnPrimary" type="submit" disabled={busy} style={{ height: 44 }}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

