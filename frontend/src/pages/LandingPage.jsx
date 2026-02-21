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
            <span style={{ ...s.logoIcon, filter: 'hue-rotate(280deg) saturate(1.2)' }}>🧠</span>
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

      {/* Hero Section */}
      <section style={s.hero}>
        <div style={s.heroOverlay} />
        <div style={s.heroContent}>
          <div style={s.badge}>
            <span style={s.badgeIcon}>🔒</span> HIPAA Compliant · AI-Powered
          </div>
          <h1 style={s.heroTitle}>
            From Early Detection to<br />
            <span style={s.heroTitleAccent}>Lifelong Thriving</span>
          </h1>
          <p style={s.heroSubtitle}>
            AI-powered autism care that unifies screening, therapy prediction, real-time<br />
            monitoring, and family support — replacing fragmented traditional care with<br />
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
          <div style={s.statCard}>
            <div style={s.statNumber}>78%</div>
            <div style={s.statLabel}>Detection Accuracy</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statNumber}>82%</div>
            <div style={s.statLabel}>Verbal Improvement</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statNumber}>2-5 min</div>
            <div style={s.statLabel}>Screening Time</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statNumber}>35%</div>
            <div style={s.statLabel}>Better Adherence</div>
          </div>
        </div>
      </section>

      {/* Platform Components */}
      <section style={s.components}>
        <div style={s.componentsContent}>
          <p style={s.sectionLabel}>PLATFORM COMPONENTS</p>
          <h2 style={s.sectionTitle}>Six Engines. One Unified Platform.</h2>
          <p style={s.sectionSubtitle}>
            Each component works independently and together — creating a comprehensive care<br />
            ecosystem that adapts to every child's unique journey.
          </p>
        </div>
      </section>

      {/* Stakeholders */}
      <section style={s.stakeholders}>
        <div style={s.stakeholdersContent}>
          <p style={s.sectionLabel}>DESIGNED FOR</p>
          <h2 style={s.sectionTitle}>Every Stakeholder in the Care Journey</h2>
          
          <div style={s.stakeholderGrid}>
            <div style={s.stakeholderCard}>
              <div style={s.stakeholderIcon}>🩺</div>
              <h3 style={s.stakeholderTitle}>Pediatricians</h3>
              <p style={s.stakeholderDesc}>
                Evidence-based screening with explainable AI risk scores for confident<br />
                early referrals.
              </p>
            </div>
            <div style={s.stakeholderCard}>
              <div style={{ ...s.stakeholderIcon, filter: 'hue-rotate(280deg) saturate(1.2)' }}>🧠</div>
              <h3 style={s.stakeholderTitle}>Therapists</h3>
              <p style={s.stakeholderDesc}>
                Unified progress tracking, outcome predictions, and auto-generated<br />
                session reports.
              </p>
            </div>
            <div style={s.stakeholderCard}>
              <div style={s.stakeholderIcon}>💛</div>
              <h3 style={s.stakeholderTitle}>Parents</h3>
              <p style={s.stakeholderDesc}>
                Daily co-pilot for journaling, burnout detection, and actionable support<br />
                resources.
              </p>
            </div>
            <div style={s.stakeholderCard}>
              <div style={s.stakeholderIcon}>📚</div>
              <h3 style={s.stakeholderTitle}>Educators</h3>
              <p style={s.stakeholderDesc}>
                Classroom behavior insights and coordination with the child's therapy<br />
                team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={s.ctaSection}>
        <div style={s.ctaContent}>
          <h2 style={s.ctaTitle}>Ready to Transform Autism Care?</h2>
          <p style={s.ctaSubtitle}>
            Join pediatricians, therapists, and families already using NeuroThrive<br />
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
          <div style={s.footerLogo}>
            <span style={{ ...s.logoIcon, filter: 'hue-rotate(280deg) saturate(1.2)' }}>🧠</span>
            <span style={s.logoText}>Neuro<span style={s.logoAccent}>Thrive</span> AI</span>
          </div>
          <p style={s.footerText}>
            © 2026 NeuroThrive AI. HIPAA Compliant. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    background: 'white',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    paddingTop: '0',
  },
  
  // Header
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    background: 'rgba(240, 253, 250, 0.8)',
    backdropFilter: 'blur(8px)',
    borderBottom: '1px solid rgba(229, 231, 235, 0.2)',
    padding: '0',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 40px',
    height: '64px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '20px',
    fontWeight: '700',
  },
  logoIcon: { fontSize: '28px' },
  logoText: { color: '#1a1a1a' },
  logoAccent: { color: '#14b8a6' },
  nav: {
    display: 'flex',
    gap: '32px',
  },
  navLink: {
    color: '#6b7280',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'color 0.2s ease',
    cursor: 'pointer',
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
  },
  signInBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    background: 'white',
    color: '#1a1a1a',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  getStartedBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: '#14b8a6',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  
  // Hero
  hero: {
    backgroundImage: `url(${heroBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    padding: '120px 40px',
    marginTop: '64px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(19, 78, 74, 0.7) 100%)',
    zIndex: 0,
  },
  heroContent: {
    maxWidth: '900px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
  },
  badge: {
    display: 'inline-block',
    padding: '8px 16px',
    borderRadius: '20px',
    background: 'rgba(255,255,255,0.15)',
    color: 'white',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '32px',
  },
  badgeIcon: { marginRight: '6px' },
  heroTitle: {
    fontSize: '56px',
    fontWeight: '800',
    color: 'white',
    margin: '0 0 24px 0',
    lineHeight: 1.2,
  },
  heroTitleAccent: { color: '#14b8a6' },
  heroSubtitle: {
    fontSize: '18px',
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 1.7,
    margin: '0 0 40px 0',
  },
  heroCTA: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
  },
  primaryCTA: {
    padding: '16px 32px',
    borderRadius: '10px',
    border: 'none',
    background: '#14b8a6',
    color: 'white',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(20,184,166,0.4)',
  },
  secondaryCTA: {
    padding: '16px 32px',
    borderRadius: '10px',
    border: '2px solid white',
    background: 'transparent',
    color: 'white',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  
  // Stats
  stats: {
    padding: '60px 40px',
    background: 'linear-gradient(135deg, #0f172a 0%, #134e4a 100%)',
  },
  statsContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '32px',
  },
  statCard: {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    padding: '32px',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  statNumber: {
    fontSize: '40px',
    fontWeight: '800',
    color: '#14b8a6',
    marginBottom: '8px',
  },
  statLabel: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  
  // Components
  components: {
    padding: '80px 40px',
    background: 'white',
    textAlign: 'center',
  },
  componentsContent: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  sectionLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#14b8a6',
    letterSpacing: '1px',
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '40px',
    fontWeight: '800',
    color: '#1a1a1a',
    margin: '0 0 16px 0',
  },
  sectionSubtitle: {
    fontSize: '17px',
    color: '#6b7280',
    lineHeight: 1.7,
    margin: 0,
  },
  
  // Stakeholders
  stakeholders: {
    padding: '80px 40px',
    background: '#f9fafb',
  },
  stakeholdersContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'center',
  },
  stakeholderGrid: {
    marginTop: '48px',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '24px',
  },
  stakeholderCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '32px 24px',
    border: '1px solid #e5e7eb',
    textAlign: 'center',
  },
  stakeholderIcon: {
    fontSize: '40px',
    marginBottom: '16px',
  },
  stakeholderTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 12px 0',
  },
  stakeholderDesc: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: 1.6,
    margin: 0,
  },
  
  // CTA
  ctaSection: {
    padding: '80px 40px',
    background: 'linear-gradient(135deg, #0f172a 0%, #134e4a 100%)',
    textAlign: 'center',
  },
  ctaContent: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  ctaTitle: {
    fontSize: '40px',
    fontWeight: '800',
    color: 'white',
    margin: '0 0 16px 0',
  },
  ctaSubtitle: {
    fontSize: '18px',
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 1.7,
    margin: '0 0 40px 0',
  },
  ctaButtons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
  },
  ctaPrimary: {
    padding: '16px 32px',
    borderRadius: '10px',
    border: 'none',
    background: '#14b8a6',
    color: 'white',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  ctaSecondary: {
    padding: '16px 32px',
    borderRadius: '10px',
    border: '2px solid white',
    background: 'transparent',
    color: 'white',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  
  // Footer
  footer: {
    padding: '40px',
    background: '#f9fafb',
    borderTop: '1px solid #e5e7eb',
  },
  footerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'center',
  },
  footerLogo: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '16px',
  },
  footerText: {
    color: '#6b7280',
    fontSize: '14px',
    margin: 0,
  },
}
