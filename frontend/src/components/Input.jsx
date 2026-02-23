// src/components/Input.jsx
// Drop-in replacement — dark background, light text, teal focus ring

export default function Input({
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  style: extraStyle = {},
  ...rest
}) {
  const base = {
    width: '100%',
    padding: '11px 14px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    fontSize: 14,
    color: '#e2e8f0',          /* ← always readable on dark bg */
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    caretColor: '#14b8a6',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      style={{ ...base, ...extraStyle }}
      onFocus={e => {
        e.target.style.borderColor = 'rgba(20,184,166,0.5)';
        e.target.style.boxShadow   = '0 0 0 3px rgba(20,184,166,0.1)';
        e.target.style.background  = 'rgba(255,255,255,0.07)';
      }}
      onBlur={e => {
        e.target.style.borderColor = 'rgba(255,255,255,0.1)';
        e.target.style.boxShadow   = 'none';
        e.target.style.background  = 'rgba(255,255,255,0.05)';
      }}
      {...rest}
    />
  );
}
