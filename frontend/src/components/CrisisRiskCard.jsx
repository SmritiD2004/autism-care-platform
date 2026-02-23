import Card from './Card';
import Badge from './Badge';
import '../styles/design-system.css';
import { riskColor } from '../utils/risk';

export default function CrisisRiskCard({ today = { crisisRisk: 0 }, patientName }) {
  const riskValue = today?.crisisRisk ?? 0;
  const color = riskColor(riskValue);
  const label = riskValue > 70 ? 'HIGH' : riskValue > 40 ? 'MODERATE' : 'LOW';

  return (
    <Card className="anim-1" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="row-sb mb-4">
        <div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--text-1)' }}>
            Current Crisis Risk — {patientName}
          </div>
          <div className="nt-text" style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
            Analysis updated 5 minutes ago
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 36, lineHeight: 1, color }}>
            {riskValue}%
          </div>
          <div className="nt-label" style={{ color: 'var(--text-3)', marginTop: 4 }}>
            {label} RISK
          </div>
        </div>
      </div>

      <div className="nt-explainer mb-4">
        Pattern recognition across the last 72 hours identified{' '}
        <strong style={{ color: 'var(--text-1)' }}>{(today?.factors?.length ?? 0)} warning signals</strong>{' '}
        that historically precede behavioural crises in similar cases.
      </div>

      {(today?.factors?.length ?? 0) > 0 && (
      <div className="col gap-2 mb-4">
        {today?.factors?.map((f, i) => (
          <div key={i} className="row gap-3" style={{ alignItems: 'center' }}>
            <div style={{ width: 130, flexShrink: 0 }}>
              <div className="nt-progress">
                <div
                  className="nt-progress-fill"
                  style={{
                    width: `${f.impact * 2}%`,
                    background: `linear-gradient(90deg, ${color}88, ${color})`,
                  }}
                />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{f.name}</span>
              <span style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 8 }}>{f.desc}</span>
            </div>
            <Badge variant="danger">{f.impact}% impact</Badge>
          </div>
        ))}
      </div>
      )}

      <div
        style={{
          background: 'var(--danger-bg)',
          border: '1px solid var(--danger-border)',
          borderRadius: 'var(--r-md)',
          padding: '16px 18px',
        }}
      >
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-danger)', marginBottom: 12 }}>
          🛡 Recommended Prevention Actions
        </div>
        <div className="grid-2" style={{ gap: 10 }}>
          {[
            'Reduce demands today — skip non-essential activities',
            'Pack noise-cancelling headphones for school assembly',
            'Communicate in simple 2–3 word sentences',
            'Offer calming activity before transitions (weighted blanket)',
            'Alert teacher to provide quiet space if needed',
            'Have de-escalation protocol ready',
          ].map((a, i) => (
            <div key={i} className="row gap-2" style={{ fontSize: 12.5, color: '#fca5a5', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--success)', flexShrink: 0 }}>✓</span> {a}
            </div>
          ))}
        </div>
        <button className="nt-btn nt-btn-danger mt-4">
          View Full De-escalation Protocol →
        </button>
      </div>
    </Card>
  );
}
