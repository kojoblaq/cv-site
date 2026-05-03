import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Sparkles } from 'lucide-react'
import { api, type PublicPayload } from '../api'
import thumbPerson from '../assets/thumb-person.svg'
import { Footer } from '../ui/Footer'

const sectionIn = {
  hidden: { opacity: 0, y: 18, filter: 'blur(8px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)' },
}

function usePublicPayload() {
  const [data, setData] = useState<PublicPayload | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    api.public()
      .then((d) => {
        if (!alive) return
        setData(d)
        const root = document.documentElement
        root.style.setProperty('--primary', d.settings.primary_color)
        root.style.setProperty('--secondary', d.settings.secondary_color)
      })
      .catch((e: unknown) => {
        if (!alive) return
        setError(e instanceof Error ? e.message : 'Failed to load')
      })
    return () => {
      alive = false
    }
  }, [])

  return { data, error }
}

export function Home() {
  const { data, error } = usePublicPayload()

  const profile = data?.profile
  const experiences = data?.experiences ?? []
  const skills = data?.skills ?? []
  const achievements = data?.achievements ?? []
  const media = (data?.media ?? []).slice(0, 12)

  const heroRef = useRef<HTMLDivElement | null>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [9, -9]), { stiffness: 180, damping: 18 })
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), { stiffness: 180, damping: 18 })
  const sx = useSpring(useTransform(mx, [-0.5, 0.5], [-70, 70]), { stiffness: 220, damping: 22 })
  const sy = useSpring(useTransform(my, [-0.5, 0.5], [-40, 40]), { stiffness: 220, damping: 22 })

  function onHeroMove(e: React.MouseEvent) {
    const el = heroRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    mx.set(px - 0.5)
    my.set(py - 0.5)
  }

  function onHeroLeave() {
    mx.set(0)
    my.set(0)
  }

  return (
    <div>
      <header style={{ position: 'sticky', top: 0, zIndex: 20, backdropFilter: 'blur(18px)' }}>
        <div
          style={{
            background: 'rgba(5,6,7,0.72)',
            borderBottom: '1px solid rgba(255,255,255,0.10)',
          }}
        >
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px' }}>
            <a href="/" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              {(profile?.full_name ?? 'Gerald')}{' '}
              <span style={{ color: 'var(--primary)' }}>·</span>
            </a>
            <nav style={{ display: 'flex', gap: 18, color: 'var(--muted)', fontSize: 13 }}>
              <a href="#work">Work</a>
              <a href="#skills">Skills</a>
              <a href="#wins">Wins</a>
              <a href="#gallery">Gallery</a>
              <a href="#contact">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      <main style={{ scrollSnapType: 'y mandatory' }}>
        <section
          className="container"
          style={{
            paddingTop: 48,
            paddingBottom: 48,
            minHeight: 'calc(100svh - 76px)',
            display: 'grid',
            alignContent: 'center',
            scrollSnapAlign: 'start',
          }}
        >
          <div className="grid2" style={{ alignItems: 'center' }}>
            <div>

              <motion.h1 className="h1" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
                {profile?.full_name ?? ''}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'grid', gap: 12, marginTop: 12 }}
              >
                <div
                  style={{
                    width: 92,
                    height: 4,
                    borderRadius: 99,
                    background: 'color-mix(in srgb, var(--primary) 90%, transparent)',
                    boxShadow: '0 0 0 8px color-mix(in srgb, var(--primary) 14%, transparent)',
                  }}
                />
                {profile?.headline ? (
                  <div style={{ color: 'rgba(255,255,255,0.74)', fontWeight: 800, letterSpacing: '-0.01em' }}>{profile.headline}</div>
                ) : null}
              </motion.div>

              {profile?.summary ? (
                <motion.p className="p" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }} style={{ fontSize: 16, marginTop: 18 }}>
                  {profile.summary}
                </motion.p>
              ) : null}

              <div style={{ display: 'flex', gap: 12, marginTop: 22, flexWrap: 'wrap' }}>
                <a className="btn btnPrimary" href="#contact">
                  <Sparkles size={16} />
                  Contact
                </a>
                <a className="btn" href="#work">
                  Work <ArrowUpRight size={16} />
                </a>
              </div>

              {error ? null : null}

              <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap', color: 'var(--muted2)', fontSize: 13 }}>
                {profile?.location ? (
                  <a
                    className="chip"
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.location)}`}
                    target="_blank"
                    rel="noreferrer"
                    title="Open in Google Maps"
                  >
                    📍 {profile.location} <ArrowUpRight size={14} />
                  </a>
                ) : null}
                {profile?.phone ? (
                  <a className="chip" href={`tel:${profile.phone.replace(/\s+/g, '')}`} title="Call">
                    📞 {profile.phone}
                  </a>
                ) : null}
                {profile?.email ? (
                  <a className="chip" href={`mailto:${profile.email}`} title="Email">
                    ✉ {profile.email}
                  </a>
                ) : null}
                {profile?.linkedin_url ? (
                  <a className="chip" href={profile.linkedin_url} target="_blank" rel="noreferrer">
                    LinkedIn <ArrowUpRight size={14} />
                  </a>
                ) : null}
              </div>
            </div>

            <motion.div
              ref={heroRef}
              className="glass"
              onMouseMove={onHeroMove}
              onMouseLeave={onHeroLeave}
              style={{ borderRadius: 26, padding: 16, position: 'relative', overflow: 'hidden', perspective: 900 }}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              <div aria-hidden="true" style={{ position: 'absolute', inset: -60, background: 'color-mix(in srgb, var(--secondary) 12%, transparent)', filter: 'blur(46px)', opacity: 0.6 }} />
              <div aria-hidden="true" style={{ position: 'absolute', inset: -80, background: 'color-mix(in srgb, var(--primary) 14%, transparent)', filter: 'blur(54px)', opacity: 0.55 }} />

              <motion.div
                style={{
                  position: 'relative',
                  borderRadius: 22,
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.14)',
                  background: 'rgba(255,255,255,0.04)',
                  transformStyle: 'preserve-3d',
                  rotateX: rx,
                  rotateY: ry,
                }}
              >
                <motion.div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: -120,
                    x: sx,
                    y: sy,
                    background: 'radial-gradient(circle at 40% 40%, rgba(255,255,255,0.20), transparent 58%)',
                    opacity: 0.55,
                    mixBlendMode: 'overlay',
                  }}
                />
                <div style={{ aspectRatio: '4 / 3' }}>
                  <img
                    src={profile?.hero_image || thumbPerson}
                    alt={profile?.full_name ? `${profile.full_name} portrait` : 'Portrait'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    loading="eager"
                    onError={(e) => {
                      ;(e.currentTarget as HTMLImageElement).src = thumbPerson
                    }}
                  />
                </div>
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.18,
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='260'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='260' height='260' filter='url(%23n)' opacity='0.50'/%3E%3C/svg%3E\")",
                    backgroundSize: '260px 260px',
                    mixBlendMode: 'overlay',
                  }}
                />
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section id="work" className="container" style={{ paddingTop: 60, paddingBottom: 60, minHeight: '100svh', display: 'grid', alignContent: 'center', scrollSnapAlign: 'start' }}>
          <motion.div variants={sectionIn} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}>
            <h2 className="h2">Experience</h2>
          </motion.div>
          <div style={{ marginTop: 18, display: 'grid', gap: 12 }}>
            {experiences.map((e) => (
              <motion.article
                key={e.id}
                className="glass"
                style={{ borderRadius: 22, padding: 18 }}
                variants={sectionIn}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 900, letterSpacing: '-0.01em' }}>{e.title}</div>
                    <div style={{ color: 'var(--muted)', marginTop: 4 }}>
                      {e.company}
                      {e.location ? <span style={{ color: 'var(--muted2)' }}> · {e.location}</span> : null}
                    </div>
                  </div>
                  <div style={{ color: 'var(--muted2)', fontSize: 13 }}>
                    {e.start} – {e.end}
                  </div>
                </div>
                {!!e.bullets?.length && (
                  <ul style={{ margin: '12px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
                    {e.bullets.map((b, i) => (
                      <li key={i} style={{ display: 'flex', gap: 10, color: 'rgba(255,255,255,0.82)', lineHeight: 1.55 }}>
                        <span style={{ color: 'var(--primary)', marginTop: 2 }}>▸</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.article>
            ))}
          </div>
        </section>

        <section id="skills" className="container" style={{ paddingTop: 60, paddingBottom: 60, minHeight: '100svh', display: 'grid', alignContent: 'center', scrollSnapAlign: 'start' }}>
          <motion.div variants={sectionIn} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}>
            <h2 className="h2">Skills & tools</h2>
          </motion.div>
          <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12 }}>
            {skills.map((s) => (
              <motion.div
                key={s.id}
                className="glass"
                style={{ borderRadius: 22, padding: 18 }}
                variants={sectionIn}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <div style={{ fontWeight: 900, letterSpacing: '-0.01em' }}>{s.category}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
                  {s.items.map((it, idx) => (
                    <span key={idx} className="chip" style={{ fontSize: 12 }}>
                      {it}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="wins" className="container" style={{ paddingTop: 60, paddingBottom: 60, minHeight: '100svh', display: 'grid', alignContent: 'center', scrollSnapAlign: 'start' }}>
          <motion.div variants={sectionIn} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}>
            <h2 className="h2">Key achievements</h2>
          </motion.div>
          <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 12 }}>
            {achievements.map((a) => (
              <motion.div
                key={a.id}
                className="glass"
                style={{ borderRadius: 22, padding: 18, display: 'flex', gap: 12 }}
                variants={sectionIn}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    background: 'rgba(132,204,22,0.14)',
                    border: '1px solid rgba(132,204,22,0.24)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.92)',
                    fontWeight: 900,
                  }}
                >
                  ★
                </div>
                <div style={{ color: 'rgba(255,255,255,0.82)', lineHeight: 1.6 }}>{a.text}</div>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="gallery" className="container" style={{ paddingTop: 60, paddingBottom: 60, minHeight: '100svh', display: 'grid', alignContent: 'center', scrollSnapAlign: 'start' }}>
          <motion.div variants={sectionIn} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}>
            <h2 className="h2">Gallery</h2>
          </motion.div>
          <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
            {media.map((m) => (
              <motion.a
                key={m.id}
                href={m.url}
                target="_blank"
                rel="noreferrer"
                className="glass"
                style={{ borderRadius: 22, overflow: 'hidden' }}
                variants={sectionIn}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -3 }}
              >
                <div style={{ aspectRatio: '4/3', background: 'rgba(255,255,255,0.04)' }}>
                  <img src={m.url} alt={m.title ?? 'Media'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
                <div style={{ padding: 14 }}>
                  <div style={{ fontWeight: 900, letterSpacing: '-0.01em' }}>{m.title ?? 'Untitled'}</div>
                  {m.description ? <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6 }}>{m.description}</div> : null}
                </div>
              </motion.a>
            ))}
          </div>
          {!media.length ? (
            <div style={{ marginTop: 18 }} className="glass">
              <div style={{ padding: 18, borderRadius: 22, display: 'flex', gap: 14, alignItems: 'center' }}>
                <img src={thumbPerson} alt="Thumbnail" style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 16, opacity: 0.85 }} />
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>No media yet.</div>
              </div>
            </div>
          ) : null}
        </section>

        <section id="contact" className="container" style={{ paddingTop: 60, paddingBottom: 80, minHeight: '100svh', display: 'grid', alignContent: 'center', scrollSnapAlign: 'start' }}>
          <motion.div className="glass" style={{ borderRadius: 28, padding: 22, overflow: 'hidden', position: 'relative' }} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={sectionIn} transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <div>
                <h2 className="h2">Contact</h2>
              </div>
              {profile?.email ? (
                <a className="btn btnPrimary" href={`mailto:${profile.email}`}>
                  Email <ArrowUpRight size={16} />
                </a>
              ) : (
                <span className="chip">✉ Email not set</span>
              )}
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

