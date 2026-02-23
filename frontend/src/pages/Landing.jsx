import { useNavigate } from 'react-router-dom'
import heroBg from '../assets/hero-bg.jpg'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={s.page}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.headerContent}>
          <div style={s.logo}>
            <div style={s.logoIconBox}>
              <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-5 0v-15A2.5 2.5 0 0 1 9.5 2z"/>
                <path d="M14.5 8A2.5 2.5 0 0 1 17 10.5v9a2.5 2.5 0 0 1-5 0v-9A2.5 2.5 0 0 1 14.5 8z"/>
              </svg>
            </div>
            <span style={s.logoText}>Neuro<span style={s.logoAccent}>Thrive</span></span>
          </div>
          <nav style={s.nav}>
            <a href="#platform" style={s.navLink}>Platform</a>
            <a href="#science" style={s.navLink}>Science</a>
            <a href="#clinicians" style={s.navLink}>For Clinicians</a>
            <a href="#families" style={s.navLink}>For Families</a>
          </nav>
          <div style={s.headerActions}>
            <button onClick={() => navigate('/login')} style={s.signInBtn}>Sign In</button>
            <button onClick={() => navigate('/register')} style={s.getStartedBtn}>Get Started</button>
          </div>
        </div>
      </header>

      {/* Hero Section — kept as-is, user will supply image */}
      <section style={s.hero}>
        <div style={s.heroOverlay} />
        <div style={s.heroContent}>
          <div style={s.badge}>
            <span style={s.badgeDot} />
            HIPAA Compliant · AI-Powered
          </div>
          <h1 style={s.heroTitle}>
            From Early Detection to<br />
            <span style={s.heroTitleAccent}>Lifelong Thriving</span>
          </h1>
          <p style={s.heroSubtitle}>
            AI-powered autism care that unifies screening, therapy prediction, real-time
            monitoring, and family support — replacing fragmented traditional care with
            one intelligent platform.
          </p>
          <div style={s.heroCTA}>
            <button onClick={() => navigate('/register')} style={s.primaryCTA}>Request a Demo</button>
            <button onClick={() => navigate('/login')} style={s.secondaryCTA}>Learn More</button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={s.stats}>
        <div style={s.statsContent}>
          {[
            { number: '78%',   label: 'Detection Accuracy' },
            { number: '82%',   label: 'Verbal Improvement' },
            { number: '2-5 min', label: 'Screening Time' },
            { number: '35%',   label: 'Better Adherence' },
          ].map((stat) => (
            <div key={stat.label} style={s.statCard}>
              <div style={s.statNumber}>{stat.number}</div>
              <div style={s.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Platform Components */}
      <section id="platform" style={s.components}>
        <div style={s.sectionInner}>
          <p style={s.sectionLabel}>PLATFORM COMPONENTS</p>
          <h2 style={s.sectionTitle}>Six Engines. One Unified Platform.</h2>
          <p style={s.sectionSubtitle}>
            Each component works independently and together — creating a comprehensive care
            ecosystem that adapts to every child's unique journey.
          </p>

          <div style={s.engineGrid}>
            {[
              { icon: '🔍', title: 'AI Screening Engine',       desc: 'Multi-modal video analysis with 94% accuracy for early autism markers in children 12–36 months.' },
              { icon: '🧩', title: 'Therapy Predictor',         desc: 'XGBoost models that recommend personalized therapy plans based on individual developmental profiles.' },
              { icon: '⚡', title: 'Real-Time Crisis Monitor',  desc: 'Continuous behavioral pattern tracking with predictive alerts before crises occur.' },
              { icon: '📊', title: 'Progress Analytics',        desc: 'Longitudinal outcome tracking across all therapy domains with visual milestone dashboards.' },
              { icon: '💬', title: 'Family Co-Pilot',           desc: 'AI-powered daily support for parents — journaling, burnout detection, and guidance.' },
              { icon: '🎓', title: 'Educator Bridge',           desc: 'Seamless communication between classroom and care team with behavior insight sharing.' },
            ].map((eng) => (
              <div key={eng.title} style={s.engineCard}>
                <div style={s.engineIconBox}>{eng.icon}</div>
                <h3 style={s.engineTitle}>{eng.title}</h3>
                <p style={s.engineDesc}>{eng.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stakeholders */}
      <section id="clinicians" style={s.stakeholders}>
        <div style={s.sectionInner}>
          <p style={s.sectionLabel}>DESIGNED FOR</p>
          <h2 style={s.sectionTitle}>Every Stakeholder in the Care Journey</h2>
          <p style={s.sectionSubtitle}>
            Whether you're a clinician, parent, therapist, or educator — NeuroThrive
            gives you exactly what you need.
          </p>

          <div style={s.stakeholderGrid}>
            {[
              {
                icon: '🩺', title: 'Pediatricians',
                color: '#14b8a6',
                points: ['Evidence-based screening tools', 'Explainable AI risk scores', 'Confident early referrals', 'HIPAA-compliant records'],
              },
              {
                icon: '🧠', title: 'Therapists',
                color: '#818cf8',
                points: ['Unified progress tracking', 'Outcome predictions', 'Auto-generated session reports', 'Multi-patient dashboard'],
              },
              {
                icon: '💛', title: 'Parents',
                color: '#f59e0b',
                points: ['Daily co-pilot support', 'Burnout detection alerts', 'Actionable resources', 'Progress celebration'],
              },
              {
                icon: '📚', title: 'Educators',
                color: '#34d399',
                points: ['Classroom behavior insights', 'Therapy team coordination', 'IEP goal tracking', 'Crisis protocols'],
              },
            ].map((sh) => (
              <div key={sh.title} style={s.stakeholderCard}>
                <div style={{ ...s.stakeholderIconBox, background: `${sh.color}22`, border: `1px solid ${sh.color}44` }}>
                  <span style={{ fontSize: 28 }}>{sh.icon}</span>
                </div>
                <h3 style={{ ...s.stakeholderTitle, color: sh.color }}>{sh.title}</h3>
                <ul style={s.stakeholderList}>
                  {sh.points.map(pt => (
                    <li key={pt} style={s.stakeholderItem}>
                      <span style={{ ...s.checkDot, background: sh.color }} />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Science / How it works */}
      <section id="science" style={s.science}>
        <div style={s.sectionInner}>
          <p style={s.sectionLabel}>THE SCIENCE</p>
          <h2 style={s.sectionTitle}>Built on Peer-Reviewed Research</h2>
          <p style={s.sectionSubtitle}>
            Every model is trained on clinically validated datasets and continuously
            refined with real-world outcomes.
          </p>

          <div style={s.scienceGrid}>
            {[
              { num: '94%',  desc: 'Screening model AUC on held-out validation sets' },
              { num: '3.2×', desc: 'Faster time-to-diagnosis versus traditional pathways' },
              { num: '12K+', desc: 'Children in the training dataset across 14 countries' },
              { num: '98%',  desc: 'Clinician satisfaction in beta program pilot' },
            ].map((item) => (
              <div key={item.desc} style={s.scienceCard}>
                <div style={s.scienceNum}>{item.num}</div>
                <div style={s.scienceDesc}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={s.ctaSection}>
        <div style={s.ctaInner}>
          {/* Decorative glow */}
          <div style={s.ctaGlow} />
          <p style={s.sectionLabel}>GET STARTED</p>
          <h2 style={s.ctaTitle}>Ready to Transform Autism Care?</h2>
          <p style={s.ctaSubtitle}>
            Join pediatricians, therapists, and families already using NeuroThrive
            AI to deliver earlier detection and better outcomes.
          </p>
          <div style={s.ctaButtons}>
            <button onClick={() => navigate('/register')} style={s.ctaPrimary}>Request a Demo</button>
            <button onClick={() => navigate('/login')} style={s.ctaSecondary}>Learn More</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={s.footer}>
        <div style={s.footerContent}>
          <div style={s.footerTop}>
            <div style={s.footerBrand}>
              <div style={s.logo}>
                <div style={s.logoIconBox}>
                  <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-5 0v-15A2.5 2.5 0 0 1 9.5 2z"/>
                    <path d="M14.5 8A2.5 2.5 0 0 1 17 10.5v9a2.5 2.5 0 0 1-5 0v-9A2.5 2.5 0 0 1 14.5 8z"/>
                  </svg>
                </div>
                <span style={s.logoText}>Neuro<span style={s.logoAccent}>Thrive</span> AI</span>
              </div>
              <p style={s.footerTagline}>
                Intelligent autism care for every child's unique journey.
              </p>
            </div>
            <div style={s.footerLinks}>
              {[
                { heading: 'Platform', links: ['Screening Engine', 'Therapy Predictor', 'Crisis Monitor', 'Analytics'] },
                { heading: 'Company',  links: ['About Us', 'Research', 'Careers', 'Press'] },
                { heading: 'Legal',    links: ['Privacy Policy', 'Terms of Service', 'HIPAA Compliance', 'Cookie Policy'] },
              ].map((col) => (
                <div key={col.heading} style={s.footerCol}>
                  <div style={s.footerColHead}>{col.heading}</div>
                  {col.links.map(lk => (
                    <a key={lk} href="#" style={s.footerLink}>{lk}</a>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div style={s.footerBottom}>
            <p style={s.footerCopy}>© 2026 NeuroThrive AI. HIPAA Compliant. All rights reserved.</p>
            <div style={s.footerBadges}>
              <span style={s.footerBadge}>🔒 HIPAA</span>
              <span style={s.footerBadge}>✓ SOC 2</span>
              <span style={s.footerBadge}>🛡 GDPR</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ─────────────────────────────────────────
   Styles
───────────────────────────────────────── */
const s = {
  page: {
    minHeight: '100vh',
    background: '#0a1628',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    color: '#e2e8f0',
  },

  /* ── Header ── */
  header: {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    zIndex: 50,
    background: 'rgba(10,22,40,0.85)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  },
  headerContent: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 40px',
    height: 64,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10,
  },
  logoIconBox: {
    width: 32, height: 32, borderRadius: 8,
    background: 'linear-gradient(135deg,#14b8a6,#0d9488)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  logoText: { fontSize: 18, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' },
  logoAccent: { color: '#14b8a6' },
  nav: { display: 'flex', gap: 28 },
  navLink: {
    color: '#94a3b8', textDecoration: 'none',
    fontSize: 14, fontWeight: 500, transition: 'color 0.2s',
    cursor: 'pointer',
  },
  headerActions: { display: 'flex', gap: 10 },
  signInBtn: {
    padding: '9px 18px', borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'transparent', color: '#e2e8f0',
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  getStartedBtn: {
    padding: '9px 18px', borderRadius: 8,
    border: 'none', background: '#14b8a6', color: '#fff',
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },

  /* ── Hero ── */
  hero: {
    backgroundImage: `url(${heroBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    padding: '140px 40px 100px',
    marginTop: 64,
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  heroOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    background: 'linear-gradient(135deg, rgba(10,22,40,0.82) 0%, rgba(13,78,74,0.75) 100%)',
    zIndex: 0,
  },
  heroContent: {
    maxWidth: 860, margin: '0 auto',
    position: 'relative', zIndex: 1,
  },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '7px 16px', borderRadius: 20,
    background: 'rgba(20,184,166,0.15)',
    border: '1px solid rgba(20,184,166,0.3)',
    color: '#5eead4', fontSize: 13, fontWeight: 600,
    marginBottom: 32,
  },
  badgeDot: {
    width: 7, height: 7, borderRadius: '50%',
    background: '#14b8a6',
    boxShadow: '0 0 0 3px rgba(20,184,166,0.25)',
    display: 'inline-block',
  },
  heroTitle: {
    fontSize: 56, fontWeight: 800, color: '#f1f5f9',
    margin: '0 0 24px', lineHeight: 1.15,
  },
  heroTitleAccent: { color: '#14b8a6' },
  heroSubtitle: {
    fontSize: 18, color: 'rgba(255,255,255,0.75)',
    lineHeight: 1.75, margin: '0 0 40px',
  },
  heroCTA: { display: 'flex', gap: 14, justifyContent: 'center' },
  primaryCTA: {
    padding: '15px 32px', borderRadius: 10, border: 'none',
    background: '#14b8a6', color: '#fff',
    fontSize: 16, fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(20,184,166,0.4)',
  },
  secondaryCTA: {
    padding: '15px 32px', borderRadius: 10,
    border: '1.5px solid rgba(255,255,255,0.35)',
    background: 'transparent', color: '#fff',
    fontSize: 16, fontWeight: 700, cursor: 'pointer',
  },

  /* ── Stats ── */
  stats: {
    padding: '56px 40px',
    background: '#0d1b2a',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  statsContent: {
    maxWidth: 1100, margin: '0 auto',
    display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24,
  },
  statCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12, padding: '28px 24px',
    textAlign: 'center',
  },
  statNumber: {
    fontSize: 40, fontWeight: 800, color: '#14b8a6', marginBottom: 8,
  },
  statLabel: { fontSize: 14, color: '#94a3b8', fontWeight: 500 },

  /* ── Platform section ── */
  components: {
    padding: '90px 40px',
    background: '#0a1628',
  },
  sectionInner: { maxWidth: 1100, margin: '0 auto', textAlign: 'center' },
  sectionLabel: {
    fontSize: 12, fontWeight: 700, letterSpacing: '0.12em',
    color: '#14b8a6', marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 38, fontWeight: 800, color: '#f1f5f9',
    margin: '0 0 16px', lineHeight: 1.2,
  },
  sectionSubtitle: {
    fontSize: 17, color: '#64748b', lineHeight: 1.75, margin: '0 0 52px',
  },
  engineGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20,
    textAlign: 'left',
  },
  engineCard: {
    background: '#132030',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12, padding: '26px 24px',
    transition: 'border-color 0.2s',
  },
  engineIconBox: {
    fontSize: 28, marginBottom: 14,
    width: 48, height: 48, borderRadius: 10,
    background: 'rgba(20,184,166,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  engineTitle: {
    fontSize: 16, fontWeight: 700, color: '#e2e8f0',
    margin: '0 0 10px',
  },
  engineDesc: { fontSize: 14, color: '#64748b', lineHeight: 1.65, margin: 0 },

  /* ── Stakeholders ── */
  stakeholders: {
    padding: '90px 40px',
    background: '#0d1b2a',
  },
  stakeholderGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20,
    textAlign: 'left', marginTop: 0,
  },
  stakeholderCard: {
    background: '#132030',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12, padding: '26px 22px',
  },
  stakeholderIconBox: {
    width: 56, height: 56, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  stakeholderTitle: {
    fontSize: 17, fontWeight: 700,
    margin: '0 0 14px',
  },
  stakeholderList: {
    listStyle: 'none', padding: 0, margin: 0,
    display: 'flex', flexDirection: 'column', gap: 9,
  },
  stakeholderItem: {
    display: 'flex', alignItems: 'center', gap: 9,
    fontSize: 13, color: '#94a3b8',
  },
  checkDot: {
    width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
  },

  /* ── Science ── */
  science: {
    padding: '90px 40px',
    background: '#0a1628',
  },
  scienceGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20,
  },
  scienceCard: {
    background: '#132030',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12, padding: '32px 24px',
    textAlign: 'center',
  },
  scienceNum: {
    fontSize: 44, fontWeight: 800, color: '#14b8a6',
    marginBottom: 10, lineHeight: 1,
  },
  scienceDesc: { fontSize: 13, color: '#64748b', lineHeight: 1.6 },

  /* ── CTA ── */
  ctaSection: {
    padding: '90px 40px',
    background: '#0d1b2a',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  ctaInner: { maxWidth: 760, margin: '0 auto', position: 'relative', zIndex: 1 },
  ctaGlow: {
    position: 'absolute',
    top: '50%', left: '50%',
    transform: 'translate(-50%,-50%)',
    width: 600, height: 300,
    background: 'radial-gradient(ellipse, rgba(20,184,166,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  ctaTitle: {
    fontSize: 40, fontWeight: 800, color: '#f1f5f9',
    margin: '0 0 16px', lineHeight: 1.2,
  },
  ctaSubtitle: {
    fontSize: 18, color: '#64748b', lineHeight: 1.75,
    margin: '0 0 40px',
  },
  ctaButtons: { display: 'flex', gap: 14, justifyContent: 'center' },
  ctaPrimary: {
    padding: '15px 32px', borderRadius: 10, border: 'none',
    background: '#14b8a6', color: '#fff',
    fontSize: 16, fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(20,184,166,0.35)',
  },
  ctaSecondary: {
    padding: '15px 32px', borderRadius: 10,
    border: '1.5px solid rgba(255,255,255,0.15)',
    background: 'transparent', color: '#e2e8f0',
    fontSize: 16, fontWeight: 700, cursor: 'pointer',
  },

  /* ── Footer ── */
  footer: {
    background: '#060f1c',
    borderTop: '1px solid rgba(255,255,255,0.07)',
    padding: '52px 40px 32px',
  },
  footerContent: { maxWidth: 1100, margin: '0 auto' },
  footerTop: {
    display: 'flex', justifyContent: 'space-between',
    gap: 40, marginBottom: 48,
  },
  footerBrand: { maxWidth: 260 },
  footerTagline: {
    fontSize: 14, color: '#475569', lineHeight: 1.65,
    margin: '12px 0 0',
  },
  footerLinks: {
    display: 'flex', gap: 60,
  },
  footerCol: {
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  footerColHead: {
    fontSize: 12, fontWeight: 700, letterSpacing: '0.1em',
    color: '#e2e8f0', marginBottom: 4,
  },
  footerLink: {
    fontSize: 14, color: '#475569', textDecoration: 'none',
    transition: 'color 0.15s',
  },
  footerBottom: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    paddingTop: 24,
  },
  footerCopy: { fontSize: 13, color: '#334155', margin: 0 },
  footerBadges: { display: 'flex', gap: 10 },
  footerBadge: {
    fontSize: 12, fontWeight: 600, color: '#64748b',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20, padding: '4px 10px',
  },
}
