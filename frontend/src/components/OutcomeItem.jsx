import Card from './Card';
import Badge from './Badge';
import '../styles/design-system.css';

function ProgressBar({ percent }) {
  return (
    <div className="nt-progress">
      <div className="nt-progress-fill" style={{ width: `${Math.min(percent, 100)}%` }} />
    </div>
  );
}

export default function OutcomeItem({ outcome }) {
  const { milestone, prob, timeframe, current, target } = outcome;
  const pct = Math.round(prob * 100);

  return (
    <Card padding="sm">
      <div className="row-sb mb-3">
        <div className="nt-label">{milestone}</div>
        <Badge variant="teal">{pct}%</Badge>
      </div>
      <ProgressBar percent={pct} />
      <div className="nt-text" style={{ marginTop: 6, fontSize: 11 }}>
        Expected in {timeframe}
        {current !== undefined && (
          <span style={{ color: 'var(--text-3)' }}>
            {' '}· Current: <strong style={{ color: 'var(--teal-400)' }}>{current}/{target}</strong>
          </span>
        )}
      </div>
    </Card>
  );
}
