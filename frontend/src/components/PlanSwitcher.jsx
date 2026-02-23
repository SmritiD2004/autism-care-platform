// src/components/PlanSwitcher.jsx
import '../styles/design-system.css';

export default function PlanSwitcher({ activePlan, onSwitch, plan }) {
  const options = [
    { key: 'recommended', emoji: '✨', label: 'Plan A', name: plan.recommended.name },
    { key: 'alternative',  emoji: '⭐', label: 'Plan B', name: plan.alternative.name },
  ];

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      {options.map(opt => {
        const isActive = activePlan === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => onSwitch(opt.key)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 16px',
              borderRadius: 'var(--r-md)',
              border: `1px solid ${isActive ? 'var(--border-teal)' : 'var(--border-xs)'}`,
              background: isActive
                ? 'rgba(20,184,166,0.10)'
                : 'rgba(255,255,255,0.03)',
              cursor: 'pointer',
              transition: 'all 0.15s var(--ease)',
              textAlign: 'left',
            }}
            onMouseEnter={e => {
              if (!isActive) e.currentTarget.style.borderColor = 'var(--border-sm)';
            }}
            onMouseLeave={e => {
              if (!isActive) e.currentTarget.style.borderColor = 'var(--border-xs)';
            }}
          >
            <span style={{ fontSize: 20 }}>{opt.emoji}</span>
            <div>
              <div style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                color: isActive ? 'var(--teal-400)' : 'var(--text-3)',
                marginBottom: 2,
              }}>
                {opt.label}
              </div>
              <div style={{
                fontSize: 13.5,
                fontWeight: 600,
                color: isActive ? 'var(--text-1)' : 'var(--text-2)',
              }}>
                {opt.name}
              </div>
            </div>
            {isActive && (
              <span style={{
                marginLeft: 'auto',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--teal-500)',
                boxShadow: '0 0 6px var(--teal-500)',
                flexShrink: 0,
              }} />
            )}
          </button>
        );
      })}
    </div>
  );
}
