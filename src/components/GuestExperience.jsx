import React, { useState } from 'react'
import MapSelector from './MapSelector'
import Charts from './Charts'
import ResultsSummary from './ResultsSummary'
import NotificationsPanel from './NotificationsPanel'
import { fetchMeteomaticsWithFallback } from '../services/meteomatics'
import { fetchNasaPower } from '../services/nasa_power'

const GUEST_PARAMETERS = {
  temperature: { label: 'Temperature', unit: 'C', param: 't_2m:C' },
  precipitation: { label: 'Precipitation', unit: 'mm', param: 'precip_1h:mm' },
  wind_speed: { label: 'Wind Speed', unit: 'm/s', param: 'wind_speed_10m:ms' },
  humidity: { label: 'Humidity', unit: '%', param: 'relative_humidity_2m:p' }
}

export default function GuestExperience() {
  const [selection, setSelection] = useState({ lat: 35.6895, lon: 139.6917 })
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [selectedParams, setSelectedParams] = useState(['temperature', 'precipitation'])
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleQuery() {
    if (selectedParams.length === 0) {
      setError('Please select at least one parameter to visualize')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const parameters = selectedParams.map(p => GUEST_PARAMETERS[p].param).join(',')
      const datetime = `${selectedDate}T00:00:00Z/PT24H`
      
      const req = { 
        datetime, 
        parameters, 
        lat: selection.lat, 
        lon: selection.lon,
        maxRetries: 3
      }

      const res = await fetchMeteomaticsWithFallback(req)
      
      // Try to fetch NASA baseline data for comparison
      try {
        const power = await fetchNasaPower(selection.lat, selection.lon, selectedDate, selectedDate)
        res.meta = res.meta || {}
        res.meta.nasa_power = power
      } catch (e) {
        console.warn('NASA POWER fetch failed:', e)
      }

      setResults(res)
    } catch (err) {
      console.error('Query failed:', err)
      setError(err.message || 'Failed to fetch weather data')
    } finally {
      setLoading(false)
    }
  }

  function toggleParameter(param) {
    setSelectedParams(prev => 
      prev.includes(param) 
        ? prev.filter(p => p !== param)
        : [...prev, param]
    )
  }

  return (
    <div className="guest-experience">
      <div className="hero-section" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white', 
        padding: '40px 20px', 
        textAlign: 'center' 
      }}>
        <h1 style={{ fontSize: '2.5em', margin: '0 0 16px 0' }}>NASA Weather Insights</h1>
        <p style={{ fontSize: '1.2em', margin: 0, opacity: 0.9 }}>
          Explore weather data for any location worldwide. Pick a location, select a date, and visualize weather parameters.
        </p>
      </div>

      <div className="guest-layout" style={{ display: 'flex', gap: '20px', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Controls Panel */}
        <div className="guest-controls" style={{ flex: '0 0 350px', background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>Get Started</h3>
          
          {/* Location */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
              📍 Location
            </label>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
              Click on the map or drag the pin to select a location
            </p>
            <div style={{ fontSize: '14px', color: '#333' }}>
              {selection.lat.toFixed(4)}, {selection.lon.toFixed(4)}
            </div>
          </div>

          {/* Date */}
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="date-input" style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
              📅 Date
            </label>
            <input
              id="date-input"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              style={{ 
                width: '100%', 
                padding: '8px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Parameters */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
              📊 Weather Parameters
            </label>
            <div style={{ display: 'grid', gap: '8px' }}>
              {Object.entries(GUEST_PARAMETERS).map(([key, param]) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedParams.includes(key)}
                    onChange={() => toggleParameter(key)}
                    style={{ marginRight: '8px' }}
                  />
                  <span>{param.label} ({param.unit})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Query Button */}
          <button
            onClick={handleQuery}
            disabled={loading || selectedParams.length === 0}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: selectedParams.length === 0 ? '#ccc' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: selectedParams.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '🔄 Loading...' : '🚀 Get Weather Data'}
          </button>

          {/* Call to Action */}
          <div style={{ 
            marginTop: '30px', 
            padding: '16px', 
            backgroundColor: 'rgba(102, 126, 234, 0.1)', 
            borderRadius: '6px',
            border: '1px solid rgba(102, 126, 234, 0.2)'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#667eea' }}>Want More Features?</h4>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.4' }}>
              Create an account to unlock advanced features like data export, personalized dashboards, and custom alerts.
            </p>
            <button 
              className="btn"
              style={{ 
                backgroundColor: '#667eea', 
                color: 'white', 
                border: 'none',
                width: '100%',
                padding: '8px'
              }}
              onClick={() => {
                // This will be connected to the auth system
                const event = new CustomEvent('openAuth', { detail: { source: 'guest-cta' } })
                window.dispatchEvent(event)
              }}
            >
              Sign Up Now
            </button>
          </div>
        </div>

        {/* Map and Results */}
        <div className="guest-main" style={{ flex: '1' }}>
          {/* Map */}
          <div style={{ marginBottom: '20px', height: '400px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
            <MapSelector selection={selection} setSelection={setSelection} />
          </div>

          {/* Notifications */}
          <NotificationsPanel />

          {/* Results */}
          {error && (
            <div style={{ 
              padding: '16px', 
              backgroundColor: '#fee', 
              border: '1px solid #fcc', 
              borderRadius: '6px', 
              color: '#c33',
              marginBottom: '20px'
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {results && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <Charts data={results} timeRange={{ start: selectedDate, end: selectedDate }} />
              </div>
              <div>
                <ResultsSummary results={results} />
              </div>
            </div>
          )}

          {!results && !loading && !error && (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              color: '#666',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌤️</div>
              <h3 style={{ margin: '0 0 8px 0' }}>Ready to Explore Weather Data?</h3>
              <p style={{ margin: 0 }}>Select parameters above and click "Get Weather Data" to start visualizing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}