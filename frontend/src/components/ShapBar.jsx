// src/components/ShapBar.jsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import ChartTooltip from './ToolTip';
import '../styles/design-system.css';

export default function ShapBar({ data }) {
  return (
    <div>
      {/* Legend */}
      <div className="row gap-4 mb-3" style={{ justifyContent: 'flex-end' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-3)' }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--danger)', display: 'inline-block' }} />
          Increases risk
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-3)' }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--success)', display: 'inline-block' }} />
          Reduces risk
        </span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 24, top: 0, bottom: 0 }}>
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: 'var(--text-3)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            dataKey="feature"
            type="category"
            width={145}
            tick={{ fontSize: 11, fill: 'var(--text-2)' }}
            axisLine={false}
            tickLine={false}
          />
          <ReferenceLine x={0} stroke="var(--border-md)" strokeDasharray="3 3" />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="value" name="Impact" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.direction === 'high' ? 'var(--danger)' : 'var(--success)'}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
