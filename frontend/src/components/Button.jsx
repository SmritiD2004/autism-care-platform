import '../styles/design-system.css';

const variants = {
  primary: {
    background: 'linear-gradient(135deg,#14b8a6,#0d9488)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 4px 14px rgba(20,184,166,0.35)',
  },
  secondary: {
    background: 'rgba(255,255,255,0.06)',
    color: '#e2e8f0',
    border: '1px solid rgba(255,255,255,0.12)',
    boxShadow: 'none',
  },
  danger: {
    background: 'rgba(239,68,68,0.15)',
    color: '#fca5a5',
    border: '1px solid rgba(239,68,68,0.3)',
    boxShadow: 'none',
  },
  ghost: {
    background: 'transparent',
    color: '#94a3b8',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: 'none',
  },
};

const sizes = {
  sm: { padding: '7px 14px', fontSize: 13 },
  md: { padding: '10px 18px', fontSize: 14 },
  lg: { padding: '13px 24px', fontSize: 15 },
  full: { padding: '13px 24px', fontSize: 15, width: '100%' },
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  style: extraStyle = {},
  ...rest
}) {
  const v = variants[variant] || variants.primary;
  const sz = sizes[size] || sizes.md;

  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    fontWeight: 700,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    transition: 'opacity 0.15s, transform 0.1s, box-shadow 0.15s',
    letterSpacing: '0.01em',
    fontFamily: 'inherit',
    ...v,
    ...sz,
    ...extraStyle,
  };

  return (
    <button
      style={base}
      onClick={onClick}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <span style={{
          width: 14, height: 14,
          border: '2px solid rgba(255,255,255,0.3)',
          borderTopColor: '#fff',
          borderRadius: '50%',
          display: 'inline-block',
          animation: 'spin 0.7s linear infinite',
          flexShrink: 0,
        }} />
      )}
      {children}
    </button>
  );
}
