import { useState } from 'react'
import ConsentModal from '../components/ConsentModal'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

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

  const handleFileChange = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setResult(null)
    setError(null)
  }

  const handleUpload = async () => {
    if (!file) return
    if (!consented) {
      setConsentOpen(true)
      return
    }
    setResult(null)
    setError(null)
    setLoading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const { data } = await axios.post(`${API}/screening`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000
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
    if (file) handleUpload()  // Retry upload after consent
  }

  const onConsentDecline = () => {
    setConsentOpen(false)
    setFile(null)
  }

  const shapData = result?.shap_importance
    ? Object.entries(result.shap_importance)
        .filter(([, v]) => typeof v === 'number')
        .map(([name, value]) => ({ name, value: Number(value) }))
    : []

  return (
    <div className="screening">
      <h1>Screening</h1>
      <p>Upload a short video for ASD risk analysis. Low &lt;0.3, High &gt;0.7.</p>

      <input type="file" accept="video/*" onChange={handleFileChange} disabled={loading} />
      {file && !loading && (
        <button onClick={handleUpload}>Analyze</button>
      )}
      <ConsentModal
        open={consentOpen}
        onAccept={onConsentAccept}
        onDecline={onConsentDecline}
      />
      {file && <p>Selected: {file.name}</p>}

      {loading && <p>Analyzing...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {result && (
        <>
          <div className="metrics">
            <div className="metric">
              <strong>Risk Score</strong>
              <span className={result.risk >= 0.7 ? 'high' : result.risk <= 0.3 ? 'low' : 'medium'}>
                {result.risk?.toFixed(2) ?? '-'}
              </span>
            </div>
            <div className="metric">
              <strong>Gaze Fixation (sec)</strong>
              <span>{result.indicators?.gaze_fixation_time?.toFixed(2) ?? '-'}</span>
            </div>
            <div className="metric">
              <strong>Gesture Anomalies</strong>
              <span>{result.indicators?.gesture_anomalies?.toFixed(4) ?? '-'}</span>
            </div>
          </div>

          {result.heatmap_base64 && (
            <div className="heatmap">
              <h3>Feature Importance</h3>
              <img src={`data:image/png;base64,${result.heatmap_base64}`} alt="SHAP heatmap" style={{ maxWidth: 500 }} />
            </div>
          )}

          {shapData.length > 0 && !result.heatmap_base64 && (
            <div className="chart">
              <h3>Feature Contribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={shapData} layout="vertical" margin={{ left: 80 }}>
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  )
}
