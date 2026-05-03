import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { AdminProfile } from './admin/AdminProfile'
import { AdminExperience } from './admin/AdminExperience'
import { AdminSkills } from './admin/AdminSkills'
import { AdminAchievements } from './admin/AdminAchievements'
import { AdminMedia } from './admin/AdminMedia'
import { AdminTheme } from './admin/AdminTheme'

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="container" style={{ paddingTop: 28, paddingBottom: 64 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>CreateX CMS</div>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em' }}>Admin</div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link className="btn" to="/">Public site</Link>
          <button
            className="btn"
            onClick={async () => {
              await api.logout()
              window.location.href = '/'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
        <Link className="chip" to="/cx/dashboard">Dashboard</Link>
        <Link className="chip" to="/cx/profile">Profile</Link>
        <Link className="chip" to="/cx/experience">Experience</Link>
        <Link className="chip" to="/cx/skills">Skills</Link>
        <Link className="chip" to="/cx/achievements">Achievements</Link>
        <Link className="chip" to="/cx/media">Media</Link>
        <Link className="chip" to="/cx/theme">Theme</Link>
        <a className="chip" href="/api/public" target="_blank" rel="noreferrer">API payload</a>
      </div>

      <div style={{ marginTop: 16 }}>{children}</div>
    </div>
  )
}

function Dashboard() {
  return (
    <motion.div className="glass" style={{ borderRadius: 22, padding: 18 }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
      <div style={{ fontWeight: 900, letterSpacing: '-0.01em' }}>You’re in.</div>
      <p className="p" style={{ marginTop: 10, fontSize: 14 }}>
        CMS UI is now React-based. Next step is expanding this panel into full CRUD screens (Experience, Skills, Achievements, Media uploads) with drag-and-drop ordering.
      </p>
      <p className="p" style={{ marginTop: 10, fontSize: 14 }}>
        For now, the site already reads everything from the database via the Flask API.
      </p>
    </motion.div>
  )
}

export function AdminShell() {
  const nav = useNavigate()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let alive = true
    api.me()
      .then((d) => {
        if (!alive) return
        if (!d.user) nav('/cx')
        else setReady(true)
      })
      .catch(() => nav('/cx'))
    return () => {
      alive = false
    }
  }, [nav])

  if (!ready) return null

  return (
    <Shell>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="experience" element={<AdminExperience />} />
        <Route path="skills" element={<AdminSkills />} />
        <Route path="achievements" element={<AdminAchievements />} />
        <Route path="media" element={<AdminMedia />} />
        <Route path="theme" element={<AdminTheme />} />
      </Routes>
    </Shell>
  )
}

