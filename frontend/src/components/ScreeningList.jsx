// src/components/ScreeningList.jsx
import Card from './Card';
import Avatar from './Avatar';
import Badge from './Badge';
import '../styles/design-system.css';
import { riskMeta } from '../utils/risk';

function ScreeningRow({ s, isSel, onSelect, muted = false }) {
  const rm = riskMeta(s.risk);

  const accentColor = rm.badge === 'danger'
    ? 'var(--danger)'
    : rm.badge === 'warn'
    ? 'var(--warn)'
    : 'var(--success)';

  return (
    <button
      onClick={() => onSelect(s)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '10px 12px',
        borderRadius: 'var(--r-md)',
        border: `1px solid ${isSel ? accentColor + '55' : 'transparent'}`,
        borderLeft: `3px solid ${isSel ? accentColor : 'transparent'}`,
        background: isSel
          ? `rgba(${rm.badge === 'danger' ? '239,68,68' : rm.badge === 'warn' ? '245,158,11' : '20,184,166'}, 0.06)`
          : 'transparent',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.15s var(--ease)',
        opacity: muted ? 0.72 : 1,
      }}
      onMouseEnter={e => {
        if (!isSel) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
      }}
      onMouseLeave={e => {
        if (!isSel) e.currentTarget.style.background = 'transparent';
      }}
    >
      <Avatar size="sm">{s.initials}</Avatar>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13.5,
          fontWeight: 600,
          color: 'var(--text-1)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {s.patient}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
          {muted ? '✓ Reviewed' : s.uploaded}
        </div>
      </div>
      <Badge variant={rm.badge}>{s.risk.toFixed(2)}</Badge>
    </button>
  );
}

export default function ScreeningList({ screenings, selectedId, onSelect }) {
  const pending  = screenings.filter(s => s.status === 'pending');
  const reviewed = screenings.filter(s => s.status !== 'pending');

  return (
    <Card style={{ overflow: 'auto', padding: '18px 12px' }}>
      {/* Header */}
      <div className="row-sb" style={{ padding: '0 8px', marginBottom: 14 }}>
        <div className="nt-sh-title">Screenings</div>
        {pending.length > 0 && (
          <span className="nt-badge nt-badge-danger" style={{ fontSize: 11 }}>
            {pending.length} pending
          </span>
        )}
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div className="col gap-1" style={{ marginBottom: 8 }}>
          <div className="nt-label" style={{ padding: '0 8px', marginBottom: 4 }}>
            Pending Review
          </div>
          {pending.map(s => (
            <ScreeningRow
              key={s.id}
              s={s}
              isSel={selectedId === s.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}

      {/* Divider */}
      {pending.length > 0 && reviewed.length > 0 && (
        <div className="nt-divider" style={{ margin: '10px 8px' }} />
      )}

      {/* Reviewed */}
      {reviewed.length > 0 && (
        <div className="col gap-1">
          <div className="nt-label" style={{ padding: '0 8px', marginBottom: 4 }}>
            Reviewed
          </div>
          {reviewed.map(s => (
            <ScreeningRow
              key={s.id}
              s={s}
              isSel={selectedId === s.id}
              onSelect={onSelect}
              muted
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {screenings.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 16px' }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>🔬</div>
          <div className="nt-text">No screenings yet</div>
        </div>
      )}
    </Card>
  );
}
