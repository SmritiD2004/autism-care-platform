import Card from './Card';
import '../styles/design-system.css';

export default function CostSummary({ cost }) {
  return (
    <div
      style={{
        background: 'rgba(20,184,166,0.07)',
        border: '1px solid var(--border-teal)',
        borderRadius: 'var(--r-md)',
        padding: '16px 18px',
      }}
    >
      <div className="row-sb mb-2">
        <span className="nt-label">Total investment ({cost.duration})</span>
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 22,
            color: 'var(--teal-400)',
            letterSpacing: '-0.3px',
          }}
        >
          {cost.total}
        </span>
      </div>
      <div className="nt-text" style={{ fontSize: 12 }}>
        ≈ <strong style={{ color: 'var(--text-1)' }}>{cost.monthly}</strong> / month
      </div>
    </div>
  );
}
