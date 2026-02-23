// src/components/TrendChart.jsx
import {
  ResponsiveContainer,
  AreaChart,
  BarChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import ChartTooltip from './ToolTip';
import '../styles/design-system.css';

export default function TrendChart({
  title,
  sub,
  data,
  type = 'area',
  gradientId = 'grad',
}) {
  return (
    <div className="nt-card">
      {/* Header */}
      <div className="nt-sh" style={{ marginBottom: 0 }}>
        <div>
          <div className="nt-sh-title">{title}</div>
          {sub && <div className="nt-sh-sub" style={{ marginTop: 2 }}>{sub}</div>}
        </div>
        <div className="row gap-2">
          {type === 'area' && (
            <>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 11,
                color: 'var(--text-3)',
              }}>
                <span style={{ width: 20, height: 2, background: 'var(--info)', display: 'inline-block', borderRadius: 2 }} />
                Sleep hrs
              </span>
              <span className="nt-badge nt-badge-ghost">7 days</span>
            </>
          )}
          {type === 'bar' && (
            <>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-3)' }}>
                <span style={{ width: 10, height: 10, background: 'var(--danger)', display: 'inline-block', borderRadius: 2 }} />
                High
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-3)' }}>
                <span style={{ width: 10, height: 10, background: 'rgba(20,184,166,0.45)', display: 'inline-block', borderRadius: 2 }} />
                Normal
              </span>
            </>
          )}
        </div>
      </div>

      <div className="nt-chart" style={{ marginTop: 14 }}>
        <ResponsiveContainer width="100%" height={170}>
          {type === 'area' ? (
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="var(--info)" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="var(--info)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: 'var(--text-3)' }}
                axisLine={false}
                tickLine={false}
                interval={6}
              />
              <YAxis
                domain={[4, 10]}
                tick={{ fontSize: 10, fill: 'var(--text-3)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="sleep"
                name="Sleep (hrs)"
                stroke="var(--info)"
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{ r: 4, fill: 'var(--info)', strokeWidth: 0 }}
              />
            </AreaChart>
          ) : (
            <BarChart data={data.slice(-14)} barGap={4} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: 'var(--text-3)' }}
                axisLine={false}
                tickLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'var(--text-3)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="meltdowns" name="Meltdowns" radius={[4, 4, 0, 0]}>
                {data.slice(-14).map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.meltdowns > 1.5 ? 'var(--danger)' : 'rgba(20,184,166,0.45)'}
                  />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
