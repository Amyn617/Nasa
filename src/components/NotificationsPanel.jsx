import React, { useState } from 'react'

export default function NotificationsPanel() {
  const [alerts, setAlerts] = useState({ heat: true, frost: false, wind: false })

  function toggle(k) { setAlerts({ ...alerts, [k]: !alerts[k] }) }

  return (
    <div style={{ marginTop: 12 }}>
      <h4>Notifications</h4>
      <div>
        <label><input type="checkbox" checked={alerts.heat} onChange={() => toggle('heat')} /> Heat alerts</label>
      </div>
      <div>
        <label><input type="checkbox" checked={alerts.frost} onChange={() => toggle('frost')} /> Frost alerts</label>
      </div>
      <div>
        <label><input type="checkbox" checked={alerts.wind} onChange={() => toggle('wind')} /> Wind alerts</label>
      </div>
    </div>
  )
}
