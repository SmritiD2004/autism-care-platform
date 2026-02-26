// src/pages/clinician/ClinicianLayout.jsx
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import '../../styles/design-system.css';
import '../../styles/clinician.css';

const NavIcon = ({ type }) => {
  if (type === 'dashboard') return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  );
  if (type === 'patients') return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
  if (type === 'therapy') return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  );
  if (type === 'settings') return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
  if (type === 'ml') return (
    <span style={{ fontSize: 16 }}>🧠</span>
  );
  return null;
};

const navLinks = [
  { to: '/clinician/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/clinician/patients',  label: 'Patients',  icon: 'patients'  },
  { to: '/clinician/therapy',   label: 'Therapy Plans', icon: 'therapy' },
  { to: '/clinician/ml-analysis', label: 'ML Analysis', icon: 'ml' },
];

const activeLinkStyle = {
  background: 'rgba(20,184,166,0.12)',
  color: '#14b8a6',
  borderLeft: '3px solid #14b8a6',
};

const inactiveLinkStyle = {
  background: 'transparent',
  color: '#64748b',
  borderLeft: '3px solid transparent',
};

export default function ClinicianLayout() {
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f1923', overflow: 'hidden' }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: 220,
        background: '#0d1b2a',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg,#14b8a6,#0d9488)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-5 0v-15A2.5 2.5 0 0 1 9.5 2z"/>
                <path d="M14.5 8A2.5 2.5 0 0 1 17 10.5v9a2.5 2.5 0 0 1-5 0v-9A2.5 2.5 0 0 1 14.5 8z"/>
              </svg>
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
              NeuroThrive
            </span>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 8,
                marginBottom: 4,
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.15s',
                ...(isActive ? activeLinkStyle : inactiveLinkStyle),
              })}
            >
              <NavIcon type={link.icon} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom – Settings + user */}
        <div style={{
          padding: '12px 12px 16px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <NavLink
            to="/clinician/settings"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 12px',
              borderRadius: 8,
              marginBottom: 12,
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.15s',
              ...(isActive ? activeLinkStyle : inactiveLinkStyle),
            })}
          >
            <NavIcon type="settings" />
            Settings
          </NavLink>

          {/* User card */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 8,
            cursor: 'pointer',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg,#14b8a6,#0d9488)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              A
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Dr. Aanya Sharma
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>Clinician</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content area ── */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        background: '#0f1923',
        color: '#e2e8f0',
      }}>
        <Outlet />
      </main>
    </div>
  );
}

