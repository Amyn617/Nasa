import React, { useState } from 'react'
import Preferences from './Preferences'
import OnboardingQuestionnaire from './OnboardingQuestionnaire'

export default function Auth({ user, setUser, onClose } ) {
  const [mode, setMode] = useState('login')
  const [showPreferences, setShowPreferences] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  function persistUser(u) {
    setUser(u)
    try { localStorage.setItem('user', JSON.stringify(u)) } catch (e) { /* ignore */ }
  }

  function onSubmit(e) {
    e.preventDefault()
    const form = e.target
    const email = form.email.value
    const password = form.password.value
    // Note: this is a mock; do not use in production
    const u = { 
      email, 
      preferences: { outdoor: true, variables: { temperature: true } }, 
      registered: mode === 'register',
      onboardingCompleted: false
    }
    persistUser(u)
    
    if (mode === 'register') {
      // Show onboarding questionnaire for new users
      setShowOnboarding(true)
    } else {
      // For existing users logging in
      if (!u.preferences || !u.onboardingCompleted) {
        setShowOnboarding(true)
      } else {
        if (onClose) onClose()
      }
    }
  }

  function logout() {
    setUser(null)
    try { localStorage.removeItem('user') } catch (e) {}
  }

  function savePreferences(prefs) {
    const updated = { ...(user || {}), preferences: prefs }
    persistUser(updated)
    setShowPreferences(false)
    if (onClose) onClose()
  }

  function completeOnboarding(onboardingData) {
    // Convert onboarding data to user preferences format
    const preferences = {
      useCase: onboardingData.useCase,
      activityType: onboardingData.activityType,
      experienceLevel: onboardingData.experienceLevel,
      dashboardPreferences: onboardingData.dashboardPreferences || [],
      notifications: onboardingData.notifications || { email: false, sms: false },
      calendarIntegration: onboardingData.calendarIntegration || false,
      // Keep existing variables and add defaults based on use case
      variables: user?.preferences?.variables || { temperature: true }
    }

    const updated = { 
      ...(user || {}), 
      preferences,
      onboardingCompleted: true
    }
    persistUser(updated)
    setShowOnboarding(false)
    if (onClose) onClose()
  }

  function skipOnboarding() {
    const updated = { 
      ...(user || {}), 
      onboardingCompleted: true
    }
    persistUser(updated)
    setShowOnboarding(false)
    if (onClose) onClose()
  }

  return (
    <div>
      {user ? (
        <div style={{
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #1a73e8, #34a853)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px',
              fontWeight: 'bold',
              marginRight: '12px'
            }}>
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a73e8' }}>
                Welcome back!
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {user.email}
              </div>
            </div>
          </div>

          {/* User Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              padding: '12px',
              background: '#e3f2fd',
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1976d2' }}>
                {user.preferences?.favorite_use_cases?.length || 0}
              </div>
              <div style={{ fontSize: '11px', color: '#666' }}>Use Cases</div>
            </div>
            <div style={{
              padding: '12px',
              background: '#e8f5e8',
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2e7d32' }}>
                {user.preferences?.preferred_locations?.length || 0}
              </div>
              <div style={{ fontSize: '11px', color: '#666' }}>Locations</div>
            </div>
            <div style={{
              padding: '12px',
              background: '#fff3e0',
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f57c00' }}>
                {user.preferences?.frequent_parameters?.length || 0}
              </div>
              <div style={{ fontSize: '11px', color: '#666' }}>Parameters</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn" 
              onClick={() => setShowPreferences(true)}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: '#1a73e8',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ⚙️ Edit Preferences
            </button>
            <button 
              className="btn" 
              onClick={logout}
              style={{
                padding: '12px 16px',
                background: '#fff',
                color: '#dc3545',
                border: '1px solid #dc3545',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      ) : (
        <div>
          {/* Auth Mode Toggle */}
          <div style={{
            display: 'flex',
            marginBottom: '20px',
            background: '#f1f3f4',
            borderRadius: '6px',
            padding: '4px'
          }}>
            <button
              type="button"
              onClick={() => setMode('login')}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                background: mode === 'login' ? '#1a73e8' : 'transparent',
                color: mode === 'login' ? 'white' : '#666',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: mode === 'login' ? 'bold' : 'normal'
              }}
            >
              🔐 Login
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                background: mode === 'register' ? '#1a73e8' : 'transparent',
                color: mode === 'register' ? 'white' : '#666',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: mode === 'register' ? 'bold' : 'normal'
              }}
            >
              📝 Register
            </button>
          </div>

          <form onSubmit={onSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                Email Address
              </label>
              <input 
                name="email" 
                type="email"
                className="input" 
                placeholder="your.email@example.com"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #dadce0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                Password
              </label>
              <input 
                name="password" 
                type="password" 
                className="input" 
                placeholder="Enter your password"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #dadce0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button 
              className="btn" 
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                background: '#1a73e8',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {mode === 'login' ? '🔐 Sign In' : '📝 Create Account'}
            </button>
          </form>

          {/* Benefits */}
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 12px 0' }}>
              🌟 Benefits of Creating an Account
            </h4>
            <ul style={{ fontSize: '12px', margin: 0, paddingLeft: '16px', color: '#666' }}>
              <li>Save favorite use cases and locations</li>
              <li>Get personalized parameter recommendations</li>
              <li>Access analysis history and export options</li>
              <li>Receive notifications about new datasets</li>
            </ul>
          </div>
        </div>
      )}

      {showOnboarding && (
        <OnboardingQuestionnaire
          onComplete={completeOnboarding}
          onSkip={skipOnboarding}
        />
      )}

      {showPreferences && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }}>
          <EnhancedPreferences 
            initial={(user && user.preferences) || {}} 
            onSave={savePreferences} 
            onCancel={() => setShowPreferences(false)} 
          />
        </div>
      )}
    </div>
  )
}

function PreferencesForm({ initial, onSave, onCancel }) {
  const [prefs, setPrefs] = useState(initial)
  function toggle(k) { setPrefs({ ...prefs, [k]: !prefs[k] }) }
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(prefs) }}>
      <div><label><input type="checkbox" checked={prefs.outdoor} onChange={() => toggle('outdoor')} /> Outdoor events</label></div>
      <div><label><input type="checkbox" checked={prefs.agriculture} onChange={() => toggle('agriculture')} /> Agriculture</label></div>
      <div><label><input type="checkbox" checked={prefs.aviation} onChange={() => toggle('aviation')} /> Aviation</label></div>
      <div style={{ marginTop: 8 }}>
        <button className="btn" type="submit">Save preferences</button>
        <button type="button" className="btn" style={{ marginLeft: 8 }} onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}
