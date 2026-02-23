// src/pages/clinician/Settings.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ClinicianSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <section style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top bar */}
      <div style={{
        background: '#0f1923',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '12px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>Settings</div>
      </div>

      {/* Content */}
      <div style={{ padding: '28px 28px', flex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Settings</h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>
            Manage your account settings and preferences.
          </p>
        </div>

        {/* Settings card */}
        <div style={{
          background: '#132030',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 12,
          maxWidth: 600,
        }}>
          {/* Profile section */}
          <div style={{
            padding: '24px 26px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: '0 0 16px 0' }}>
              Profile
            </h2>

            {/* Profile info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'linear-gradient(135deg,#14b8a6,#0d9488)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#e2e8f0' }}>
                  {user?.name || 'Dr. Aanya Sharma'}
                </div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                  {user?.email || 'aanya.sharma@example.com'}
                </div>
              </div>
            </div>

            {/* Settings grid */}
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={user?.name || 'Dr. Aanya Sharma'}
                  readOnly
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    padding: '10px 12px',
                    color: '#e2e8f0',
                    fontSize: 14,
                    cursor: 'not-allowed',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || 'aanya.sharma@example.com'}
                  readOnly
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    padding: '10px 12px',
                    color: '#e2e8f0',
                    fontSize: 14,
                    cursor: 'not-allowed',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  Role
                </label>
                <input
                  type="text"
                  value={user?.role || 'Clinician'}
                  readOnly
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    padding: '10px 12px',
                    color: '#e2e8f0',
                    fontSize: 14,
                    cursor: 'not-allowed',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Security section */}
          <div style={{
            padding: '24px 26px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: '0 0 16px 0' }}>
              Security
            </h2>
            <button
              style={{
                width: '100%',
                padding: '10px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#94a3b8',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.target.style.background = 'rgba(255,255,255,0.08)';
              }}
              onMouseLeave={e => {
                e.target.style.background = 'rgba(255,255,255,0.05)';
              }}
            >
              Change Password
            </button>
          </div>

          {/* Logout section */}
          <div style={{
            padding: '24px 26px',
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: '0 0 16px 0' }}>
              Session
            </h2>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              style={{
                width: '100%',
                padding: '10px 16px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 8,
                color: '#fca5a5',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.target.style.background = 'rgba(239,68,68,0.15)';
              }}
              onMouseLeave={e => {
                e.target.style.background = 'rgba(239,68,68,0.1)';
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50,
        }}>
          <div style={{
            background: '#132030',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            padding: '24px',
            maxWidth: 400,
            width: '90%',
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', margin: '0 0 8px 0' }}>
              Sign Out?
            </h3>
            <p style={{ fontSize: 14, color: '#94a3b8', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              Are you sure you want to sign out? You'll need to log in again to access your account.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 8,
                  color: '#e2e8f0',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: 8,
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
