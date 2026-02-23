import { useState } from 'react';
import ActiveAlertItem from './ActiveAlertItem';
import Card from './Card';

export default function AlertSection({ alerts }) {
  const [expandedId, setExpandedId] = useState(null);
  const [handled, setHandled] = useState(new Set());

  const toggle = id => setExpandedId(prev => (prev === id ? null : id));
  const markHandled = id => setHandled(prev => new Set(prev).add(id));

  const activeAlerts = alerts.filter(a => !handled.has(a.id));

  return (
    <div className="col gap-3">
      {activeAlerts.map(alert => (
        <ActiveAlertItem
          key={alert.id}
          alert={alert}
          isExpanded={expandedId === alert.id}
          onToggle={toggle}
          onMarkHandled={markHandled}
        />
      ))}

      {activeAlerts.length === 0 && (
        <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 36, marginBottom: 14 }}>✅</div>
          <div className="nt-sh-title" style={{ marginBottom: 6 }}>All clear</div>
          <div className="nt-text">No active alerts at this time.</div>
        </Card>
      )}
    </div>
  );
}
