import React, { useState, useEffect } from 'react'
import MapSelector from './MapSelector'
import ControlPanel from './ControlPanel'
import Charts from './Charts'
import ResultsSummary from './ResultsSummary'
import ExportPanel from './ExportPanel'
import NotificationsPanel from './NotificationsPanel'
import ProfilePanel from './ProfilePanel'

const USE_CASE_CONFIGS = {
  agriculture: {
    title: '🌾 Agricultural Dashboard',
    description: 'Monitor weather conditions for crop planning and farm management',
    defaultParams: ['temperature', 'precipitation', 'humidity', 'wind_speed'],
    quickActions: ['Check Growing Conditions', 'Irrigation Planning', 'Harvest Weather'],
    widgets: ['weather_summary', 'alerts', 'detailed_charts', 'export_features']
  },
  outdoor: {
    title: '🏃 Outdoor Activities Hub',
    description: 'Plan your outdoor adventures with accurate weather insights',
    defaultParams: ['temperature', 'precipitation', 'wind_speed', 'cloud_cover'],
    quickActions: ['Weekend Forecast', 'Activity Planning', 'Safety Alerts'],
    widgets: ['quick_overview', 'detailed_charts', 'alert_center', 'favorites']
  },
  energy: {
    title: '⚡ Energy & Utilities Center',
    description: 'Optimize energy production and consumption with weather data',
    defaultParams: ['solar_radiation', 'wind_speed', 'temperature', 'cloud_cover'],
    quickActions: ['Solar Forecast', 'Wind Conditions', 'Load Prediction'],
    widgets: ['detailed_charts', 'comparison_tools', 'export_features', 'alerts']
  },
  research: {
    title: '🔬 Research Dashboard',
    description: 'Advanced weather analytics for scientific research',
    defaultParams: ['temperature', 'precipitation', 'pressure', 'humidity', 'wind_speed'],
    quickActions: ['Data Analysis', 'Historical Trends', 'Export Dataset'],
    widgets: ['detailed_charts', 'comparison_tools', 'export_features', 'quick_overview']
  },
  aviation: {
    title: '✈️ Aviation Weather Center',
    description: 'Critical weather information for flight operations',
    defaultParams: ['wind_speed', 'pressure', 'visibility', 'temperature'],
    quickActions: ['Flight Safety Check', 'Wind Analysis', 'Visibility Report'],
    widgets: ['alerts', 'detailed_charts', 'quick_overview', 'export_features']
  },
  other: {
    title: '📊 Weather Monitoring',
    description: 'Customizable weather dashboard for various applications',
    defaultParams: ['temperature', 'precipitation', 'wind_speed'],
    quickActions: ['Current Conditions', 'Forecast', 'Historical Data'],
    widgets: ['quick_overview', 'detailed_charts', 'favorites', 'export_features']
  }
}

const EXPERIENCE_LEVEL_FEATURES = {
  beginner: {
    layout: 'simplified',
    helpText: true,
    presets: true,
    advancedControls: false
  },
  intermediate: {
    layout: 'standard',
    helpText: false,
    presets: true,
    advancedControls: true
  },
  advanced: {
    layout: 'compact',
    helpText: false,
    presets: false,
    advancedControls: true
  }
}

export default function PersonalizedDashboard({ user, setUser }) {
  const [selection, setSelection] = useState({ lat: 35.6895, lon: 139.6917 })
  const [timeRange, setTimeRange] = useState({ start: '2025-07-01', end: '2025-07-31' })
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [thresholds, setThresholds] = useState({ hot: 35, cold: 0, wet: 10, windy: 15 })
  const [selectedPreset, setSelectedPreset] = useState('')

  const userPrefs = user?.preferences || {}
  const useCase = userPrefs.useCase || 'other'
  const experienceLevel = userPrefs.experienceLevel || 'beginner'
  const dashboardPreferences = userPrefs.dashboardPreferences || []
  
  const config = USE_CASE_CONFIGS[useCase]
  const layoutFeatures = EXPERIENCE_LEVEL_FEATURES[experienceLevel]

  // Set up default location based on user region if available
  useEffect(() => {
    if (userPrefs.region && !selection.customSet) {
      // You could add geocoding for user's preferred region here
      // For now, we'll keep the default location
    }
  }, [userPrefs.region, selection.customSet])

  function handleQuickAction(action) {
    const actionMap = {
      'Check Growing Conditions': () => {
        setTimeRange({ 
          start: new Date().toISOString().split('T')[0], 
          end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
        })
      },
      'Weekend Forecast': () => {
        const friday = new Date()
        friday.setDate(friday.getDate() + (5 - friday.getDay() + 7) % 7)
        const sunday = new Date(friday)
        sunday.setDate(sunday.getDate() + 2)
        setTimeRange({
          start: friday.toISOString().split('T')[0],
          end: sunday.toISOString().split('T')[0]
        })
      },
      'Current Conditions': () => {
        const today = new Date().toISOString().split('T')[0]
        setTimeRange({ start: today, end: today })
      }
    }
    
    if (actionMap[action]) {
      actionMap[action]()
    }
  }

  function renderWidget(widgetType) {
    switch (widgetType) {
      case 'quick_overview':
        return (
          <div key="overview" style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '8px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '20px' 
          }}>
            <h3 style={{ margin: '0 0 16px 0' }}>📊 Quick Overview</h3>
            {results ? (
              <ResultsSummary results={results} />
            ) : (
              <p style={{ color: '#666' }}>Run a query to see weather summary</p>
            )}
          </div>
        )
      
      case 'detailed_charts':
        return (
          <div key="charts" style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '8px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '20px' 
          }}>
            <h3 style={{ margin: '0 0 16px 0' }}>📈 Detailed Charts</h3>
            {results ? (
              <Charts data={results} timeRange={timeRange} />
            ) : (
              <p style={{ color: '#666' }}>No data to display. Run a query to see charts.</p>
            )}
          </div>
        )
      
      case 'alert_center':
        return (
          <div key="alerts" style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '8px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '20px' 
          }}>
            <h3 style={{ margin: '0 0 16px 0' }}>🚨 Alert Center</h3>
            <NotificationsPanel />
          </div>
        )
      
      case 'export_features':
        return (
          <div key="export" style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '8px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '20px' 
          }}>
            <h3 style={{ margin: '0 0 16px 0' }}>📥 Export & Download</h3>
            <ExportPanel data={results} user={user} />
          </div>
        )
      
      case 'favorites':
        return (
          <div key="favorites" style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '8px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '20px' 
          }}>
            <h3 style={{ margin: '0 0 16px 0' }}>⭐ Saved Locations</h3>
            <p style={{ color: '#666' }}>Feature coming soon - save your favorite locations for quick access</p>
          </div>
        )
      
      case 'comparison_tools':
        return (
          <div key="comparison" style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '8px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '20px' 
          }}>
            <h3 style={{ margin: '0 0 16px 0' }}>🔍 Comparison Tools</h3>
            <p style={{ color: '#666' }}>Feature coming soon - compare weather data across locations and time periods</p>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="personalized-dashboard">
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white', 
        padding: '24px 20px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '1.8em', margin: '0 0 8px 0' }}>{config.title}</h1>
            <p style={{ margin: 0, opacity: 0.9 }}>{config.description}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>Welcome back,</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{user?.email?.split('@')[0]}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ backgroundColor: '#f8f9fa', padding: '16px 20px', borderBottom: '1px solid #e9ecef' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {config.quickActions.map(action => (
              <button
                key={action}
                onClick={() => handleQuickAction(action)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#667eea'
                  e.target.style.color = 'white'
                  e.target.style.borderColor = '#667eea'
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'white'
                  e.target.style.color = 'black'
                  e.target.style.borderColor = '#ddd'
                }}
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          
          {/* Controls Sidebar */}
          <div style={{ flex: '0 0 350px' }}>
            <div style={{ 
              background: 'white', 
              borderRadius: '8px', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              marginBottom: '20px'
            }}>
              <ProfilePanel user={user} setUser={setUser} />
            </div>
            
            <div style={{ 
              background: 'white', 
              borderRadius: '8px', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <ControlPanel
                selection={selection}
                setSelection={setSelection}
                timeRange={timeRange}
                setTimeRange={setTimeRange}
                setResults={setResults}
                setLoading={setLoading}
                setError={setError}
                thresholds={thresholds}
                setThresholds={setThresholds}
                user={user}
                setUser={setUser}
                onApplyPreset={p => setSelectedPreset(p)}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div style={{ flex: '1' }}>
            {/* Map */}
            <div style={{ 
              marginBottom: '20px', 
              height: '300px', 
              borderRadius: '8px', 
              overflow: 'hidden',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <MapSelector selection={selection} setSelection={setSelection} />
            </div>

            {/* Personalized Widgets */}
            <div className="dashboard-widgets">
              {dashboardPreferences.length > 0 ? (
                dashboardPreferences.map(widget => renderWidget(widget))
              ) : (
                config.widgets.map(widget => renderWidget(widget))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}