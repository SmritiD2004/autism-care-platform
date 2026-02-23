import { useState } from 'react';
import '../../styles/design-system.css';
import '../../styles/clinician.css';

// ── Mock patient list ──
const patients = [
  { id: 1, name: 'Manish Kumar', age: 4, severity: 'High', risk: 0.82, initials: 'MK' },
  { id: 2, name: 'Anya Sharma',  age: 3, severity: 'High', risk: 0.78, initials: 'AS' },
  { id: 3, name: 'Kiran Singh',  age: 5, severity: 'Mid',  risk: 0.65, initials: 'KS' },
  { id: 4, name: 'Priya Thakur', age: 4, severity: 'Low',  risk: 0.45, initials: 'PT' },
];

// ── Mock plans per patient ──
const plansData = {
  1: {
    A: {
      name: 'Intensive',
      tag: 'Recommended',
      tagColor: '#14b8a6',
      subtitle: 'Aggressive approach for rapid progress',
      frequency: '5x a week',
      milestone: '85%',
      timeEstimate: '6-9 months',
      costEstimate: '$15,000',
      desc: 'Combines ABA therapy with speech and occupational therapy daily to maximize early developmental gains. Ideal for patients with significant developmental gaps.',
    },
    B: {
      name: 'Balanced',
      tag: null,
      subtitle: 'Structured approach for steady improvement',
      frequency: '3x a week',
      milestone: '72%',
      timeEstimate: '9-12 months',
      costEstimate: '$9,500',
      desc: 'A structured combination of ABA and speech therapy three times per week, designed for consistent progress with manageable family commitment.',
    },
    C: {
      name: 'Social',
      tag: null,
      subtitle: 'Focus on social skills and peer interaction',
      frequency: '2x a week',
      milestone: '60%',
      timeEstimate: '12-18 months',
      costEstimate: '$6,000',
      desc: 'Emphasizes social skills training and group therapy sessions, perfect for patients with primary challenges in social communication.',
    },
  },
};
// Reuse plan A data for other patients with slight tweaks
for (const id of [2, 3, 4]) {
  plansData[id] = plansData[1];
}

const ChevronDown = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const RiskBadge = ({ risk }) => {
  const color = risk >= 0.7 ? '#ef4444' : risk >= 0.5 ? '#f59e0b' : '#14b8a6';
  const bg = risk >= 0.7 ? 'rgba(239,68,68,0.15)' : risk >= 0.5 ? 'rgba(245,158,11,0.15)' : 'rgba(20,184,166,0.15)';
  return (
    <span style={{
      background: bg, color, border: `1px solid ${color}40`,
      borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 700,
    }}>
      {risk.toFixed(2)}
    </span>
  );
};

const Avatar = ({ initials, size = 36 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    background: 'linear-gradient(135deg,#1e3a5f,#0d2a40)',
    border: '2px solid rgba(20,184,166,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: size > 30 ? 13 : 11, fontWeight: 700, color: '#7dd3fc', flexShrink: 0,
  }}>
    {initials}
  </div>
);

const PlanCard = ({ plan, planKey, selected, onSelect }) => {
  const isSelected = selected === planKey;
  return (
    <div style={{
      background: '#132030',
      border: `1.5px solid ${isSelected ? '#14b8a6' : 'rgba(255,255,255,0.07)'}`,
      borderRadius: 12,
      padding: '20px 22px',
      marginBottom: 16,
      transition: 'border-color 0.2s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <div>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>
            Plan {planKey}: {plan.name}
          </span>
        </div>
        {plan.tag && (
          <span style={{
            background: '#14b8a6', color: '#fff',
            borderRadius: 20, padding: '3px 12px',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
          }}>
            {plan.tag}
          </span>
        )}
      </div>
      <div style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>{plan.subtitle}</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginBottom: 14 }}>
        {[
          ['Frequency', plan.frequency],
          ['Expected Milestone Probability', plan.milestone],
          ['Time Estimate', plan.timeEstimate],
          ['Cost Estimate', plan.costEstimate],
        ].map(([label, val]) => (
          <div key={label}>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>
              <strong style={{ color: '#e2e8f0' }}>{label}:</strong> {val}
            </span>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, marginBottom: 16 }}>{plan.desc}</p>

      <button
        onClick={() => onSelect(planKey)}
        style={{
          background: isSelected ? '#14b8a6' : 'rgba(20,184,166,0.12)',
          color: isSelected ? '#fff' : '#14b8a6',
          border: `1px solid ${isSelected ? '#14b8a6' : 'rgba(20,184,166,0.3)'}`,
          borderRadius: 8, padding: '9px 20px',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
          transition: 'all 0.15s',
        }}
      >
        {isSelected && <CheckIcon />}
        {isSelected ? 'Selected' : 'Select Plan'}
      </button>
    </div>
  );
};

export default function ClinicianTherapy() {
  const [selId, setSelId] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState('A');
  const [age, setAge] = useState('4');
  const [severity, setSeverity] = useState('');
  const [commScore, setCommScore] = useState('5');
  const [motorScore, setMotorScore] = useState('7');
  const [notes, setNotes] = useState('');

  const patient = patients.find(p => p.id === selId);
  const plans = plansData[selId];

  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, padding: '10px 14px',
    fontSize: 14, color: '#e2e8f0', width: '100%',
    outline: 'none', boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block', fontSize: 13, fontWeight: 600,
    color: '#94a3b8', marginBottom: 6,
  };

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
        {/* Page heading */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
            Predictive Intervention Engine
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>
            Generate data-driven therapy plan suggestions based on patient profiles.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>
          {/* LEFT – Patient Profile form */}
          <div style={{
            background: '#132030',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12,
            padding: '22px 24px',
            height: 'fit-content',
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>
              Patient Profile
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
              Enter patient details to generate plans.
            </div>

            {/* Patient selector */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Select Patient</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {patients.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setSelId(p.id); setSelectedPlan('A'); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      background: selId === p.id ? 'rgba(20,184,166,0.1)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${selId === p.id ? 'rgba(20,184,166,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 8, padding: '8px 12px',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                    }}
                  >
                    <Avatar initials={p.initials} size={30} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Age {p.age} · {p.severity}</div>
                    </div>
                    <RiskBadge risk={p.risk} />
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '16px 0' }} />

            {/* Form fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Patient Age (years)</label>
                <input
                  type="number" value={age}
                  onChange={e => setAge(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Severity Level</label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={severity}
                    onChange={e => setSeverity(e.target.value)}
                    style={{ ...inputStyle, appearance: 'none', cursor: 'pointer', paddingRight: 36 }}
                  >
                    <option value="">Select level</option>
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                  <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }}>
                    <ChevronDown />
                  </div>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Communication Score (0-10)</label>
                <input
                  type="number" min="0" max="10" value={commScore}
                  onChange={e => setCommScore(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Motor Score (0-10)</label>
                <input
                  type="number" min="0" max="10" value={motorScore}
                  onChange={e => setMotorScore(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Additional Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Enter any relevant observations..."
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <button style={{
                width: '100%', padding: '11px',
                background: '#14b8a6', color: '#fff',
                border: 'none', borderRadius: 8,
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                marginTop: 4,
              }}>
                Generate Plans
              </button>
            </div>
          </div>

          {/* RIGHT – Plan cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {Object.entries(plans).map(([key, plan]) => (
              <PlanCard
                key={key}
                planKey={key}
                plan={plan}
                selected={selectedPlan}
                onSelect={setSelectedPlan}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
