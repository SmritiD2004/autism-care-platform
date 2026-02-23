// src/router/index.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

/* ── PUBLIC ── */
import Landing  from '../pages/Landing';
import Login    from '../pages/auth/Login';
import Register from '../pages/auth/Register';

/* ── CLINICIAN (protected) ── */
import ClinicianLayout    from '../pages/clinician/ClinicianLayout';
import ClinicianDashboard from '../pages/clinician/Dashboard';
import ClinicianPatients  from '../pages/clinician/Patients';       // was Screenings
import ClinicianTherapy   from '../pages/clinician/Therapy';
import ClinicianAlerts    from '../pages/clinician/Alerts';
import ClinicianSettings  from '../pages/clinician/Settings';

/* ── PARENT (protected) ── */
import ParentLayout    from '../pages/parent/ParentLayout';
import ParentDashboard from '../pages/parent/Dashboard';
import ParentScreening from '../pages/parent/Screening';
import ParentDailyLog  from '../pages/parent/DailyLog';
import ParentAlerts    from '../pages/parent/CrisisAlerts';
import ParentWellbeing from '../pages/parent/WellBeing';
import ParentSettings  from '../pages/parent/Settings';
import CrisisAlerts from '../pages/parent/CrisisAlerts';

/* ── 404 ── */
function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', background: '#0a1628',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16, fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ fontSize: 48 }}>404</div>
      <h2 style={{ color: '#f1f5f9', margin: 0 }}>Page not found</h2>
      <p style={{ color: '#64748b', margin: 0 }}>The requested page does not exist.</p>
      <button
        style={{
          padding: '10px 24px', background: '#14b8a6', color: '#fff',
          border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer',
        }}
        onClick={() => (window.location.href = '/')}
      >
        Go home
      </button>
    </div>
  );
}

export default function AppRouter() {
  return (
    <Routes>
      {/* ── PUBLIC ── */}
      <Route path="/"         element={<Landing  />} />
      <Route path="/login"    element={<Login    />} />
      <Route path="/register" element={<Register />} />

      {/* ── PROTECTED ── */}
      <Route element={<PrivateRoute />}>

        {/* Clinician */}
        <Route path="/clinician" element={<ClinicianLayout />}>
          <Route index                element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"     element={<ClinicianDashboard />} />
          <Route path="patients"      element={<ClinicianPatients  />} />
          <Route path="therapy"       element={<ClinicianTherapy   />} />
          <Route path="alerts"        element={<ClinicianAlerts    />} />
          <Route path="settings"      element={<ClinicianSettings  />} />
        </Route>

        {/* Parent */}
        <Route path="/parent" element={<ParentLayout />}>
          <Route index                element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"     element={<ParentDashboard />} />
          <Route path="screening"     element={<ParentScreening />} />
          <Route path="daily-log"     element={<ParentDailyLog/>} />
          <Route path="alerts"        element={<ParentAlerts/>} />
          <Route path="wellbeing"     element={<ParentWellbeing />} />
          <Route path="settings"      element={<ParentSettings  />} />
        </Route>

      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
