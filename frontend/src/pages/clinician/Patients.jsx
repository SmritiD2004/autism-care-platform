import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import '../../styles/design-system.css';
import '../../styles/clinician.css';

// ── Mock patients matching the screenshot ──
const mockPatients = [
  { id: 1, name: 'Manish Kumar',  age: 4, riskScore: 0.82, status: 'Needs Review', initials: 'MK' },
  { id: 2, name: 'Anya Sharma',   age: 3, riskScore: 0.78, status: 'Needs Review', initials: 'AS' },
  { id: 3, name: 'Kiran Singh',   age: 5, riskScore: 0.65, status: 'Active',       initials: 'KS' },
  { id: 4, name: 'Priya Thakur',  age: 4, riskScore: 0.45, status: 'Active',       initials: 'PT' },
  { id: 5, name: 'Rohan Mehta',   age: 6, riskScore: 0.31, status: 'Active',       initials: 'RM' },
  { id: 6, name: 'Sneha Patel',   age: 3, riskScore: 0.58, status: 'Active',       initials: 'SP' },
  { id: 7, name: 'Arjun Verma',   age: 5, riskScore: 0.74, status: 'Needs Review', initials: 'AV' },
  { id: 8, name: 'Diya Joshi',    age: 4, riskScore: 0.22, status: 'Archived',     initials: 'DJ' },
];

const TABS = ['All', 'Active', 'Needs Review', 'Archived'];

const PlusIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const DotsIcon = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
    <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
  </svg>
);

const StatusBadge = ({ status }) => {
  const cfg = {
    'Needs Review': { bg: 'rgba(185,28,28,0.85)', color: '#fecaca', border: 'rgba(239,68,68,0.4)' },
    'Active':       { bg: 'rgba(13,148,136,0.25)', color: '#2dd4bf', border: 'rgba(20,184,166,0.4)' },
    'Archived':     { bg: 'rgba(100,116,139,0.2)', color: '#94a3b8', border: 'rgba(100,116,139,0.3)' },
  }[status] || {};
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`,
      borderRadius: 6, padding: '3px 10px',
      fontSize: 12, fontWeight: 600, letterSpacing: '0.02em',
    }}>
      {status}
    </span>
  );
};

const Avatar = ({ initials }) => (
  <div style={{
    width: 36, height: 36, borderRadius: '50%',
    background: 'linear-gradient(135deg,#1e3a5f,#0d2a40)',
    border: '2px solid rgba(20,184,166,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 700, color: '#7dd3fc', flexShrink: 0,
  }}>
    {initials}
  </div>
);

export default function ClinicianPatients() {
  const [activeTab, setActiveTab] = useState('All');

  const { data: patientsData } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/patients');
        return Array.isArray(data) ? data : mockPatients;
      } catch { return mockPatients; }
    },
  });

  const patients = Array.isArray(patientsData) ? patientsData : mockPatients;

  const filtered = activeTab === 'All'
    ? patients
    : patients.filter(p => p.status === activeTab);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* ── Top search bar ── */}
      <div style={{
        background: '#0f1923',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '12px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8, padding: '8px 14px', width: 280,
        }}>
          <svg width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span style={{ color: '#64748b', fontSize: 13 }}>Search patients, screenings...</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <svg width="20" height="20" fill="none" stroke="#94a3b8" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span style={{
              position: 'absolute', top: -4, right: -4,
              width: 8, height: 8, borderRadius: '50%',
              background: '#ef4444', border: '1.5px solid #0f1923',
            }} />
          </div>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg,#14b8a6,#0d9488)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 14, color: '#fff',
          }}>A</div>
        </div>
      </div>

      {/* ── Page body ── */}
      <div style={{ padding: '28px 28px', flex: 1 }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Patients</h1>
            <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>
              Manage your patient roster and view screening statuses.
            </p>
          </div>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#14b8a6', color: '#fff',
            border: 'none', borderRadius: 8,
            padding: '10px 18px', fontSize: 14, fontWeight: 600,
            cursor: 'pointer',
          }}>
            <PlusIcon /> Add Patient
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 4, marginBottom: 20,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 8, padding: 4, width: 'fit-content',
        }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '6px 16px', borderRadius: 6, border: 'none',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s',
                background: activeTab === tab ? '#14b8a6' : 'transparent',
                color: activeTab === tab ? '#fff' : '#64748b',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table card */}
        <div style={{
          background: '#132030',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 12,
          overflow: 'hidden',
        }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>
              {activeTab === 'All' ? 'All Patients' : `${activeTab} Patients`}
            </div>
          </div>

          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 40px',
            padding: '10px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            color: '#64748b', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em',
          }}>
            <span>Name</span>
            <span>Age</span>
            <span>Risk Score</span>
            <span>Status</span>
            <span />
          </div>

          {/* Rows */}
          {filtered.map((p, i) => (
            <div
              key={p.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 40px',
                padding: '14px 24px',
                alignItems: 'center',
                borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                transition: 'background 0.12s',
                cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar initials={p.initials} />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{p.name}</span>
              </div>
              <span style={{ fontSize: 14, color: '#94a3b8' }}>{p.age} years</span>
              <span style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 600 }}>
                {p.riskScore.toFixed(2)}
              </span>
              <StatusBadge status={p.status} />
              <button style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#64748b', display: 'flex', alignItems: 'center',
              }}>
                <DotsIcon />
              </button>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: '#64748b', fontSize: 14 }}>
              No patients in this category.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
