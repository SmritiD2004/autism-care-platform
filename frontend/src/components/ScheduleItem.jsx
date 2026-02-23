// src/components/ScheduleItem.jsx
import Card from './Card';
import Badge from './Badge';
import '../styles/design-system.css';

const typeIcons = {
  'ABA Therapy':         '🧩',
  'Speech Therapy':      '🗣️',
  'Occupational':        '✋',
  'Parent Training':     '👪',
  'Social Skills Group': '👥',
};

const statusConfig = {
  active:    { badge: 'success', dot: 'nt-dot-success' },
  pending:   { badge: 'warn',    dot: 'nt-dot-warn' },
  completed: { badge: 'ghost',   dot: '' },
};

export default function ScheduleItem({ item }) {
  const { badge } = statusConfig[item.status] || statusConfig.pending;
  const icon = typeIcons[item.type] || '🎯';

  return (
    <Card
      padding="sm"
      style={{ display: 'flex', gap: 14, alignItems: 'flex-start', transition: 'border-color 0.15s' }}
    >
      {/* Icon bubble */}
      <div style={{
        width: 38,
        height: 38,
        borderRadius: 'var(--r-md)',
        background: 'rgba(20,184,166,0.10)',
        border: '1px solid var(--border-teal)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        flexShrink: 0,
      }}>
        {icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text-1)', marginBottom: 3 }}>
          {item.type}
        </div>
        <div className="nt-text" style={{ fontSize: 12.5 }}>
          {item.freq} &nbsp;·&nbsp; {item.dur}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2, fontStyle: 'italic' }}>
          {item.provider}
        </div>
      </div>

      <Badge variant={badge}>{item.status}</Badge>
    </Card>
  );
}
