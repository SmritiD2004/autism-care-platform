import '../styles/design-system.css';

export default function Avatar({ size = 'md', children, style }) {
  const sizeMap = { sm: 'nt-avatar-sm', md: '', lg: 'nt-avatar-lg' };
  return (
    <div className={`nt-avatar ${sizeMap[size]}`.trim()} style={style}>
      {children}
    </div>
  );
}
