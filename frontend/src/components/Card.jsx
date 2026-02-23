import '../styles/design-system.css';

export default function Card({ className = '', children, padding, ...rest }) {
  const paddingClass = padding === 'sm' ? 'nt-card-p-sm' : padding === 'lg' ? 'nt-card-p-lg' : '';
  return (
    <div className={`nt-card ${paddingClass} ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
