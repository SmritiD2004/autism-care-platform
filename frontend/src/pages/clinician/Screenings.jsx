import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import ScreeningList from '../../components/ScreeningList';
import ScreeningDetail from '../../components/ScreeningDetail';
import '../../styles/design-system.css';
import '../../styles/clinician.css';

const mockScreenings = [];

export default function ClinicianScreenings() {
  const [selected, setSelected] = useState(mockScreenings[0]);
  const [tab, setTab] = useState('analysis');
  const [decision, setDecision] = useState('');
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState({});

  const { data: screenings = mockScreenings } = useQuery({
    queryKey: ['screenings'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/screenings');
        return data?.length ? data : mockScreenings;
      } catch { return mockScreenings; }
    },
  });

  const handleSaveDecision = () => {
    setSaved(prev => ({ ...prev, [selected.id]: { decision, note } }));
    alert('Decision saved');
  };

  const pendingCount = screenings.filter(s => s.status === 'pending').length;
  const reviewedCount = screenings.filter(s => s.status === 'reviewed').length;

  return (
    <section style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* ── Top search bar ── */}
      <div style={{
        background: '#0f1923',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '12px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8, padding: '8px 14px', width: 280,
        }}>
          <svg width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span style={{ color: '#64748b', fontSize: 13 }}>Search patients, screenings...</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg,#14b8a6,#0d9488)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 14, color: '#fff',
          }}>A</div>
        </div>
      </div>

      {/* ── Page body ── */}
      <div style={{ padding: '28px 28px', flex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>
            AI Screening Reviews
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>
            {pendingCount} pending · {reviewedCount} reviewed
          </p>
        </div>

        {/* Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
          {/* LEFT */}
          <ScreeningList
            screenings={screenings}
            selectedId={selected?.id}
            onSelect={setSelected}
          />

          {/* RIGHT */}
          {selected ? (
            <ScreeningDetail
              screening={selected}
              tab={tab}
              setTab={setTab}
              decision={decision}
              setDecision={setDecision}
              note={note}
              setNote={setNote}
              onSaveDecision={handleSaveDecision}
            />
          ) : (
            <div style={{
              background: '#132030',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              minHeight: 300,
              color: '#64748b', fontSize: 14,
            }}>
              Select a screening to view details
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
