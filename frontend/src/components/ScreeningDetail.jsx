// src/components/ScreeningDetail.jsx
import Card from './Card.jsx';
import Avatar from './Avatar.jsx';
import Badge from './Badge.jsx';
import RiskRing from './RiskRing.jsx';
import ShapBar from './ShapBar.jsx';
import MarkerItem from './MarkerItem.jsx';
import DecisionForm from './DecisionForm.jsx';
import ProgressBar from './ProgressBar.jsx';
import { riskMeta } from '../utils/risk.js';
import '../styles/design-system.css';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import ChartTooltip from './ToolTip.jsx';

export default function ScreeningDetail({
  screening,
  tab,
  setTab,
  decision,
  setDecision,
  note,
  setNote,
  onSaveDecision,
}) {
  const rm = riskMeta(screening.risk);

  const radarKeys = [
    'eyeContact', 'jointAttention', 'socialSmiling',
    'gestureRecognition', 'motorPatterns', 'verbalResponse',
  ];
  const radarLabels = {
    eyeContact: 'Eye Contact', jointAttention: 'Joint Att.',
    socialSmiling: 'Social Smile', gestureRecognition: 'Gestures',
    motorPatterns: 'Motor', verbalResponse: 'Verbal',
  };
  const typicalValues = {
    eyeContact: 0.7, jointAttention: 0.75, socialSmiling: 0.72,
    gestureRecognition: 0.68, motorPatterns: 0.25, verbalResponse: 0.8,
  };
  const radarData = radarKeys.map(k => ({
    feature: radarLabels[k],
    child: Math.round((screening.indicators[k] ?? 0) * 100),
    typical: Math.round(typicalValues[k] * 100),
  }));

  const tabDefs = [
    { id: 'analysis',     icon: '📊', label: 'Analysis' },
    { id: 'markers',      icon: '🎬', label: 'Evidence Clips' },
    { id: 'differential', icon: '⚕️', label: 'Differential Dx' },
    { id: 'decide',       icon: '✅', label: 'Clinical Decision' },
  ];

  return (
    <div className="col gap-4" style={{ overflow: 'auto' }}>

      {/* ── Header card ── */}
      <Card style={{ borderLeft: `4px solid ${rm.color}` }}>
        <div className="row-sb">
          <div className="row gap-3">
            <Avatar size="lg">{screening.initials}</Avatar>
            <div>
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 18,
                color: 'var(--text-1)',
                letterSpacing: '-0.2px',
                marginBottom: 4,
              }}>
                {screening.patient}
              </div>
              <div className="row gap-2">
                <span className="nt-text" style={{ fontSize: 12.5 }}>
                  Age {screening.age}
                </span>
                <span style={{ color: 'var(--border-md)' }}>·</span>
                <span className="nt-text" style={{ fontSize: 12.5 }}>
                  Uploaded {screening.uploaded}
                </span>
              </div>
            </div>
          </div>
          <div className="col gap-2" style={{ alignItems: 'flex-end' }}>
            <Badge variant={rm.badge}>
              Risk {screening.risk.toFixed(2)} · {rm.label}
            </Badge>
            <Badge variant="ghost">
              AI Confidence: {(screening.confidence * 100).toFixed(0)}%
            </Badge>
          </div>
        </div>

        {screening.parentNote && (
          <div className="nt-explainer mt-4">
            <span style={{ color: 'var(--teal-400)', fontWeight: 600 }}>Parent note: </span>
            "{screening.parentNote}"
          </div>
        )}
      </Card>

      {/* ── Tabs ── */}
      <div className="nt-tabs">
        {tabDefs.map(t => (
          <button
            key={t.id}
            className={`nt-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span style={{ fontSize: 13 }}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── Tab: Analysis ── */}
      {tab === 'analysis' && (
        <div className="grid-2 gap-4">
          {/* Radar chart */}
          <Card>
            <div className="nt-sh-title mb-4">Behavioral Profile</div>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border-xs)" />
                <PolarAngleAxis
                  dataKey="feature"
                  tick={{ fontSize: 10.5, fill: 'var(--text-3)' }}
                />
                <Radar
                  name="Typical"
                  dataKey="typical"
                  stroke="rgba(20,184,166,0.4)"
                  fill="rgba(20,184,166,0.07)"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                />
                <Radar
                  name="Child"
                  dataKey="child"
                  stroke={rm.color}
                  fill={`${rm.color}20`}
                  strokeWidth={2}
                />
                <Tooltip content={<ChartTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
            {/* Mini legend */}
            <div className="row gap-4 mt-2" style={{ justifyContent: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-3)' }}>
                <span style={{ width: 18, height: 1.5, background: 'rgba(20,184,166,0.6)', display: 'inline-block', borderRadius: 1 }} />
                Typical
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-3)' }}>
                <span style={{ width: 18, height: 1.5, background: rm.color, display: 'inline-block', borderRadius: 1 }} />
                Child
              </span>
            </div>
          </Card>

          {/* SHAP */}
          <Card>
            <div className="nt-sh-title mb-4">Why this risk score?</div>
            <ShapBar data={screening.shap} />
          </Card>

          {/* Indicator breakdown */}
          <Card style={{ gridColumn: '1 / -1' }}>
            <div className="nt-sh-title mb-4">Indicator Breakdown</div>
            <div className="grid-3" style={{ gap: 12 }}>
              {radarKeys.map(k => {
                const val = screening.indicators[k];
                const typ = typicalValues[k];
                const isMotor = k === 'motorPatterns';
                const isLow = isMotor ? val > typ : val < typ;
                const pct = Math.round(val * 100);
                return (
                  <Card key={k} padding="sm">
                    <div className="row-sb mb-2">
                      <div className="nt-label">{radarLabels[k]}</div>
                      <Badge variant={isLow ? 'danger' : 'success'}>
                        {isLow ? '↓ Low' : '✓ OK'}
                      </Badge>
                    </div>
                    <ProgressBar percent={pct} variant={isLow ? 'danger' : 'default'} />
                    <div className="nt-text" style={{ fontSize: 11, marginTop: 5 }}>
                      {pct}%{' '}
                      <span style={{ color: 'var(--text-3)' }}>
                        (typical {Math.round(typ * 100)}%)
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ── Tab: Markers ── */}
      {tab === 'markers' && (
        <Card>
          <div className="nt-sh-title mb-4">Flagged Video Moments</div>
          <div className="col gap-3">
            {screening.clips.map((c, i) => (
              <MarkerItem key={i} clip={c} />
            ))}
          </div>
        </Card>
      )}

      {/* ── Tab: Differential ── */}
      {tab === 'differential' && (
        <Card>
          <div className="nt-sh-title mb-4">AI Differential Diagnosis</div>
          <div className="col gap-5">
            {screening.differential.map((d, i) => {
              const pct = Math.round(d.probability * 100);
              return (
                <div key={i}>
                  <div className="row-sb mb-2">
                    <div style={{ fontWeight: 500, color: 'var(--text-1)', fontSize: 13.5 }}>
                      {d.condition}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
                      fontWeight: 600,
                      color: d.probability >= 0.6 ? rm.color : 'var(--text-2)',
                    }}>
                      {pct}%
                    </div>
                  </div>
                  <ProgressBar
                    percent={pct}
                    variant={d.probability >= 0.6 ? 'danger' : 'default'}
                  />
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ── Tab: Decide ── */}
      {tab === 'decide' && (
        <DecisionForm
          screening={screening}
          decision={decision}
          setDecision={setDecision}
          note={note}
          setNote={setNote}
          onSave={onSaveDecision}
        />
      )}
    </div>
  );
}
