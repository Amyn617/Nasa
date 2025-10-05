import React, { useState, useEffect } from 'react'
import GuestExperience from './GuestExperience'
import PersonalizedDashboard from './PersonalizedDashboard'
import Auth from './Auth'

export default function UserExperienceRouter() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null')
    } catch (e) {
      return null
    }
  })
  
  const [authOpen, setAuthOpen] = useState(false)

  // Listen for auth requests from guest components
  useEffect(() => {
    function handleOpenAuth(event) {
      setAuthOpen(true)
    }

    window.addEventListener('openAuth', handleOpenAuth)
    return () => window.removeEventListener('openAuth', handleOpenAuth)
  }, [])

  // Persist user changes
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      } else {
        localStorage.removeItem('user')
      }
    } catch (e) {
      console.warn('Failed to persist user data:', e)
    }
  }, [user])

  const isAuthenticated = !!user
  const hasCompletedOnboarding = user?.onboardingCompleted === true

  function handleCloseAuth() {
    setAuthOpen(false)
  }

  return (
    <div className="user-experience">
      {/* Header Navigation */}
      <header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '12px 20px', 
        backgroundColor: 'white',
        borderBottom: '1px solid #e9ecef',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '20px', 
            color: '#333',
            fontWeight: 'bold'
          }}>
            🌍 NASA Weather Platform
          </h1>
        </div>
        
        <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isAuthenticated && (
            <>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                padding: '6px 12px',
                backgroundColor: '#f0f4ff',
                borderRadius: '16px',
                fontSize: '14px'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: '#667eea',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginRight: '8px'
                }}>
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <span style={{ color: '#333' }}>
                  {user.email.split('@')[0]}
                </span>
              </div>
              <button
                onClick={() => setAuthOpen(true)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  border: '1px solid #667eea',
                  borderRadius: '6px',
                  color: '#667eea',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Settings
              </button>
            </>
          )}
          
          {!isAuthenticated && (
            <button
              onClick={() => setAuthOpen(true)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Sign Up / Login
            </button>
          )}
        </nav>
      </header>

      {/* Main Content - Route Based on User Status */}
      <main>
        {isAuthenticated && hasCompletedOnboarding ? (
          <PersonalizedDashboard user={user} setUser={setUser} />
        ) : (
          <GuestExperience />
        )}
      </main>

      {/* Authentication Modal */}
      {authOpen && (
        <div style={{ 
          position: 'fixed', 
          left: 0, 
          top: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000 
        }} onClick={handleCloseAuth}>
          <div style={{ 
            width: '500px', 
            maxWidth: '90vw',
            background: '#fff', 
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            overflow: 'hidden'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '20px 24px 16px',
              borderBottom: '1px solid #eee'
            }}>
              <h3 style={{ margin: 0, color: '#333' }}>
                {isAuthenticated ? 'Account Settings' : 'Join NASA Weather Platform'}
              </h3>
              <button 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '24px', 
                  cursor: 'pointer',
                  color: '#999',
                  padding: 0,
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }} 
                onClick={handleCloseAuth}
              >
                ×
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <Auth user={user} setUser={setUser} onClose={handleCloseAuth} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}