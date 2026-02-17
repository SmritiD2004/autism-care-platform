import { useState } from 'react'

/**
 * Parental consent modal (HIPAA/ethics placeholder).
 * Hardcode HIPAA notes; encrypt uploads per ethics guidelines.
 */
export default function ConsentModal({ open, onAccept, onDecline }) {
  const [checked, setChecked] = useState(false)

  if (!open) return null

  return (
    <div className="consent-modal-overlay" role="dialog" aria-modal="true">
      <div className="consent-modal">
        <h2>Parental Consent & Data Privacy</h2>
        <p>
          <strong>HIPAA Note (prototype):</strong> This system processes health-related video data.
          In production, all uploads should be encrypted; child IDs are hashed for anonymization.
          Parental consent is required before screening.
        </p>
        <label>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          I consent to the use of this data for ASD screening purposes.
        </label>
        <div className="modal-actions">
          <button onClick={onAccept} disabled={!checked}>
            Accept
          </button>
          <button onClick={onDecline}>Decline</button>
        </div>
      </div>
    </div>
  )
}
