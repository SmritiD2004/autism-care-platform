import Badge from './Badge';
import '../styles/design-system.css';

const severityColors = {
  high:     'var(--danger)',
  moderate: 'var(--warn)',
  low:      'var(--success)',
};
const badgeVariantMap = { high: 'danger', moderate: 'warn', low: 'success' };

export default function MarkerItem({ clip }) {
  const { time, marker, severity } = clip;
  const color = severityColors[severity] || 'var(--text-2)';

  return (
    <div
      style={{
        display: 'flex',
        gap: 14,
        padding: '14px 16px',
        borderRadius: 'var(--r-md)',
        background: 'rgba(255,255,255,0.025)',
        border: `1px solid ${color}33`,
        borderLeft: `3px solid ${color}`,
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          fontWeight: 500,
          color,
          minWidth: 52,
          paddingTop: 2,
        }}
      >
        {time}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-1)', marginBottom: 6 }}>
          {marker}
        </div>
        <Badge variant={badgeVariantMap[severity] || 'ghost'}>{severity} severity</Badge>
      </div>
      <button className="nt-btn nt-btn-secondary nt-btn-sm" style={{ flexShrink: 0 }}>
        ▶ Jump
      </button>
    </div>
  );
}
