import React, { useState, useEffect } from 'react'

export default function Preferences({ initial = {}, onSave, onCancel }) {
  const allInterests = ['outdoor', 'agriculture', 'aviation', 'research', 'energy']
  const allVariables = [
    { key: 'temperature', label: 'Temperature' },
    { key: 'precipitation', label: 'Precipitation' },
    { key: 'wind', label: 'Wind speed' },
    { key: 'humidity', label: 'Humidity' },
    { key: 'cloud_cover', label: 'Cloud cover' },
    { key: 'pressure', label: 'Pressure' },
    { key: 'solar_radiation', label: 'Solar radiation' }
  ]

  const [interests, setInterests] = useState(() => {
    const base = {}
    allInterests.forEach(k => base[k] = !!initial[k])
    return base
  })

  const [variables, setVariables] = useState(() => {
    const base = {}
    allVariables.forEach(v => base[v.key] = initial.variables ? !!initial.variables[v.key] : (v.key === 'temperature'))
    return base
  })

  const [region, setRegion] = useState(initial.region || '')
  const [notifications, setNotifications] = useState({ email: !!(initial.notifications && initial.notifications.email), sms: !!(initial.notifications && initial.notifications.sms) })

  useEffect(() => {
    // keep local derived state in sync if initial changes
  }, [initial])

  function toggleInterest(k) { setInterests(prev => ({ ...prev, [k]: !prev[k] })) }
  function toggleVariable(k) { setVariables(prev => ({ ...prev, [k]: !prev[k] })) }
  function toggleNotify(k) { setNotifications(prev => ({ ...prev, [k]: !prev[k] })) }

  function handleSave(e) {
    e.preventDefault()
    const prefs = { ...interests, variables, region, notifications }
    if (onSave) onSave(prefs)
  }

  return (
    <form onSubmit={handleSave}>
      <div>
        <h4>Interests</h4>
        {allInterests.map(k => (
          <div key={k}>
            <label>
              <input type="checkbox" checked={!!interests[k]} onChange={() => toggleInterest(k)} /> {k[0].toUpperCase() + k.slice(1)}
            </label>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8 }}>
        <h4>Preferred weather parameters</h4>
        {allVariables.map(v => (
          <div key={v.key}>
            <label>
              <input type="checkbox" checked={!!variables[v.key]} onChange={() => toggleVariable(v.key)} /> {v.label}
            </label>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8 }}>
        <h4>Region / Notes</h4>
        <input className="input" placeholder="e.g. Tokyo area, coastal regions..." value={region} onChange={e => setRegion(e.target.value)} />
      </div>

      <div style={{ marginTop: 8 }}>
        <h4>Notifications</h4>
        <div><label><input type="checkbox" checked={notifications.email} onChange={() => toggleNotify('email')} /> Email</label></div>
        <div><label><input type="checkbox" checked={notifications.sms} onChange={() => toggleNotify('sms')} /> SMS</label></div>
      </div>

      <div style={{ marginTop: 10 }}>
        <button className="btn" type="submit">Save preferences</button>
        <button type="button" className="btn" style={{ marginLeft: 8 }} onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}
