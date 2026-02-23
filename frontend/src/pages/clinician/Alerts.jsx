import Badge from '../../components/Badge';
import CrisisRiskCard from '../../components/CrisisRiskCard';
import TrendChart from '../../components/TrendChart';
import AlertSection from '../../components/AlertSection';
import '../../styles/design-system.css';
import '../../styles/clinician.css';

const dailyLogs = [
  { date: '2026-02-15', crisisRisk: 35, sleepHours: 8.2, meltdowns: 1 },
  { date: '2026-02-16', crisisRisk: 42, sleepHours: 7.5, meltdowns: 2 },
  { date: '2026-02-17', crisisRisk: 55, sleepHours: 6.8, meltdowns: 3 },
  { date: '2026-02-18', crisisRisk: 48, sleepHours: 7.2, meltdowns: 2 },
  { date: '2026-02-19', crisisRisk: 65, sleepHours: 5.5, meltdowns: 4 },
  { date: '2026-02-20', crisisRisk: 72, sleepHours: 4.8, meltdowns: 5 },
  { date: '2026-02-22', crisisRisk: 78, sleepHours: 3.5, meltdowns: 6 },
];
const today = dailyLogs[dailyLogs.length - 1] || { crisisRisk: 0 };

const allAlerts = [
  {
    id: 1, type: 'critical',
    title: 'Crisis Threshold Exceeded',
    patient: 'Aarav K.', initials: 'AK',
    desc: 'Risk score above 70%',
    message: 'Pattern recognition detected 6 warning signals that historically precede behavioral crises. Immediate intervention recommended.',
    time: '12 mins ago',
    bg: 'rgba(239,68,68,0.1)', icon: '🚨',
    actions: ['View Protocol', 'Mark Handled'],
  },
  {
    id: 2, type: 'warning',
    title: 'Sleep Disruption Detected',
    patient: 'Aarav K.', initials: 'AK',
    desc: 'Only 3.5 hours last night',
    message: 'Sleep deprivation significantly increases crisis risk. Ensure adequate rest and consider sensory breaks.',
    time: '2 hours ago',
    bg: 'rgba(245,158,11,0.1)', icon: '😴',
    actions: ['View Sleep Log', 'Mark Handled'],
  },
];

export default function ClinicianAlerts() {
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
          {allAlerts.some(a => a.type === 'critical') && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 20, padding: '4px 12px',
              fontSize: 12, fontWeight: 600, color: '#fca5a5',
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#ef4444',
                boxShadow: '0 0 0 3px rgba(239,68,68,0.25)',
                animation: 'pulse 1.5s infinite',
                display: 'inline-block',
              }} />
              Critical alert active
            </div>
          )}
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
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
            Crisis Monitoring &amp; Alerts
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>
            AI early‑warning system · real‑time analysis
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <CrisisRiskCard today={today} patientName="Aarav K." />

          <AlertSection alerts={allAlerts} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <TrendChart
              title="Sleep Pattern"
              sub="30 Days"
              data={dailyLogs}
              type="area"
              gradientId="sleepGrad"
            />
            <TrendChart
              title="Meltdown Frequency"
              sub="Last 14 Days"
              data={dailyLogs}
              type="bar"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
