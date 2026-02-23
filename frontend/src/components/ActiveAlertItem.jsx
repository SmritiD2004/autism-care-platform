import Card from './Card';
import Badge from './Badge';
import Button from './Button';
import '../styles/design-system.css';

export default function ActiveAlertItem({ alert, isExpanded, onToggle, onMarkHandled }) {
  const borderColor = {
    critical: 'var(--danger)',
    high:     'var(--warn)',
    medium:   'var(--info)',
  }[alert.type] || 'var(--border-xs)';

  return (
    <Card
      style={{
        borderLeft: `3px solid ${borderColor}`,
        cursor: 'pointer',
        transition: 'box-shadow 0.2s, border-color 0.2s',
      }}
      onClick={() => onToggle(alert.id)}
    >
      <div className="row-sb">
        <div className="row gap-3">
          <div className="nt-avatar nt-avatar-sm" style={{ flexShrink: 0 }}>
            {alert.initials}
          </div>
          <div>
            <div className="nt-text" style={{ fontWeight: 600, color: 'var(--text-1)' }}>
              {alert.title}
            </div>
            <div className="nt-text" style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
              {alert.patient} · {alert.time}
            </div>
          </div>
        </div>
        <div className="row gap-2">
          <Badge variant={alert.type} dot>{alert.type}</Badge>
          <span style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 4 }}>
            {isExpanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-xs)' }}>
          <div className="nt-text mb-4">{alert.message}</div>
          {(alert.actions?.length ?? 0) > 0 && (
          <div className="row gap-2 flex-wrap">
            {alert.actions?.map((a, i) => (
              <Button
                key={i}
                variant={i === 0 ? 'primary' : 'secondary'}
                size="sm"
                onClick={e => {
                  e.stopPropagation();
                  if (a === 'Mark Handled') onMarkHandled(alert.id);
                }}
              >
                {a}
              </Button>
            ))}
          </div>
          )}
        </div>
      )}
    </Card>
  );
}
