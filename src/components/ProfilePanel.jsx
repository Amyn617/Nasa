import React, { useState, useEffect } from 'react'
import Preferences from './Preferences'
import { METEO_PARAMS } from '../services/meteomatics_params'

export default function ProfilePanel({ user, setUser }) {
  const [editing, setEditing] = useState(false)
  const [prefs, setPrefs] = useState({ agriculture: false, outdoor: true, aviation: false, variables: { temperature: true } })

  useEffect(() => {
    if (user && user.preferences) setPrefs(user.preferences)
  }, [user])

  function savePrefs(updated) {
    setPrefs(updated)
    if (user && setUser) {
      const updatedUser = { ...user, preferences: updated }
      setUser(updatedUser)
      try {
        // Persist only human-friendly parameter names for variables
        const varsObj = updated.variables || {}
        const labels = Object.keys(varsObj).filter(k => varsObj[k]).map(k => (METEO_PARAMS[k] && METEO_PARAMS[k].label) ? METEO_PARAMS[k].label : k)
        const persistPrefs = { ...updated, variables: labels }
        const persistUser = { ...user, preferences: persistPrefs }
        localStorage.setItem('user', JSON.stringify(persistUser))
      } catch (e) {}
    }
    setEditing(false)
  }

  return (
    <div style={{ marginBottom: 12 }}>
      {user ? (
        <div>
          <div><strong>{user.email}</strong></div>
          <div style={{ marginTop: 8 }}>
            <small>Interests:</small>
            <div style={{ marginLeft: 8 }}>
              {Object.keys(prefs).filter(k => k !== 'variables' && k !== 'region' && k !== 'notifications').map(k => (
                prefs[k] ? <div key={k}>• {k}</div> : null
              ))}
            </div>
            <div style={{ marginTop: 6 }}>
              <small>Variables:</small>
              <div style={{ marginLeft: 8 }}>
                {prefs.variables && Object.keys(prefs.variables).filter(k => prefs.variables[k]).map(k => <div key={k}>• {k}</div>)}
              </div>
            </div>
            <div style={{ marginTop: 6 }}>
              <small>Notifications:</small>
              <div style={{ marginLeft: 8 }}>
                {prefs.notifications && prefs.notifications.email ? <div>• Email</div> : null}
                {prefs.notifications && prefs.notifications.sms ? <div>• SMS</div> : null}
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              <button className="btn" onClick={() => setEditing(true)}>Edit preferences</button>
            </div>
          </div>
        </div>
      ) : null}

      {editing && (
        <div style={{ marginTop: 8, padding: 8, background: '#fff', border: '1px solid #eee', borderRadius: 6 }}>
          <Preferences initial={prefs} onSave={savePrefs} onCancel={() => setEditing(false)} />
        </div>
      )}
    </div>
  )
}
