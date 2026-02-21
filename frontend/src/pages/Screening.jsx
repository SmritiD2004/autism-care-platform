import { useState } from 'react'
import ConsentModal from '../components/ConsentModal'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const API = '/api'

export default function Screening() {
  const [file, setFile] = useState(null)
  const [consentOpen, setConsentOpen] = useState(false)
  const [consented, setConsented] = useState(() => {
    try { return localStorage.getItem('screening_consent') === '1' } catch { return false }
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFileChange = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setResult(null)
    setError(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) { setFile(f); setResult(null); setError(null) }
  }

  const handleUpload = async () => {
    if (!file) return
    if (!consented) { setConsentOpen(true); return }
    setResult(null)
    setError(null)
    setLoading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const { data } = await axios.post(`${API}/screening`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      })
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const onConsentAccept = () => {
    localStorage.setItem('screening_consent', '1')
    setConsented(true)
    setConsentOpen(false)
    if (file) handleUpload()
  }

  const onConsentDecline = () => {
    setConsentOpen(false)
    setFile(null)
  }

  const risk = result?.risk ?? null
  const riskLevel = risk === null ? null : risk >= 0.7 ? 'High' : risk <= 0.3 ? 'Low' : 'Moderate'
  const riskColor = risk === null ? '#888' : risk >= 0.7 ? '#e53e3e' : risk <= 0.3 ? '#38a169' : '#d69e2e'

  const shapData = result?.shap_importance
    ? Object.entries(result.shap_importance)
        .filter(([, v]) => typeof v === 'number')
        .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(4)) }))
    : []

  return (
    <div>
      {/* Page header */}
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>ASD Video Screening</h1>
          <p style={s.pageSubtitle}>Upload a short video for gaze & gesture analysis</p>
        </div>
        {consented && (
          <span style={s.consentBadge}>✓ Consent given</span>
        )}
      </div>

      {/* Upload card */}
      <div style={s.card}>
        <h2 style={s.cardTitle}>Upload Video</h2>
        <p style={s.cardSubtitle}>
          Supported formats: MP4, MOV, AVI, WEBM &nbsp;·&nbsp; Risk: Low &lt;0.3 · High &gt;0.7
        </p>

        {/* Drop zone */}
        <div
          style={{ ...s.dropZone, ...(dragOver ? s.dropZoneActive : {}) }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <div style={s.dropIcon}>🎥</div>
          {file ? (
            <>
              <p style={s.dropText}>{file.name}</p>
              <p style={s.dropHint}>{(file.size / (1024 * 1024)).toFixed(1)} MB · Click to change</p>
            </>
          ) : (
            <>
              <p style={s.dropText}>Drag & drop your video here</p>
              <p style={s.dropHint}>or click to browse files</p>
            </>
          )}
          <input
            id="fileInput"
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Analyze button */}
        {file && !loading && (
          <button onClick={handleUpload} style={s.analyzeButton}>
            ▶ Analyze Video
          </button>
        )}

        {loading && (
          <div style={s.loadingBox}>
            <div style={s.spinner} />
            <p style={s.loadingText}>Analyzing video — this takes 20–40 seconds...</p>
          </div>
        )}

        {error && (
          <div style={s.errorBox}>
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Risk score card */}
          <div style={{ ...s.card, borderLeft: `5px solid ${riskColor}` }}>
            <h2 style={s.cardTitle}>Screening Result</h2>
            <div style={s.metricsRow}>
              <div style={s.metricCard}>
                <p style={s.metricLabel}>Risk Score</p>
                <p style={{ ...s.metricValue, color: riskColor }}>
                  {risk.toFixed(2)}
                </p>
                <span style={{ ...s.riskBadge, background: riskColor }}>
                  {riskLevel} Risk
                </span>
              </div>
              <div style={s.metricCard}>
                <p style={s.metricLabel}>Gaze Fixation</p>
                <p style={s.metricValue}>
                  {result.indicators?.gaze_fixation_time?.toFixed(1) ?? '–'}<span style={s.metricUnit}>s</span>
                </p>
                <p style={s.metricHint}>Higher = more stable gaze</p>
              </div>
              <div style={s.metricCard}>
                <p style={s.metricLabel}>Gesture Anomalies</p>
                <p style={s.metricValue}>
                  {result.indicators?.gesture_anomalies?.toFixed(4) ?? '–'}
                </p>
                <p style={s.metricHint}>Pose variance score</p>
              </div>
              <div style={s.metricCard}>
                <p style={s.metricLabel}>Face Detected</p>
                <p style={s.metricValue}>
                  {result.gaze_metrics?.face_detection_ratio != null
                    ? `${(result.gaze_metrics.face_detection_ratio * 100).toFixed(0)}%`
                    : '–'}
                </p>
                <p style={s.metricHint}>of video frames</p>
              </div>
            </div>
          </div>

          {/* Heatmap or chart */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>Feature Importance</h2>
            <p style={s.cardSubtitle}>Contribution of each signal to the risk score</p>
            {result.heatmap_base64 ? (
              <img
                src={`data:image/png;base64,${result.heatmap_base64}`}
                alt="SHAP heatmap"
                style={{ maxWidth: '100%', borderRadius: '8px' }}
              />
            ) : shapData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={shapData} layout="vertical" margin={{ left: 120, right: 24 }}>
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {shapData.map((entry, i) => (
                      <Cell key={i} fill={entry.value > 0 ? '#e53e3e' : '#38a169'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: '#888' }}>No feature importance data available.</p>
            )}
          </div>
        </>
      )}

      <ConsentModal open={consentOpen} onAccept={onConsentAccept} onDecline={onConsentDecline} />
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  pageHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '24px',
  },
  pageTitle: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#1a1a2e',
    margin: '0 0 4px 0',
  },
  pageSubtitle: {
    color: '#666',
    margin: 0,
    fontSize: '14px',
  },
  consentBadge: {
    background: '#c6f6d5',
    color: '#276749',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '28px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a1a2e',
    margin: '0 0 4px 0',
  },
  cardSubtitle: {
    color: '#888',
    fontSize: '13px',
    margin: '0 0 20px 0',
  },
  dropZone: {
    border: '2px dashed #d0d7de',
    borderRadius: '10px',
    padding: '40px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: '#fafbfc',
  },
  dropZoneActive: {
    border: '2px dashed #667eea',
    background: '#f0f3ff',
  },
  dropIcon: { fontSize: '36px', marginBottom: '12px' },
  dropText: { fontSize: '16px', fontWeight: '600', color: '#333', margin: '0 0 4px 0' },
  dropHint: { fontSize: '13px', color: '#888', margin: 0 },
  analyzeButton: {
    marginTop: '20px',
    padding: '13px 32px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'block',
    width: '100%',
  },
  loadingBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '20px',
    padding: '16px',
    background: '#f0f3ff',
    borderRadius: '8px',
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '3px solid #667eea33',
    borderTop: '3px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    flexShrink: 0,
  },
  loadingText: { color: '#555', margin: 0, fontSize: '14px' },
  errorBox: {
    marginTop: '16px',
    padding: '14px 16px',
    background: '#fff5f5',
    border: '1px solid #fed7d7',
    borderRadius: '8px',
    color: '#c53030',
    fontSize: '14px',
  },
  metricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginTop: '8px',
  },
  metricCard: {
    background: '#f8f9fb',
    borderRadius: '10px',
    padding: '16px',
    textAlign: 'center',
  },
  metricLabel: {
    fontSize: '12px',
    color: '#888',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '0 0 8px 0',
  },
  metricValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a2e',
    margin: '0 0 6px 0',
    lineHeight: 1,
  },
  metricUnit: {
    fontSize: '16px',
    fontWeight: '400',
    color: '#888',
  },
  metricHint: {
    fontSize: '11px',
    color: '#aaa',
    margin: 0,
  },
  riskBadge: {
    display: 'inline-block',
    color: 'white',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
}
