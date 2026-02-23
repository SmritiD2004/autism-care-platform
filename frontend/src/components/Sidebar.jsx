// src/components/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/design-system.css';

const NAV_GROUPS = {
  clinician: [
    {
      label: 'Overview',
      items: [{ path: '/clinician', icon: '🏠', label: 'Dashboard' }],
    },
    {
      label: 'Clinical Work',
      items: [
        { path: '/clinician/screenings', icon: '🔬', label: 'Screening Reviews', badge: 2 },
        { path: '/clinician/therapy',    icon: '📋', label: 'Therapy Plans' },
        { path: '/clinician/alerts',     icon: '🔔', label: 'Alerts', badge: 3 },
      ],
    },
  ],
  parent: [
    {
      label: 'Child Care',
      items: [
        { path: '/parent', icon: '🏠', label: 'Dashboard' },
        { path: '/parent/progress', icon: '📈', label: 'Progress Tracking' },
        { path: '/parent/screening', icon: '🎬', label: 'Video Screening' },
      ],
    },
    {
      label: 'Parent Wellness',
      items: [
        { path: '/parent/journal', icon: '📔', label: 'Stress Journal' },
        { path: '/parent/mental-health', icon: '💙', label: 'Mental Health' },
        { path: '/parent/correlation', icon: '🔗', label: 'Insights' },
        { path: '/parent/resources', icon: '🤝', label: 'Resources' },
      ],
    },
  ],
  therapist: [
    {
      label: 'Overview',
      items: [
        { path: '/clinician',            icon: '🏠', label: 'Dashboard' },
        { path: '/clinician/therapy',    icon: '📋', label: 'Therapy Plans' },
        { path: '/clinician/screenings', icon: '🔬', label: 'View Reports' },
      ],
    },
  ],
  admin: [
    {
      label: 'System',
      items: [
        { path: '/clinician',            icon: '🏠', label: 'Overview' },
        { path: '/clinician/screenings', icon: '🔬', label: 'All Screenings' },
        { path: '/clinician/therapy',    icon: '📋', label: 'Therapy Plans' },
        { path: '/clinician/alerts',     icon: '🔔', label: 'Alerts', badge: 3 },
      ],
    },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const role = user?.role ?? 'clinician';
  const initials = (user?.fullName ?? 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const groups = NAV_GROUPS[role] ?? NAV_GROUPS.clinician;

  return (
    <aside className="nt-sidebar">
      {/* ── Logo ── */}
      <div className="nt-sidebar-logo">
        <div className="nt-sidebar-logo-icon">🧠</div>
        <span className="nt-wordmark">Neuro<em>Thrive</em></span>
      </div>

      {/* ── User chip ── */}
      <div className="nt-sidebar-user">
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div className="nt-avatar">{initials}</div>
          {/* Online dot */}
          <span style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 9,
            height: 9,
            borderRadius: '50%',
            background: 'var(--success)',
            border: '2px solid var(--bg-surface)',
            boxShadow: '0 0 5px var(--success)',
          }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="nt-user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.fullName ?? 'Demo User'}
          </div>
          <div className="nt-user-role">{role}</div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="nt-nav">
        {groups.map(group => (
          <div key={group.label}>
            <div className="nt-nav-label">{group.label}</div>
            {group.items.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nt-nav-item${isActive ? ' active' : ''}`}
                >
                  <span className="nt-nav-icon">{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge != null && (
                    <span className="nt-nav-badge">{item.badge}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Sign out ── */}
      <div className="nt-sidebar-footer">
        <button className="nt-signout-btn" onClick={logout}>
          <span style={{ fontSize: 14 }}>↪</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}
