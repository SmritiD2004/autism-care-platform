import '../styles/design-system.css';

export default function Badge({ variant = 'ghost', dot = false, children }) {
  const map = {
    default:  'nt-badge nt-badge-ghost',
    danger:   'nt-badge nt-badge-danger',
    warn:     'nt-badge nt-badge-warn',
    success:  'nt-badge nt-badge-success',
    info:     'nt-badge nt-badge-info',
    ghost:    'nt-badge nt-badge-ghost',
    teal:     'nt-badge nt-badge-teal',
    critical: 'nt-badge nt-badge-danger',
    high:     'nt-badge nt-badge-warn',
    medium:   'nt-badge nt-badge-info',
    low:      'nt-badge nt-badge-success',
  };

  const dotColorMap = {
    danger: 'nt-dot-danger', warn: 'nt-dot-warn',
    success: 'nt-dot-success', teal: 'nt-dot-teal',
    critical: 'nt-dot-danger', high: 'nt-dot-warn',
  };

  return (
    <span className={map[variant] || map.ghost}>
      {dot && <span className={`nt-dot ${dotColorMap[variant] || ''} nt-dot-pulse`} />}
      {children}
    </span>
  );
}
