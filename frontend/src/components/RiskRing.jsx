// src/components/RiskRing.jsx
import '../styles/design-system.css';

export default function RiskRing({ value, color, label }) {
  const r = 44;
  const stroke = 7;
  const circ = 2 * Math.PI * r;
  
  // Handle both decimal (0-1) and percentage (0-100) values
  const normalizedValue = value > 1 ? value / 100 : value;
  const filled = circ * normalizedValue;
  const empty = circ - filled;
  const pct = Math.round(normalizedValue * 100);

  // Risk level label
  const riskLabel = pct > 70 ? 'High' : pct > 40 ? 'Mod.' : 'Low';

  return (
    <div className="pt-risk-ring" style={{ position: 'relative', width: 110, height: 110 }}>
      <svg width="110" height="110" viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx="55" cy="55" r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        {/* Glow layer (slightly wider, blurred via filter) */}
        <circle
          cx="55" cy="55" r={r}
          fill="none"
          stroke={color}
          strokeOpacity={0.18}
          strokeWidth={stroke + 4}
          strokeDasharray={`${filled} ${empty}`}
          strokeLinecap="round"
        />
        {/* Main fill */}
        <circle
          cx="55" cy="55" r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${filled} ${empty}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.9s var(--ease)' }}
        />
      </svg>

      {/* Center text */}
      <div className="pt-risk-center">
        <div style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 28,
          lineHeight: 1,
          fontWeight: 700,
          color,
          letterSpacing: '-0.5px',
        }}>
          {pct}
        </div>
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: color,
          marginTop: 4,
        }}>
          {riskLabel} Risk
        </div>
      </div>
    </div>
  );
}
