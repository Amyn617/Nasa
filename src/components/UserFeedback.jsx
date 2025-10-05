import React from 'react'

// Enhanced Loading Component with Progress Tracking
export function LoadingIndicator({ 
  isLoading, 
  progress = 0, 
  stage = 'Initializing...', 
  showProgress = false,
  steps = [],
  currentStep = 0 
}) {
  if (!isLoading) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: 'white',
        padding: '32px',
        borderRadius: '12px',
        minWidth: '400px',
        maxWidth: '500px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #1a73e8',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <h3 style={{ margin: '0 0 8px 0', color: '#1a73e8' }}>
            🛰️ Fetching NASA Data
          </h3>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            {stage}
          </p>
        </div>

        {showProgress && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              width: '100%',
              height: '8px',
              background: '#f0f0f0',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #1a73e8, #34a853)',
                transition: 'width 0.3s ease',
                borderRadius: '4px'
              }}></div>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#666',
              marginTop: '4px'
            }}>
              <span>{Math.round(progress)}% complete</span>
              <span>Step {currentStep + 1} of {steps.length}</span>
            </div>
          </div>
        )}

        {steps.length > 0 && (
          <div>
            {steps.map((step, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 0',
                color: index < currentStep ? '#34a853' : 
                       index === currentStep ? '#1a73e8' : '#999'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: index < currentStep ? '#34a853' :
                             index === currentStep ? '#1a73e8' : '#e0e0e0',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  marginRight: '12px'
                }}>
                  {index < currentStep ? '✓' : index + 1}
                </div>
                <span style={{ fontSize: '14px' }}>{step}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

// Smart Error Display Component
export function ErrorDisplay({ 
  error, 
  onRetry, 
  onDismiss, 
  suggestions = [],
  showDetails = false 
}) {
  const [detailsOpen, setDetailsOpen] = React.useState(showDetails)

  if (!error) return null

  const getErrorType = (errorMessage) => {
    const msg = errorMessage.toLowerCase()
    if (msg.includes('network') || msg.includes('fetch')) return 'network'
    if (msg.includes('401') || msg.includes('unauthorized')) return 'auth'
    if (msg.includes('404') || msg.includes('not found')) return 'notfound'
    if (msg.includes('timeout')) return 'timeout'
    if (msg.includes('parameter')) return 'parameter'
    return 'general'
  }

  const errorType = getErrorType(error)
  const errorIcons = {
    network: '🌐',
    auth: '🔐',
    notfound: '🔍',
    timeout: '⏱️',
    parameter: '⚙️',
    general: '⚠️'
  }

  const errorTitles = {
    network: 'Connection Issue',
    auth: 'Authentication Required',
    notfound: 'Data Not Available',
    timeout: 'Request Timeout',
    parameter: 'Invalid Parameters',
    general: 'Something Went Wrong'
  }

  return (
    <div style={{
      background: '#fff5f5',
      border: '1px solid #fed7d7',
      borderRadius: '8px',
      padding: '16px',
      margin: '16px 0'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <span style={{ fontSize: '24px' }}>{errorIcons[errorType]}</span>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#e53e3e' }}>
            {errorTitles[errorType]}
          </h4>
          <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '14px' }}>
            {error}
          </p>

          {suggestions.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ fontSize: '14px', color: '#333' }}>Try this:</strong>
              <ul style={{ margin: '4px 0 0 16px', padding: 0, color: '#666' }}>
                {suggestions.map((suggestion, index) => (
                  <li key={index} style={{ fontSize: '13px', marginBottom: '2px' }}>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {onRetry && (
              <button 
                className="btn" 
                onClick={onRetry}
                style={{
                  background: '#1a73e8',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  fontSize: '12px'
                }}
              >
                🔄 Try Again
              </button>
            )}
            {onDismiss && (
              <button 
                className="btn" 
                onClick={onDismiss}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                Dismiss
              </button>
            )}
            <button 
              onClick={() => setDetailsOpen(!detailsOpen)}
              style={{
                background: 'none',
                border: 'none',
                color: '#1a73e8',
                fontSize: '12px',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {detailsOpen ? 'Hide Details' : 'Show Details'}
            </button>
          </div>

          {detailsOpen && (
            <div style={{
              marginTop: '12px',
              padding: '8px',
              background: '#f7fafc',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace',
              color: '#666'
            }}>
              <strong>Technical Details:</strong><br />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Success/Info Notifications
export function NotificationToast({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onDismiss 
}) {
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        if (onDismiss) onDismiss()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onDismiss])

  const typeStyles = {
    success: { background: '#f0fff4', border: '#9ae6b4', color: '#2f855a', icon: '✅' },
    info: { background: '#ebf8ff', border: '#90cdf4', color: '#2b6cb0', icon: 'ℹ️' },
    warning: { background: '#fffaf0', border: '#f6ad55', color: '#c05621', icon: '⚠️' },
    error: { background: '#fff5f5', border: '#fed7d7', color: '#e53e3e', icon: '❌' }
  }

  const style = typeStyles[type]

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: style.background,
      border: `1px solid ${style.border}`,
      borderRadius: '8px',
      padding: '12px 16px',
      maxWidth: '400px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 10000,
      animation: 'slideInRight 0.3s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>{style.icon}</span>
        <span style={{ color: style.color, fontSize: '14px', flex: 1 }}>
          {message}
        </span>
        {onDismiss && (
          <button 
            onClick={onDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: style.color,
              cursor: 'pointer',
              fontSize: '16px',
              padding: '0 4px'
            }}
          >
            ×
          </button>
        )}
      </div>
      
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

// Data Quality Indicator
export function DataQualityBadge({ quality, freshness, count }) {
  const getQualityColor = (q) => {
    if (q >= 0.9) return { bg: '#f0fff4', color: '#2f855a', text: 'Excellent' }
    if (q >= 0.7) return { bg: '#fffaf0', color: '#c05621', text: 'Good' }
    if (q >= 0.5) return { bg: '#fff5f5', color: '#e53e3e', text: 'Fair' }
    return { bg: '#f7fafc', color: '#4a5568', text: 'Poor' }
  }

  const qualityStyle = getQualityColor(quality)

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '12px',
      padding: '4px 8px',
      borderRadius: '12px',
      background: qualityStyle.bg,
      color: qualityStyle.color,
      border: `1px solid ${qualityStyle.color}30`
    }}>
      <span>📊 {qualityStyle.text}</span>
      {count && <span>• {count} points</span>}
      {freshness && <span>• {freshness}</span>}
    </div>
  )
}