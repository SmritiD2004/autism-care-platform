// src/utils/risk.js
export function riskMeta(score) {
  if (score >= 0.7) return { label: 'High',    badge: 'danger',  color: 'var(--danger)' };
  if (score >= 0.4) return { label: 'Moderate', badge: 'warn',    color: 'var(--warn)' };
  return               { label: 'Low',     badge: 'success', color: 'var(--success)' };
}

/* Helper used only by the Alerts page (optional) */
export const riskColor = p => (p > 70 ? 'var(--danger)' : p > 40 ? 'var(--warn)' : 'var(--success)');
export const riskLabel = p => (p > 70 ? 'High' : p > 40 ? 'Moderate' : 'Low');
