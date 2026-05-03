import { Lock } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.10)', background: 'rgba(5,6,7,0.62)' }}>
      <div className="container" style={{ padding: '26px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
          © {new Date().getFullYear()} CreateX Studios Inc.
        </div>
        <Link
          to="/cx"
          aria-label="Admin"
          title="Admin"
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.10)',
            color: 'rgba(255,255,255,0.52)',
          }}
        >
          <Lock size={16} />
        </Link>
      </div>
    </footer>
  )
}

