import Card from './Card';
import Badge from './Badge';
import Button from './Button';
import '../styles/design-system.css';
import { riskMeta } from '../utils/risk';

const opts = [
  { value: 'approve_urgent',  label: 'Approve — Urgent referral',            badge: 'danger' },
  { value: 'approve_routine', label: 'Approve — Routine review',             badge: 'warn' },
  { value: 'approve_monitor', label: 'Approve — Monitoring only',            badge: 'info' },
  { value: 'reject',          label: 'Reject — Video quality insufficient',  badge: 'ghost' },
];

const recommendationMap = {
  clinical_evaluation_advised: '🔬 Clinical evaluation strongly advised.',
  monitoring_advised:          '👁 Monitoring advised – schedule a follow-up in 3 months.',
  urgent_evaluation:           '🚨 Urgent evaluation recommended – immediate specialist referral.',
};

export default function DecisionForm({ screening, decision, setDecision, note, setNote, onSave }) {
  return (
    <Card>
      <div className="nt-sh-title mb-5">Your Clinical Decision</div>

      {screening.clinicianDecision && (
        <div className="nt-alert nt-alert-success mb-5">
          <span>✅</span>
          <div>
            <strong>Decision already recorded:</strong> {screening.clinicianDecision}
            <br />
            <span style={{ fontSize: 12, color: 'var(--text-success)', opacity: 0.8 }}>
              {screening.clinicianNote}
            </span>
          </div>
        </div>
      )}

      <div className="nt-label mb-2">AI Recommendation</div>
      <div className="nt-explainer mb-5">
        {recommendationMap[screening.recommendation] || '—'}
      </div>

      <div className="nt-label mb-3">Your decision</div>
      <div className="col gap-2 mb-5">
        {opts.map(opt => {
          const isSelected = decision === opt.value;
          return (
            <label
              key={opt.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '13px 16px',
                borderRadius: 'var(--r-md)',
                border: `1px solid ${isSelected ? 'var(--border-teal)' : 'var(--border-xs)'}`,
                background: isSelected ? 'rgba(20,184,166,0.07)' : 'rgba(255,255,255,0.02)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-sm)'; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-xs)'; }}
            >
              <input
                type="radio"
                name="decision"
                value={opt.value}
                checked={isSelected}
                onChange={e => setDecision(e.target.value)}
                style={{ accentColor: 'var(--teal-500)', width: 16, height: 16 }}
              />
              <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-1)', flex: 1 }}>
                {opt.label}
              </span>
              <Badge variant={opt.badge}>{opt.value.split('_')[0]}</Badge>
            </label>
          );
        })}
      </div>

      <div className="nt-label mb-2">Clinical notes</div>
      <textarea
        className="nt-input"
        rows={4}
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Add notes for the patient file…"
        style={{ resize: 'vertical', marginBottom: 18 }}
      />

      <div className="row gap-3">
        <Button variant="primary" size="lg" className="flex-1" disabled={!decision} onClick={onSave}>
          ✓ Save Decision
        </Button>
        <Button variant="secondary">Export PDF</Button>
      </div>
    </Card>
  );
}
