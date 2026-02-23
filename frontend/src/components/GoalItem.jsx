import Card from './Card';
import Badge from './Badge';
import '../styles/design-system.css';

const statusMap = {
  'on-track':        { badge: 'success', label: 'On Track' },
  'needs-attention': { badge: 'warn',    label: 'Needs Attention' },
  'achieved':        { badge: 'teal',    label: 'Achieved ✓' },
  'not-started':     { badge: 'ghost',   label: 'Not Started' },
};

function ProgressBar({ percent, variant }) {
  const fillClass = variant === 'warn' ? 'nt-progress-warn' : '';
  return (
    <div className="nt-progress">
      <div
        className={`nt-progress-fill ${fillClass}`}
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
    </div>
  );
}

export default function GoalItem({ goal }) {
  const { area, goal: txt, progress, status } = goal;
  const { badge, label } = statusMap[status] || statusMap['not-started'];

  return (
    <Card padding="sm">
      <div className="nt-label mb-2">{area}</div>
      <div className="row-sb mb-3">
        <div className="nt-text" style={{ color: 'var(--text-1)', fontWeight: 500 }}>{txt}</div>
        <Badge variant={badge}>{label}</Badge>
      </div>
      <ProgressBar percent={progress} variant={status === 'needs-attention' ? 'warn' : undefined} />
      <div className="nt-text" style={{ marginTop: 6, fontSize: 11 }}>
        {progress}% complete
      </div>
    </Card>
  );
}
