import { useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function Alerts() {
  const [selectedView, setSelectedView] = useState('dashboard') // dashboard | logs

  // Mock 30-day parent log data
  const dailyLogs = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1
    // Simulate increasing stress pattern leading to crisis
    const baseStress = 40 + (day > 22 ? (day - 22) * 8 : 0)
    const baseSleep = 8 - (day > 22 ? (day - 22) * 0.3 : 0)
    const baseMeltdowns = day > 25 ? 2 + Math.random() : Math.random() * 1.2

    return {
      date: `Feb ${day}`,
      sleepHours: parseFloat((baseSleep + Math.random() * 0.5).toFixed(1)),
      meltdowns: parseFloat(baseMeltdowns.toFixed(1)),
      communication: Math.floor(5 + Math.random() * 8),
      stressLevel: Math.min(100, Math.floor(baseStress + Math.random() * 15)),
      crisisRisk: day > 26 ? Math.min(95, 30 + (day - 26) * 20) : Math.floor(Math.random() * 35),
    }
  })

  const today = dailyLogs[dailyLogs.length - 1]
  const yesterday = dailyLogs[dailyLogs.length - 2]

  // Active alerts
  const alerts = [
    {
      id: 1,
      type: 'critical',
      title: '🚨 Critical Meltdown Risk Detected',
      patient: 'Aarav K.',
      message: 'AI predicts 92% probability of behavioral crisis in next 4-6 hours based on sleep disruption pattern.',
      timestamp: '2 hours ago',
      actions: ['View prevention protocol', 'Alert therapist', 'Mark as handled'],
    },
    {
      id: 2,
      type: 'high',
      title: '⚠️ Parent Burnout Warning',
      patient: 'Priya S.',
      message: 'Caregiver stress at 78/100 for 5 consecutive days. Intervention recommended.',
      timestamp: '5 hours ago',
      actions: ['Schedule respite care', 'Connect to support group'],
    },
    {
      id: 3,
      type: 'medium',
      title: '📊 Therapy Adherence Declining',
      patient: 'Rohan M.',
      message: 'Missed 3 out of last 5 speech therapy sessions. Progress may be impacted.',
      timestamp: '1 day ago',
      actions: ['Contact family', 'Review barriers'],
    },
  ]

  // Crisis prediction factors
  const riskFactors = [
    { factor: 'Sleep disruption', impact: 35, desc: '2 consecutive nights <6 hours' },
    { factor: 'Morning irritability', impact: 22, desc: 'Rated "very irritable" for 3 days' },
    { factor: 'Schedule change', impact: 18, desc: 'School assembly today (loud environment)' },
    { factor: 'Reduced communication', impact: 15, desc: '40% drop in verbal attempts' },
    { factor: 'Sensory overload', impact: 10, desc: 'Covered ears 6x yesterday' },
  ]

  return (
    <div>
      {/* Page Header */}
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>Crisis Monitoring & Alerts</h1>
          <p style={s.pageSubtitle}>AI-powered early warning system for behavioral crises</p>
        </div>
        <div style={s.viewToggle}>
          <button
            onClick={() => setSelectedView('dashboard')}
            style={{ ...s.toggleBtn, ...(selectedView === 'dashboard' ? s.toggleBtnActive : {}) }}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setSelectedView('logs')}
            style={{ ...s.toggleBtn, ...(selectedView === 'logs' ? s.toggleBtnActive : {}) }}
          >
            📝 Daily Logs
          </button>
        </div>
      </div>

      {selectedView === 'dashboard' ? (
        <>
          {/* Crisis Risk Card */}
          <div style={{ ...s.card, borderLeft: `6px solid ${today.crisisRisk > 70 ? '#e53e3e' : today.crisisRisk > 40 ? '#d69e2e' : '#38a169'}` }}>
            <div style={s.riskHeader}>
              <div>
                <h2 style={s.cardTitle}>Current Crisis Risk: Aarav K.</h2>
                <p style={s.cardSubtitle}>Real-time analysis updated 5 minutes ago</p>
              </div>
              <div style={{
                ...s.riskBadge,
                background: today.crisisRisk > 70 ? '#e53e3e' : today.crisisRisk > 40 ? '#d69e2e' : '#38a169',
              }}>
                {today.crisisRisk}% Risk
              </div>
            </div>

            <div style={s.riskExplainer}>
              <strong>Why this risk level?</strong>
              <p style={{ margin: '8px 0 0 0', color: '#555' }}>
                Pattern recognition from last 72 hours shows {riskFactors.length} warning signals that historically precede behavioral crises.
                Similar patterns led to dysregulation in 87% of past cases.
              </p>
            </div>

            <h3 style={s.sectionTitle}>Contributing Risk Factors</h3>
            <div style={s.factorList}>
              {riskFactors.map((f, i) => (
                <div key={i} style={s.factorItem}>
                  <div style={s.factorBar}>
                    <div style={{ ...s.factorFill, width: `${f.impact * 2}%` }} />
                  </div>
                  <div style={s.factorText}>
                    <div style={s.factorName}>{f.factor} ({f.impact}% impact)</div>
                    <div style={s.factorDesc}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={s.preventionBox}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '600' }}>🛡️ Recommended Prevention Actions</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: 1.8 }}>
                <li>Reduce demands today (skip non-essential activities)</li>
                <li>Prepare noise-canceling headphones for school assembly</li>
                <li>Communicate in simple, clear 2-3 word sentences</li>
                <li>Offer calming activity before stressful transition (weighted blanket, favorite toy)</li>
                <li>Alert teacher to provide quiet space if needed</li>
              </ul>
              <button style={s.protocolButton}>View Full De-escalation Protocol</button>
            </div>
          </div>

          {/* Active Alerts */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>Active Alerts ({alerts.length})</h2>
            <div style={s.alertList}>
              {alerts.map(alert => (
                <div key={alert.id} style={{
                  ...s.alertCard,
                  borderLeft: `4px solid ${alert.type === 'critical' ? '#e53e3e' : alert.type === 'high' ? '#ed8936' : '#d69e2e'}`,
                }}>
                  <div style={s.alertHeader}>
                    <div>
                      <div style={s.alertTitle}>{alert.title}</div>
                      <div style={s.alertPatient}>{alert.patient}</div>
                    </div>
                    <span style={s.alertTime}>{alert.timestamp}</span>
                  </div>
                  <p style={s.alertMessage}>{alert.message}</p>
                  <div style={s.alertActions}>
                    {alert.actions.map((action, i) => (
                      <button key={i} style={s.actionButton}>{action}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trend Charts */}
          <div style={s.chartsGrid}>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Sleep Pattern (Last 30 Days)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={dailyLogs}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="sleepHours" stroke="#667eea" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <p style={s.chartNote}>
                ⚠️ Declining trend detected — sleep deprivation is primary crisis predictor
              </p>
            </div>

            <div style={s.card}>
              <h3 style={s.cardTitle}>Meltdown Frequency</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dailyLogs.slice(-14)}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="meltdowns" radius={[4, 4, 0, 0]}>
                    {dailyLogs.slice(-14).map((entry, i) => (
                      <Cell key={i} fill={entry.meltdowns > 1.5 ? '#e53e3e' : '#38a169'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p style={s.chartNote}>📈 Spike in last 4 days — correlates with sleep disruption</p>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Daily Logs View */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>Parent Daily Check-Ins</h2>
            <p style={s.cardSubtitle}>Last 7 days of logged observations</p>
            
            <div style={s.logsList}>
              {dailyLogs.slice(-7).reverse().map((log, i) => (
                <div key={i} style={s.logCard}>
                  <div style={s.logHeader}>
                    <strong style={{ fontSize: '15px' }}>{log.date}, 2026</strong>
                    <span style={{
                      ...s.riskBadgeSmall,
                      background: log.crisisRisk > 60 ? '#fed7d7' : '#c6f6d5',
                      color: log.crisisRisk > 60 ? '#c53030' : '#276749',
                    }}>
                      {log.crisisRisk}% risk
                    </span>
                  </div>
                  <div style={s.logMetrics}>
                    <div style={s.logMetric}>
                      <span style={s.logLabel}>Sleep</span>
                      <span style={s.logValue}>{log.sleepHours}h</span>
                    </div>
                    <div style={s.logMetric}>
                      <span style={s.logLabel}>Meltdowns</span>
                      <span style={s.logValue}>{log.meltdowns}</span>
                    </div>
                    <div style={s.logMetric}>
                      <span style={s.logLabel}>Communication</span>
                      <span style={s.logValue}>{log.communication} attempts</span>
                    </div>
                    <div style={s.logMetric}>
                      <span style={s.logLabel}>Parent Stress</span>
                      <span style={s.logValue}>{log.stressLevel}/100</span>
                    </div>
                  </div>
                  {i === 0 && log.crisisRisk > 70 && (
                    <div style={s.logAlert}>
                      🚨 High risk day — prevention protocol recommended
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const s = {
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  pageTitle: { fontSize: '26px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 4px 0' },
  pageSubtitle: { color: '#666', margin: 0, fontSize: '14px' },
  viewToggle: { display: 'flex', gap: '8px' },
  toggleBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '2px solid #e0e0e0',
    background: 'white',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  toggleBtnActive: { borderColor: '#667eea', background: '#f0f3ff', color: '#667eea' },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '28px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  cardTitle: { fontSize: '18px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 4px 0' },
  cardSubtitle: { fontSize: '13px', color: '#888', margin: '0 0 16px 0' },
  riskHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
  riskBadge: {
    padding: '10px 20px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '18px',
    fontWeight: '700',
  },
  riskExplainer: {
    background: '#f8f9fb',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  sectionTitle: { fontSize: '16px', fontWeight: '700', margin: '20px 0 12px 0' },
  factorList: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' },
  factorItem: { display: 'flex', gap: '12px', alignItems: 'center' },
  factorBar: { width: '100px', height: '8px', background: '#e0e0e0', borderRadius: '4px', position: 'relative' },
  factorFill: { position: 'absolute', height: '100%', background: '#e53e3e', borderRadius: '4px' },
  factorText: { flex: 1 },
  factorName: { fontSize: '14px', fontWeight: '600', color: '#333' },
  factorDesc: { fontSize: '12px', color: '#888' },
  preventionBox: {
    background: '#fff5f5',
    border: '1px solid #feb2b2',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '20px',
  },
  protocolButton: {
    marginTop: '12px',
    padding: '10px 16px',
    borderRadius: '6px',
    border: 'none',
    background: '#e53e3e',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  alertList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  alertCard: {
    padding: '16px',
    background: '#f8f9fb',
    borderRadius: '8px',
  },
  alertHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
  alertTitle: { fontSize: '15px', fontWeight: '600', color: '#333' },
  alertPatient: { fontSize: '13px', color: '#888', marginTop: '2px' },
  alertTime: { fontSize: '12px', color: '#aaa' },
  alertMessage: { fontSize: '14px', color: '#555', margin: '0 0 12px 0' },
  alertActions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  actionButton: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #d0d0d0',
    background: 'white',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  chartsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' },
  chartNote: { fontSize: '13px', color: '#888', margin: '8px 0 0 0', fontStyle: 'italic' },
  logsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  logCard: {
    padding: '16px',
    background: '#f8f9fb',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
  },
  logHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' },
  riskBadgeSmall: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  logMetrics: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' },
  logMetric: { display: 'flex', flexDirection: 'column', gap: '4px' },
  logLabel: { fontSize: '11px', color: '#888', fontWeight: '600', textTransform: 'uppercase' },
  logValue: { fontSize: '16px', color: '#333', fontWeight: '600' },
  logAlert: {
    marginTop: '12px',
    padding: '10px',
    background: '#fed7d7',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#c53030',
    fontWeight: '600',
  },
}
