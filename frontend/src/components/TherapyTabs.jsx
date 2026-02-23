// src/components/TherapyTabs.jsx
import '../styles/design-system.css';

const tabs = [
  { id: 'overview', icon: '📋', label: 'Plan Overview' },
  { id: 'goals',    icon: '🎯', label: 'Current Goals' },
  { id: 'decide',   icon: '✅', label: 'Approve Plan' },
];

export default function TherapyTabs({ active, onChange }) {
  return (
    <div className="nt-tabs">
      {tabs.map(t => (
        <button
          key={t.id}
          className={`nt-tab${active === t.id ? ' active' : ''}`}
          onClick={() => onChange(t.id)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <span style={{ fontSize: 14 }}>{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}
