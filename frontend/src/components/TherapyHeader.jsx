// src/components/TherapyHeader.jsx
import Avatar from './Avatar';
import Badge from './Badge';
import Card from './Card';
import '../styles/design-system.css';
import { riskMeta } from '../utils/risk';

export default function TherapyHeader({ patient, plan }) {
  const rm = riskMeta(patient.risk);

  const accentColor = rm.badge === 'danger'
    ? 'var(--danger)'
    : rm.badge === 'warn'
    ? 'var(--warn)'
    : 'var(--success)';

  return (
    <Card style={{ borderLeft: `4px solid ${accentColor}` }}>
      <div className="row-sb">
        <div className="row gap-3">
          <Avatar size="lg">{patient.initials}</Avatar>
          <div>
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 18,
              color: 'var(--text-1)',
              letterSpacing: '-0.2px',
              marginBottom: 3,
            }}>
              {patient.name}
            </div>
            <div className="row gap-2">
              <span className="nt-text" style={{ fontSize: 12.5 }}>
                Age {patient.age}
              </span>
              <span style={{ color: 'var(--border-md)' }}>·</span>
              <span className="nt-badge nt-badge-ghost" style={{ fontSize: 11 }}>
                {patient.severity} ASD
              </span>
            </div>
          </div>
        </div>
        <div className="col gap-2" style={{ alignItems: 'flex-end' }}>
          <Badge variant={rm.badge}>
            Risk {patient.risk.toFixed(2)} · {rm.label}
          </Badge>
          <span style={{
            fontSize: 11,
            color: 'var(--text-3)',
            fontFamily: 'var(--font-mono)',
          }}>
            {rm.label === 'High' ? '⚠' : rm.label === 'Moderate' ? '◆' : '✓'} {rm.label} Priority
          </span>
        </div>
      </div>

      {plan?.reasoning && (
        <div className="nt-explainer mt-4">
          <span style={{ color: 'var(--teal-400)', fontWeight: 600, marginRight: 6 }}>
            AI Reasoning:
          </span>
          {plan.reasoning}
        </div>
      )}
    </Card>
  );
}
