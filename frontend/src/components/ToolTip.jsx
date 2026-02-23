// src/components/ToolTip.jsx
import '../styles/design-system.css';

export default function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-md)',
      borderRadius: 'var(--r-md)',
      padding: '10px 14px',
      fontSize: 12,
      boxShadow: 'var(--shadow-lg)',
      minWidth: 120,
    }}>
      {label && (
        <div style={{
          color: 'var(--text-3)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.4px',
          textTransform: 'uppercase',
          marginBottom: 8,
          paddingBottom: 6,
          borderBottom: '1px solid var(--border-xs)',
        }}>
          {label}
        </div>
      )}
      {payload.map((p, i) => (
        <div key={i} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          marginTop: i > 0 ? 5 : 0,
        }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: p.color || p.fill,
            flexShrink: 0,
          }} />
          <span style={{ color: 'var(--text-2)' }}>{p.name}</span>
          <strong style={{ marginLeft: 'auto', color: 'var(--text-1)', fontFamily: 'var(--font-mono)' }}>
            {p.value}
          </strong>
        </div>
      ))}
    </div>
  );
}
