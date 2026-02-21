import { useState } from 'react'

export default function TherapyLog() {
  const [selectedPatient, setSelectedPatient] = useState('patient_001')
  const [showRecommendations, setShowRecommendations] = useState(false)

  // Mock patient data
  const patients = [
    { id: 'patient_001', name: 'Aarav K.', age: 4, severity: 'Moderate', riskScore: 0.68 },
    { id: 'patient_002', name: 'Priya S.', age: 3, severity: 'Mild', riskScore: 0.42 },
    { id: 'patient_003', name: 'Rohan M.', age: 5, severity: 'Severe', riskScore: 0.85 },
  ]

  const patient = patients.find(p => p.id === selectedPatient)

  // AI-generated therapy recommendations (mock but realistic)
  const therapyPlans = {
    patient_001: {
      recommended: {
        name: "Plan A: Intensive Communication Focus",
        confidence: 0.78,
        reasoning: "Based on 87 similar cases with moderate ASD + delayed speech, this plan showed 40% faster milestone achievement in the first 6 months.",
        therapies: [
          { type: "Speech Therapy", frequency: "4x/week", duration: "45 min", provider: "Dr. Sharma (PROMPT certified)" },
          { type: "Parent-Child Interaction", frequency: "2x/week", duration: "60 min", provider: "Child Development Center" },
          { type: "Occupational Therapy", frequency: "1x/week", duration: "45 min", provider: "Sensory Integration Clinic" },
        ],
        expectedOutcomes: [
          { milestone: "50-word vocabulary", probability: 0.78, timeframe: "8 months" },
          { milestone: "Two-word phrases", probability: 0.65, timeframe: "10 months" },
          { milestone: "Social initiation", probability: 0.72, timeframe: "12 months" },
        ],
        cost: { total: "₹3.8L", duration: "6 months", perMonth: "₹63,000" },
      },
      alternative: {
        name: "Plan B: Balanced Development",
        confidence: 0.65,
        reasoning: "Lower intensity but more sustainable for families with resource constraints. 58% of similar cases showed good progress.",
        therapies: [
          { type: "Speech Therapy", frequency: "3x/week", duration: "45 min", provider: "Community Clinic" },
          { type: "ABA Therapy", frequency: "10 hrs/week", duration: "—", provider: "Home-based program" },
          { type: "Social Skills Group", frequency: "1x/week", duration: "60 min", provider: "Therapy Center" },
        ],
        expectedOutcomes: [
          { milestone: "50-word vocabulary", probability: 0.65, timeframe: "10 months" },
          { milestone: "Two-word phrases", probability: 0.52, timeframe: "12 months" },
          { milestone: "Behavioral regulation", probability: 0.68, timeframe: "9 months" },
        ],
        cost: { total: "₹2.9L", duration: "6 months", perMonth: "₹48,000" },
      },
    },
  }

  const plans = therapyPlans[selectedPatient] || therapyPlans.patient_001

  return (
    <div>
      {/* Page Header */}
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>AI Therapy Recommendations</h1>
          <p style={s.pageSubtitle}>Personalized treatment plans based on 10,000+ case outcomes</p>
        </div>
      </div>

      {/* Patient Selector */}
      <div style={s.card}>
        <h2 style={s.cardTitle}>Select Patient</h2>
        <div style={s.patientGrid}>
          {patients.map(p => (
            <div
              key={p.id}
              onClick={() => { setSelectedPatient(p.id); setShowRecommendations(false); }}
              style={{
                ...s.patientCard,
                ...(selectedPatient === p.id ? s.patientCardActive : {}),
              }}
            >
              <div style={s.patientIcon}>👤</div>
              <h3 style={s.patientName}>{p.name}</h3>
              <p style={s.patientMeta}>Age {p.age} · {p.severity} ASD</p>
              <div style={s.riskBadge}>Risk: {p.riskScore.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Patient Profile */}
      <div style={s.card}>
        <h2 style={s.cardTitle}>Patient Profile: {patient.name}</h2>
        <div style={s.profileGrid}>
          <div style={s.profileItem}>
            <span style={s.profileLabel}>Age</span>
            <span style={s.profileValue}>{patient.age} years</span>
          </div>
          <div style={s.profileItem}>
            <span style={s.profileLabel}>Severity</span>
            <span style={s.profileValue}>{patient.severity}</span>
          </div>
          <div style={s.profileItem}>
            <span style={s.profileLabel}>Risk Score</span>
            <span style={s.profileValue}>{patient.riskScore.toFixed(2)}</span>
          </div>
          <div style={s.profileItem}>
            <span style={s.profileLabel}>Primary Concerns</span>
            <span style={s.profileValue}>Speech delay, limited eye contact</span>
          </div>
        </div>

        {!showRecommendations && (
          <button onClick={() => setShowRecommendations(true)} style={s.generateButton}>
            🤖 Generate AI Therapy Plan
          </button>
        )}
      </div>

      {/* AI Recommendations */}
      {showRecommendations && (
        <>
          {/* Plan A */}
          <div style={{ ...s.card, borderLeft: '5px solid #38a169' }}>
            <div style={s.planHeader}>
              <div>
                <h2 style={s.planTitle}>✨ {plans.recommended.name}</h2>
                <p style={s.planSubtitle}>Recommended by AI with {(plans.recommended.confidence * 100).toFixed(0)}% confidence</p>
              </div>
              <div style={{ ...s.confidenceBadge, background: '#c6f6d5', color: '#276749' }}>
                Best Outcome
              </div>
            </div>

            <div style={s.reasoningBox}>
              <strong>Why this plan?</strong>
              <p style={{ margin: '8px 0 0 0', color: '#555' }}>{plans.recommended.reasoning}</p>
            </div>

            {/* Therapies */}
            <h3 style={s.sectionTitle}>Therapy Schedule</h3>
            <div style={s.therapyList}>
              {plans.recommended.therapies.map((t, i) => (
                <div key={i} style={s.therapyItem}>
                  <div style={s.therapyIcon}>🎯</div>
                  <div style={{ flex: 1 }}>
                    <div style={s.therapyType}>{t.type}</div>
                    <div style={s.therapyDetails}>{t.frequency} · {t.duration}</div>
                    <div style={s.therapyProvider}>{t.provider}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Expected Outcomes */}
            <h3 style={s.sectionTitle}>Predicted Milestones</h3>
            <div style={s.outcomeList}>
              {plans.recommended.expectedOutcomes.map((o, i) => (
                <div key={i} style={s.outcomeItem}>
                  <div style={s.outcomeMilestone}>{o.milestone}</div>
                  <div style={s.outcomeStats}>
                    <span style={{ color: '#38a169', fontWeight: '600' }}>
                      {(o.probability * 100).toFixed(0)}% probability
                    </span>
                    {' · '}
                    <span style={{ color: '#666' }}>Expected in {o.timeframe}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Cost */}
            <div style={s.costBox}>
              <div style={s.costRow}>
                <span>Total Investment (6 months)</span>
                <strong style={{ fontSize: '20px' }}>{plans.recommended.cost.total}</strong>
              </div>
              <div style={s.costRow}>
                <span style={{ color: '#888' }}>Average per month</span>
                <span style={{ color: '#888' }}>{plans.recommended.cost.perMonth}</span>
              </div>
            </div>

            <button style={s.approveButton}>✓ Approve & Start Plan</button>
          </div>

          {/* Plan B */}
          <div style={{ ...s.card, borderLeft: '5px solid #d69e2e' }}>
            <div style={s.planHeader}>
              <div>
                <h2 style={s.planTitle}>⭐ {plans.alternative.name}</h2>
                <p style={s.planSubtitle}>Alternative with {(plans.alternative.confidence * 100).toFixed(0)}% confidence</p>
              </div>
              <div style={{ ...s.confidenceBadge, background: '#feebc8', color: '#7c2d12' }}>
                Budget-Friendly
              </div>
            </div>

            <div style={s.reasoningBox}>
              <strong>Why this plan?</strong>
              <p style={{ margin: '8px 0 0 0', color: '#555' }}>{plans.alternative.reasoning}</p>
            </div>

            <h3 style={s.sectionTitle}>Therapy Schedule</h3>
            <div style={s.therapyList}>
              {plans.alternative.therapies.map((t, i) => (
                <div key={i} style={s.therapyItem}>
                  <div style={s.therapyIcon}>🎯</div>
                  <div style={{ flex: 1 }}>
                    <div style={s.therapyType}>{t.type}</div>
                    <div style={s.therapyDetails}>{t.frequency} · {t.duration}</div>
                    <div style={s.therapyProvider}>{t.provider}</div>
                  </div>
                </div>
              ))}
            </div>

            <h3 style={s.sectionTitle}>Predicted Milestones</h3>
            <div style={s.outcomeList}>
              {plans.alternative.expectedOutcomes.map((o, i) => (
                <div key={i} style={s.outcomeItem}>
                  <div style={s.outcomeMilestone}>{o.milestone}</div>
                  <div style={s.outcomeStats}>
                    <span style={{ color: '#d69e2e', fontWeight: '600' }}>
                      {(o.probability * 100).toFixed(0)}% probability
                    </span>
                    {' · '}
                    <span style={{ color: '#666' }}>Expected in {o.timeframe}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={s.costBox}>
              <div style={s.costRow}>
                <span>Total Investment (6 months)</span>
                <strong style={{ fontSize: '20px' }}>{plans.alternative.cost.total}</strong>
              </div>
              <div style={s.costRow}>
                <span style={{ color: '#888' }}>Average per month</span>
                <span style={{ color: '#888' }}>{plans.alternative.cost.perMonth}</span>
              </div>
            </div>

            <button style={{ ...s.approveButton, background: '#d69e2e' }}>
              Consider This Plan
            </button>
          </div>
        </>
      )}
    </div>
  )
}

const s = {
  pageHeader: { marginBottom: '24px' },
  pageTitle: { fontSize: '26px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 4px 0' },
  pageSubtitle: { color: '#666', margin: 0, fontSize: '14px' },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '28px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  cardTitle: { fontSize: '18px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 16px 0' },
  patientGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  patientCard: {
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  patientCardActive: {
    borderColor: '#667eea',
    background: '#f0f3ff',
    transform: 'scale(1.02)',
  },
  patientIcon: { fontSize: '32px', marginBottom: '8px' },
  patientName: { fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0' },
  patientMeta: { fontSize: '13px', color: '#888', margin: '0 0 8px 0' },
  riskBadge: {
    display: 'inline-block',
    background: '#fff3cd',
    color: '#856404',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  profileGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' },
  profileItem: { display: 'flex', flexDirection: 'column', gap: '4px' },
  profileLabel: { fontSize: '12px', color: '#888', fontWeight: '600', textTransform: 'uppercase' },
  profileValue: { fontSize: '16px', color: '#333', fontWeight: '600' },
  generateButton: {
    marginTop: '12px',
    padding: '13px 32px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
  },
  planHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
  planTitle: { fontSize: '20px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 4px 0' },
  planSubtitle: { fontSize: '14px', color: '#666', margin: 0 },
  confidenceBadge: {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
  },
  reasoningBox: {
    background: '#f8f9fb',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  sectionTitle: { fontSize: '16px', fontWeight: '700', margin: '20px 0 12px 0' },
  therapyList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  therapyItem: {
    display: 'flex',
    gap: '12px',
    padding: '14px',
    background: '#f8f9fb',
    borderRadius: '8px',
  },
  therapyIcon: { fontSize: '24px' },
  therapyType: { fontSize: '15px', fontWeight: '600', color: '#333' },
  therapyDetails: { fontSize: '13px', color: '#666', margin: '2px 0' },
  therapyProvider: { fontSize: '12px', color: '#888', fontStyle: 'italic' },
  outcomeList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  outcomeItem: {
    padding: '12px 16px',
    background: '#f8f9fb',
    borderRadius: '8px',
    borderLeft: '4px solid #38a169',
  },
  outcomeMilestone: { fontSize: '15px', fontWeight: '600', color: '#333', marginBottom: '4px' },
  outcomeStats: { fontSize: '13px' },
  costBox: {
    marginTop: '20px',
    padding: '16px',
    background: '#f0f3ff',
    borderRadius: '8px',
    border: '1px solid #d0d7ff',
  },
  costRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '14px',
  },
  approveButton: {
    marginTop: '16px',
    padding: '13px',
    borderRadius: '8px',
    border: 'none',
    background: '#38a169',
    color: 'white',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
  },
}
