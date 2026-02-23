// src/components/ProgressBar.jsx
import '../styles/design-system.css';

export default function ProgressBar({ percent = 0, variant = 'default', height, showLabel = false }) {
  const fillClass = {
    default: 'nt-progress-fill',
    danger:  'nt-progress-fill nt-progress-danger',
    warn:    'nt-progress-fill nt-progress-warn',
  }[variant] ?? 'nt-progress-fill';

  const clamped = Math.min(Math.max(percent, 0), 100);

  return (
    <div style={{ width: '100%' }}>
      <div
        className="nt-progress"
        style={height ? { height } : undefined}
      >
        <div
          className={fillClass}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <div style={{
          fontSize: 11,
          color: 'var(--text-3)',
          marginTop: 4,
          fontFamily: 'var(--font-mono)',
        }}>
          {clamped.toFixed(0)}%
        </div>
      )}
    </div>
  );
}
