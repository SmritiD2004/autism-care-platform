import '../styles/design-system.css';

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div
      className="nt-overlay"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="nt-modal">
        <div className="row-sb mb-5">
          <div className="nt-modal-title">{title}</div>
          <button
            type="button"
            className="nt-btn nt-btn-ghost nt-btn-sm"
            onClick={onClose}
            aria-label="Close"
            style={{ color: 'var(--text-3)', fontSize: 18, padding: '4px 8px' }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
