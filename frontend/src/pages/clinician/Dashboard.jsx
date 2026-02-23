import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import '../../styles/design-system.css';
import '../../styles/clinician.css';

// ── Mock chart data ──
const chartData = [
  { month: 'Jan', screenings: 18, alerts: 9 },
  { month: 'Feb', screenings: 27, alerts: 12 },
  { month: 'Mar', screenings: 20, alerts: 18 },
  { month: 'Apr', screenings: 29, alerts: 13 },
  { month: 'May', screenings: 19, alerts: 9 },
  { month: 'Jun', screenings: 36, alerts: 24 },
];

// ── Stat card icons (SVG inline so no extra dep) ──
const IconPatients = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconVideo = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);
const IconAlert = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconActivity = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);

// ── Recent activity icons ──
const IconNewPatient = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
  </svg>
);
const IconScreening = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);
const IconCritical = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconTherapy = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);

const recentActivity = [
  {
    id: 1,
    icon: <IconNewPatient />,
    iconBg: 'rgba(100,116,139,0.3)',
    bold: 'New patient assigned: Manish L.',
    sub: 'Assigned by Dr. Smith for initial screening.',
  },
  {
    id: 2,
    icon: <IconScreening />,
    iconBg: 'rgba(100,116,139,0.3)',
    bold: 'Screening completed for Anya S.',
    sub: 'Risk score: 0.78. Ready for your review.',
  },
  {
    id: 3,
    icon: <IconCritical />,
    iconBg: 'rgba(239,68,68,0.18)',
    iconColor: '#ef4444',
    bold: 'Critical alert for patient Kiran S.',
    sub: 'Significant drop in communication attempts.',
    critical: true,
  },
  {
    id: 4,
    icon: <IconTherapy />,
    iconBg: 'rgba(100,116,139,0.3)',
    bold: 'Therapy plan approved for Priya T.',
    sub: 'Balanced plan finalized and sent to parent.',
  },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1e2a3a',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: 13,
      color: '#e2e8f0',
    }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

export default function ClinicianDashboard() {
  const navigate = useNavigate();

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data } = await api.get('/patients');
      return data;
    },
  });

  const activeCount = patients.length || 124;

  const stats = [
    {
      label: 'Active Patients',
      value: activeCount,
      sub: '+5 since last month',
      icon: <IconPatients />,
      iconBg: 'rgba(100,116,139,0.25)',
    },
    {
      label: 'Pending Screenings',
      value: 8,
      sub: '3 new since yesterday',
      icon: <IconVideo />,
      iconBg: 'rgba(100,116,139,0.25)',
    },
    {
      label: 'High-Risk Alerts',
      value: 3,
      sub: '1 critical alert needs review',
      icon: <IconAlert />,
      iconBg: 'rgba(100,116,139,0.25)',
    },
    {
      label: 'Overall Activity',
      value: '+12.5%',
      sub: 'Than last month',
      icon: <IconActivity />,
      iconBg: 'rgba(100,116,139,0.25)',
    },
  ];

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 0, minHeight: '100vh' }}>
      {/* ── Top search bar ── */}
      <div style={{
        background: '#0f1923',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '12px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
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

      {/* ── Page content ── */}
      <div style={{ padding: '28px 28px', flex: 1 }}>
        {/* Welcome heading */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Welcome back</h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>
            Here's a summary of your clinic's activity.
          </p>
        </div>

        {/* ── Stat cards ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24,
        }}>
          {stats.map((s) => (
            <div key={s.label} style={{
              background: '#132030',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 12,
              padding: '20px 22px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600, letterSpacing: '0.02em' }}>
                  {s.label}
                </span>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: s.iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#94a3b8',
                }}>
                  {s.icon}
                </div>
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#f1f5f9', lineHeight: 1, marginBottom: 8 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Chart + Recent Activity ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }}>
          {/* Chart */}
          <div style={{
            background: '#132030',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12,
            padding: '22px 24px',
          }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>
                Screenings vs. Alerts Overview
              </div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                A look at the number of screenings and high-risk alerts over the past 6 months.
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} barSize={14} barGap={4}>
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={false} tickLine={false}
                  ticks={[0, 9, 18, 27, 36]}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="screenings" name="Screenings" fill="#14b8a6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="alerts" name="Alerts" fill="#7f1d1d" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Activity */}
          <div style={{
            background: '#132030',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12,
            padding: '22px 24px',
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>
              Recent Activity
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {recentActivity.map((a) => (
                <div key={a.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                    background: a.iconBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: a.iconColor || '#94a3b8',
                  }}>
                    {a.icon}
                  </div>
                  <div>
                    <div style={{
                      fontSize: 13, fontWeight: 700,
                      color: a.critical ? '#fca5a5' : '#e2e8f0',
                      marginBottom: 2,
                    }}>
                      {a.bold}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{a.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
