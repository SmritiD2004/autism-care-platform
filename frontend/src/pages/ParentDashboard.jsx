import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function ParentDashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [showCheckIn, setShowCheckIn] = useState(false)

  // Mock child data
  const child = {
    name: 'Aarav',
    age: 4,
    diagnosis: 'ASD Level 2',
    lastScreening: {
      date: '5 days ago',
      riskScore: 0.68,
      riskLevel: 'Moderate',
    },
  }

  // Mock progress data (last 30 days)
  const progressData = [
    { day: 'Week 1', communication: 3, social: 2, behavioral: 4 },
    { day: 'Week 2', communication: 5, social: 3, behavioral: 3 },
    { day: 'Week 3', communication: 7, social: 4, behavioral: 2 },
    { day: 'Week 4', communication: 9, social: 5, behavioral: 2 },
  ]

  const milestones = [
    { title: '50-word vocabulary', current: 38, target: 50, progress: 76, due: 'April 2026' },
    { title: 'Two-word phrases', current: 5, target: 15, progress: 33, due: 'May 2026' },
    { title: 'Self-feeding', current: 70, target: 95, progress: 74, due: 'June 2026' },
  ]

  const todayChecklist = [
    { task: 'Morning medication', done: true },
    { task: 'Speech therapy (3 PM)', done: false },
    { task: 'Home practice (15 min)', done: false },
    { task: 'Evening check-in log', done: false },
  ]

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Welcome, {user.fullName}</h1>
          <p style={s.subtitle}>Here's how {child.name} is progressing today</p>
        </div>
        <button onClick={() => setShowCheckIn(!showCheckIn)} style={s.checkInBtn}>
          📝 Daily Check-In
        </button>
      </div>

      {/* Daily Check-In Modal */}
      {showCheckIn && (
        <div style={s.modal}>
          <div style={s.modalContent}>
            <h3 style={s.modalTitle}>Daily Check-In</h3>
            <div style={s.checkInForm}>
              <div style={s.formGroup}>
                <label>Sleep quality (hours)</label>
                <input type="number" placeholder="7.5" style={s.input} />
              </div>
              <div style={s.formGroup}>
                <label>Mood this morning</label>
                <select style={s.input}>
                  <option>Happy</option>
                  <option>Neutral</option>
                  <option>Irritable</option>
                  <option>Very irritable</option>
                </select>
              </div>
              <div style={s.formGroup}>
                <label>Meltdowns today</label>
                <input type="number" placeholder="0" style={s.input} />
              </div>
              <div style={s.formGroup}>
                <label>Communication wins</label>
                <textarea placeholder="Said 'juice' without prompting..." style={s.textarea} rows={3} />
              </div>
              <div style={s.modalActions}>
                <button onClick={() => setShowCheckIn(false)} style={s.saveBtn}>Save</button>
                <button onClick={() => setShowCheckIn(false)} style={s.cancelBtn}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Child Profile Card */}
      <div style={s.profileCard}>
        <div style={s.profileHeader}>
          <div style={s.childAvatar}>{child.name.charAt(0)}</div>
          <div>
            <h2 style={s.childName}>{child.name}</h2>
            <p style={s.childMeta}>{child.age} years old · {child.diagnosis}</p>
          </div>
        </div>
        <div style={s.profileStats}>
          <div style={s.profileStat}>
            <div style={s.statLabel}>Last Screening</div>
            <div style={s.statValue}>{child.lastScreening.date}</div>
          </div>
          <div style={s.profileStat}>
            <div style={s.statLabel}>Risk Score</div>
            <div style={s.statValue}>{child.lastScreening.riskScore.toFixed(2)}</div>
          </div>
          <div style={s.profileStat}>
            <div style={s.statLabel}>Risk Level</div>
            <div style={s.statValue}>{child.lastScreening.riskLevel}</div>
          </div>
        </div>
      </div>

      {/* Today's Checklist */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Today's Tasks</h2>
        <div style={s.checklist}>
          {todayChecklist.map((item, i) => (
            <div key={i} style={s.checklistItem}>
              <input type="checkbox" checked={item.done} style={s.checkbox} readOnly />
              <span style={{ ...s.checklistText, textDecoration: item.done ? 'line-through' : 'none' }}>
                {item.task}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Chart */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Progress Over Time</h2>
        <div style={s.chartCard}>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={progressData}>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="communication" stroke="#14b8a6" strokeWidth={2} name="Communication" />
              <Line type="monotone" dataKey="social" stroke="#6366f1" strokeWidth={2} name="Social" />
              <Line type="monotone" dataKey="behavioral" stroke="#f59e0b" strokeWidth={2} name="Behavioral" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Milestones */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>Current Milestones</h2>
        <div style={s.milestonesList}>
          {milestones.map((m, i) => (
            <div key={i} style={s.milestoneCard}>
              <div style={s.milestoneHeader}>
                <div style={s.milestoneTitle}>{m.title}</div>
                <div style={s.milestoneProgress}>{m.progress}%</div>
              </div>
              <div style={s.milestoneBar}>
                <div style={{ ...s.milestoneBarFill, width: `${m.progress}%` }} />
              </div>
              <div style={s.milestoneFooter}>
                <span>{m.current} / {m.target}</span>
                <span style={s.milestoneDue}>Due: {m.due}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Crisis Alert (if any) */}
      <div style={s.alertBox}>
        <div style={s.alertIcon}>⚠️</div>
        <div style={s.alertContent}>
          <div style={s.alertTitle}>Moderate Stress Detected</div>
          <div style={s.alertMessage}>
            Your stress score has been above 65/100 for 3 consecutive days. 
            Consider scheduling respite care or reaching out to your support group.
          </div>
          <button style={s.alertBtn}>View Support Resources</button>
        </div>
      </div>
    </div>
  )
}

const s = {
  page: {
    padding: '40px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    background: '#f9fafb',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '15px',
    color: '#6b7280',
    margin: 0,
  },
  checkInBtn: {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    background: '#14b8a6',
    color: 'white',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  modal: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: 'white',
    borderRadius: '12px',
    padding: '32px',
    width: '100%',
    maxWidth: '500px',
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 24px 0',
  },
  checkInForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
  },
  textarea: {
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    fontFamily: 'inherit',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  saveBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    background: '#14b8a6',
    color: 'white',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  cancelBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    background: 'white',
    color: '#374151',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  profileCard: {
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '28px',
    marginBottom: '32px',
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '1px solid #f3f4f6',
  },
  childAvatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: '700',
  },
  childName: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 4px 0',
  },
  childMeta: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
  profileStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  },
  profileStat: {
    textAlign: 'center',
  },
  statLabel: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '6px',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a1a1a',
  },
  section: {
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 16px 0',
  },
  checklist: {
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
  },
  checklistItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 0',
    borderBottom: '1px solid #f3f4f6',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  checklistText: {
    fontSize: '15px',
    color: '#374151',
  },
  chartCard: {
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '24px',
  },
  milestonesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  milestoneCard: {
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
  },
  milestoneHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  milestoneTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a1a1a',
  },
  milestoneProgress: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#14b8a6',
  },
  milestoneBar: {
    height: '8px',
    background: '#f3f4f6',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  milestoneBarFill: {
    height: '100%',
    background: '#14b8a6',
    borderRadius: '4px',
    transition: 'width 0.3s',
  },
  milestoneFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#6b7280',
  },
  milestoneDue: {
    fontStyle: 'italic',
  },
  alertBox: {
    background: '#fef9c3',
    border: '1px solid #fde047',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    gap: '16px',
  },
  alertIcon: {
    fontSize: '32px',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#854d0e',
    marginBottom: '8px',
  },
  alertMessage: {
    fontSize: '14px',
    color: '#a16207',
    lineHeight: 1.6,
    marginBottom: '12px',
  },
  alertBtn: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    background: '#ca8a04',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
}
