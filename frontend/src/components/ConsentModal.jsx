import { useState } from 'react';
import '../styles/design-system.css';

export default function ConsentModal({ open, onAccept, onDecline }) {
  const [checked, setChecked] = useState(false);

  if (!open) return null;

  return (
    <div className="consent-modal-overlay" role="dialog" aria-modal="true">
      <div className="consent-modal">
        <div style={{ marginBottom: 20 }}>
          <div className="nt-modal-title">Parental Consent &amp; Data Privacy</div>
          <p className="nt-text" style={{ marginTop: 6 }}>
            Review and accept before proceeding with any screening.
          </p>
        </div>

        <div className="nt-explainer mb-5">
          <strong style={{ color: 'var(--text-warn)', display: 'block', marginBottom: 6 }}>
            ⚠️ HIPAA Notice (prototype)
          </strong>
          This system processes health-related video data. In production, every upload
          must be encrypted and child IDs must be hashed for anonymisation. Parental
          consent is required before any screening is accepted.
        </div>

        <label
          className="row gap-3 mb-5"
          style={{
            cursor: 'pointer',
            padding: '14px 16px',
            borderRadius: 'var(--r-md)',
            border: `1px solid ${checked ? 'var(--border-teal)' : 'var(--border-sm)'}`,
            background: checked ? 'rgba(20,184,166,0.07)' : 'rgba(255,255,255,0.02)',
            transition: 'all 0.15s',
          }}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: 'var(--teal-500)', cursor: 'pointer' }}
          />
          <span className="nt-text">
            I consent to the use of this data for ASD screening purposes.
          </span>
        </label>

        <div className="row gap-3">
          <button
            type="button"
            className="nt-btn nt-btn-primary flex-1"
            onClick={onAccept}
            disabled={!checked}
            style={{ opacity: checked ? 1 : 0.4, pointerEvents: checked ? 'auto' : 'none' }}
          >
            Accept &amp; Continue
          </button>
          <button
            type="button"
            className="nt-btn nt-btn-ghost"
            onClick={onDecline}
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
