import React, { useState } from 'react'

export default function CalendarNotificationSetup({ user, setUser, onClose }) {
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(user?.preferences?.calendarIntegration || false)
  const [calendarType, setCalendarType] = useState('google')
  const [notifications, setNotifications] = useState(user?.preferences?.notifications || {
    email: false,
    sms: false,
    calendar: false
  })

  function handleConnect() {
    setConnecting(true)
    
    // Simulate connection process
    setTimeout(() => {
      const updatedUser = {
        ...user,
        preferences: {
          ...user.preferences,
          calendarIntegration: true,
          calendarType: calendarType,
          notifications: {
            ...notifications,
            calendar: true
          }
        }
      }
      setUser(updatedUser)
      setConnected(true)
      setConnecting(false)
    }, 2000)
  }

  function handleDisconnect() {
    const updatedUser = {
      ...user,
      preferences: {
        ...user.preferences,
        calendarIntegration: false,
        calendarType: null,
        notifications: {
          ...notifications,
          calendar: false
        }
      }
    }
    setUser(updatedUser)
    setConnected(false)
  }

  function updateNotification(type, value) {
    const updatedNotifications = { ...notifications, [type]: value }
    setNotifications(updatedNotifications)
    
    const updatedUser = {
      ...user,
      preferences: {
        ...user.preferences,
        notifications: updatedNotifications
      }
    }
    setUser(updatedUser)
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '500px',
        width: '90%'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0 }}>Calendar & Notifications</h3>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '24px', 
              cursor: 'pointer',
              color: '#999'
            }}
          >
            ×
          </button>
        </div>

        {/* Calendar Integration Section */}
        <div style={{ marginBottom: '32px' }}>
          <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
            📅 Calendar Integration
          </h4>
          
          {!connected ? (
            <div>
              <p style={{ color: '#666', marginBottom: '16px', lineHeight: '1.5' }}>
                Connect your calendar to receive weather alerts for your scheduled events and get 
                proactive notifications about conditions that might affect your plans.
              </p>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Choose your calendar provider:
                </label>
                <select 
                  value={calendarType}
                  onChange={(e) => setCalendarType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="google">Google Calendar</option>
                  <option value="outlook">Microsoft Outlook</option>
                  <option value="apple">Apple Calendar</option>
                  <option value="other">Other Calendar App</option>
                </select>
              </div>

              <button
                onClick={handleConnect}
                disabled={connecting}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: connecting ? '#ccc' : '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: connecting ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                {connecting ? '🔄 Connecting...' : `📅 Connect ${calendarType} Calendar`}
              </button>
            </div>
          ) : (
            <div style={{ 
              backgroundColor: '#f0f8ff', 
              padding: '16px', 
              borderRadius: '8px',
              border: '1px solid #b3e0ff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: '#2e8b57', marginRight: '8px' }}>✅</span>
                <strong>Connected to {user?.preferences?.calendarType || 'Google'} Calendar</strong>
              </div>
              <p style={{ color: '#666', margin: '0 0 12px 0', fontSize: '14px' }}>
                We'll analyze your calendar events and send you weather updates that might affect your plans.
              </p>
              <button
                onClick={handleDisconnect}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ff6b6b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        {/* Notification Preferences */}
        <div>
          <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
            🔔 Notification Preferences
          </h4>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={(e) => updateNotification('email', e.target.checked)}
                style={{ marginRight: '12px', marginTop: '2px' }}
              />
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>📧 Email Notifications</div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Get daily weather summaries and severe weather alerts via email
                </div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={notifications.sms}
                onChange={(e) => updateNotification('sms', e.target.checked)}
                style={{ marginRight: '12px', marginTop: '2px' }}
              />
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>📱 SMS Alerts</div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Receive urgent weather warnings and critical updates via text message
                </div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={notifications.calendar && connected}
                onChange={(e) => updateNotification('calendar', e.target.checked)}
                disabled={!connected}
                style={{ marginRight: '12px', marginTop: '2px' }}
              />
              <div>
                <div style={{ 
                  fontWeight: 'bold', 
                  marginBottom: '4px',
                  color: connected ? '#333' : '#999'
                }}>
                  📅 Calendar Integration Alerts
                </div>
                <div style={{ fontSize: '14px', color: connected ? '#666' : '#999' }}>
                  Get weather updates specific to your calendar events and meetings
                  {!connected && ' (requires calendar connection)'}
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginTop: '32px',
          paddingTop: '20px',
          borderTop: '1px solid #eee'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f8f9fa',
              color: '#333',
              border: '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Done
          </button>
          
          <div style={{ fontSize: '12px', color: '#999', alignSelf: 'center' }}>
            Settings are automatically saved
          </div>
        </div>
      </div>
    </div>
  )
}