import React, { useState, useEffect } from 'react'
import { fetchMeteomaticsWithFallback } from '../services/meteomatics'
import { geocodeNominatim } from '../services/geocode'
import { fetchNasaPowerNormalized } from '../services/nasa_power'
import { fetchNasaData } from '../services/nasa_enhanced'
import { METEO_PARAMS, paramTokenToKey, PRESETS, USECASE_PARAMS } from '../services/meteomatics_params'
import { generateSmartRecommendations } from '../services/smart_recommendations'
import { LoadingIndicator, ErrorDisplay, NotificationToast } from './UserFeedback'
import ResultsSummary from './ResultsSummary'
import VoiceInput from './VoiceInput'
import NasaDataSelector from './NasaDataSelector'
import QuickStartTemplates from './QuickStartTemplates'

export default function ControlPanel({ selection, setSelection, timeRange, setTimeRange, setResults, setLoading, setError, thresholds, setThresholds, user, onApplyPreset, onMetadataReceived }) {
  // allow optional setUser prop for persisting preset selections
  const setUser = arguments[0].setUser
  const [place, setPlace] = useState('Tokyo')
  // Support persisted preferences where variables may be an object (internal keys) or
  // an array of human-friendly labels we persisted from ProfilePanel. Map labels back to keys.
  let userVars = null
  if (user && user.preferences && user.preferences.variables) {
    if (Array.isArray(user.preferences.variables)) {
      // array of labels -> convert to variables object
      const lbls = user.preferences.variables
      const mapped = {}
      Object.keys(METEO_PARAMS).forEach(k => { mapped[k] = lbls.includes(METEO_PARAMS[k].label) })
      userVars = mapped
    } else {
      userVars = user.preferences.variables
    }
  }
  const defaultVars = userVars || { temperature: true, precipitation: false, wind: false, humidity: false, cloud_cover: false, pressure: false, solar_radiation: false }
  const [variables, setVariables] = useState(defaultVars)
  const [mode, setMode] = useState('range') // 'range' or 'single'
  const [selectedPreset, setSelectedPreset] = useState('')
  const [presetTokensVisible, setPresetTokensVisible] = useState(false)
  const [presetParamTokens, setPresetParamTokens] = useState({}) // token => checked
  
  // NASA-specific state
  const [nasaEnabled, setNasaEnabled] = useState(true)
  const [selectedNasaSources, setSelectedNasaSources] = useState(['power'])
  const [selectedNasaParameters, setSelectedNasaParameters] = useState(['power_T2M', 'power_PRECTOTCORR'])
  const [nasaSelectorVisible, setNasaSelectorVisible] = useState(false)
  
  // Enhanced user experience state
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStage, setLoadingStage] = useState('')
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [recommendations, setRecommendations] = useState(null)
  const [notification, setNotification] = useState(null)
  const [showQuickStart, setShowQuickStart] = useState(false)
  const [validationErrors, setValidationErrors] = useState([])
  
  const loadingSteps = [
    'Validating parameters...',
    'Fetching Meteomatics data...',
    'Requesting NASA data...',
    'Processing results...',
    'Generating visualizations...'
  ]
  useEffect(() => {
    try {
      // check search params first
      const sp = new URLSearchParams(window.location.search)
      const p = sp.get('preset') || (window.location.hash && window.location.hash.replace('#preset=', ''))
      if (p && PRESETS[p]) {
        setSelectedPreset(p)
        if (onApplyPreset) onApplyPreset(p)
        const keys = PRESETS[p] || []
        const newVars = { ...variables }
        Object.keys(newVars).forEach(k => newVars[k] = keys.includes(k))
        setVariables(newVars)
        // load any persisted preset selections (friendly labels) for this user and preset
        try {
          const saved = user && user.preferences && user.preferences.presetSelections && user.preferences.presetSelections[p]
          if (saved && Array.isArray(saved)) {
            const init = {}
            (USECASE_PARAMS[p] || []).forEach(t => {
              // map saved labels to tokens using METEO_PARAMS labels
              const key = paramTokenToKey(t)
              const label = key && METEO_PARAMS[key] ? METEO_PARAMS[key].label : t
              init[t] = saved.includes(label)
            })
            setPresetParamTokens(init)
            setPresetTokensVisible(true)
          }
        } catch (e) { /* ignore */ }
      }
    } catch (e) {
      // ignore
    }
  }, [])
  // remove UI credential inputs; use environment variables only
  const username = import.meta.env.VITE_METEO_USER || ''
  const password = import.meta.env.VITE_METEO_PASSWORD || ''
  const [omittedParams, setOmittedParams] = useState([])

  // When omitted parameters change, ensure presetParamTokens reflect that (disable/uncheck)
  useEffect(() => {
    if (!omittedParams || Object.keys(presetParamTokens).length === 0) return
    const newTokens = { ...presetParamTokens }
    let changed = false
    omittedParams.forEach(p => {
      // some omitted tokens may be returned without unit; mark any matching token or suffix as omitted
      Object.keys(newTokens).forEach(t => {
        if (t === p || t.endsWith(p) || p.endsWith(t)) {
          if (newTokens[t]) changed = true
          newTokens[t] = false
        }
      })
    })
    if (changed) setPresetParamTokens(newTokens)
  }, [omittedParams])

  async function onQuery() {
    // Enhanced validation
    const validationErrors = []
    
    // Build request and call Meteomatics
    const paramsList = Object.keys(variables).filter(k => variables[k]).map(k => {
      return (METEO_PARAMS[k] && METEO_PARAMS[k].code) ? METEO_PARAMS[k].code : k
    })
    // include any checked tokens from the selected preset
    const checkedPresetTokens = Object.keys(presetParamTokens).filter(t => presetParamTokens[t])
    checkedPresetTokens.forEach(t => {
      if (!paramsList.includes(t)) paramsList.push(t)
    })
    
    // Enhanced validation
    if (paramsList.length === 0 && (!nasaEnabled || selectedNasaParameters.length === 0)) {
      validationErrors.push('Please select at least one parameter from Meteomatics or NASA data sources')
    }
    
    if (Math.abs(selection.lat) > 90 || Math.abs(selection.lon) > 180) {
      validationErrors.push('Invalid coordinates. Latitude must be between -90° and 90°, longitude between -180° and 180°')
    }
    
    const startDate = new Date(timeRange.start)
    const endDate = new Date(timeRange.end)
    if (startDate > endDate) {
      validationErrors.push('Start date must be before or equal to end date')
    }
    
    if (validationErrors.length > 0) {
      setValidationErrors(validationErrors)
      setError(validationErrors.join('; '))
      return
    }
    
    setValidationErrors([])

    const parameters = paramsList.join(',')
    let datetime = ''
    if (mode === 'single') {
      // Use a single-date format Meteomatics accepts (instant / 24h slice)
      datetime = `${timeRange.start}T00:00:00Z/PT24H`
    } else {
      datetime = `${timeRange.start}T00:00:00Z--${timeRange.end}T00:00:00Z:PT24H`
    }

    const req = { datetime, parameters, lat: selection.lat, lon: selection.lon }

    // Basic validation: ensure parameter keys look like expected tokens (no spaces)
    const invalid = paramsList.filter(p => /\s/.test(p) || p.length === 0)
    if (invalid.length > 0) {
      setError('Invalid parameter names: ' + invalid.join(', '))
      return
    }

    setIsLoading(true)
    setLoading(true)  // Update parent state
    setError(null)
    setLoadingProgress(0)
    setLoadingStage(loadingSteps[0])
    
    // compute encoded URL for debugging
    let debugUrl = ''
    try {
      const encDatetime = encodeURIComponent(datetime)
      const encParameters = paramsList.map(p => encodeURIComponent(p)).join(',')
      debugUrl = `https://api.meteomatics.com/${encDatetime}/${encParameters}/${selection.lat},${selection.lon}/json`
    } catch (e) {
      // ignore
    }
    
    setLoadingProgress(20)

    try {
      const user = username || import.meta.env.VITE_METEO_USER
      const pass = password || import.meta.env.VITE_METEO_PASSWORD

      if (!user || !pass) {
        throw new Error('Meteomatics credentials missing. Provide username/password in the form or set VITE_METEO_USER/VITE_METEO_PASSWORD in a local .env')
      }

      setLoadingStage(loadingSteps[1])
      setLoadingProgress(40)
      
      const res = await fetchMeteomaticsWithFallback({ ...req, username: user, password: pass, maxRetries: 3 })

      setLoadingProgress(60)
      
      // Fetch NASA data if enabled
      if (nasaEnabled && selectedNasaSources.length > 0) {
        try {
          setLoadingStage(loadingSteps[2])
          setLoadingProgress(70)
          
          // Convert selected parameters to simple parameter list
          const nasaParams = selectedNasaParameters.map(p => p.split('_')[1]).filter(Boolean)
          
          const nasaData = await fetchNasaData({
            lat: selection.lat, 
            lon: selection.lon, 
            startDate: timeRange.start, 
            endDate: timeRange.end,
            parameters: nasaParams,
            sources: selectedNasaSources
          })
          
          // Attach NASA data to results
          res.meta = res.meta || {}
          res.meta.nasa_data = nasaData
          
          setNotification({
            message: `Successfully fetched data from ${selectedNasaSources.length} NASA source(s)`,
            type: 'success'
          })
        } catch (e) {
          console.warn('NASA data fetch failed:', e)
          res.meta = res.meta || {}
          res.meta.nasa_error = e.message
          
          setNotification({
            message: `NASA data partially failed: ${e.message}`,
            type: 'warning'
          })
        }
      }      setLoadingStage(loadingSteps[3])
      setLoadingProgress(90)
      
      setResults(res)
      setLastDebug({ url: debugUrl, response: res, error: null })
      const dropped = (res && res.meta && res.meta.droppedParameters) ? res.meta.droppedParameters : []
      setOmittedParams(dropped)
      
      // Pass comprehensive metadata to the parent component for visualization
      if (onMetadataReceived && res) {
        const metadata = {
          request_url: debugUrl,
          droppedParameters: dropped,
          nasa_data: res.meta?.nasa_data,
          timestamp: new Date().toISOString(),
          location: { lat: selection.lat, lon: selection.lon },
          time_range: timeRange,
          meteomatics_response: res
        }
        onMetadataReceived(metadata)
      }
      
      setLoadingStage(loadingSteps[4])
      setLoadingProgress(100)
      
      // Generate recommendations for next query
      const newRecommendations = generateSmartRecommendations({
        lat: selection.lat,
        lon: selection.lon,
        startDate: timeRange.start,
        endDate: timeRange.end,
        currentSources: selectedNasaSources,
        currentParameters: selectedNasaParameters
      })
      setRecommendations(newRecommendations)
      
      if (!notification || notification.type !== 'warning') {
        setNotification({
          message: 'Data successfully retrieved and visualized!',
          type: 'success'
        })
      }
    } catch (err) {
      console.error('Query failed:', err)
      const errorMessage = err.message || String(err)
      setError(errorMessage)
      setLastDebug({ url: debugUrl, response: null, error: String(err) })
      
      // Generate error-specific suggestions
      const suggestions = []
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        suggestions.push('Check your internet connection')
        suggestions.push('Try again in a few moments')
      }
      if (errorMessage.includes('credentials')) {
        suggestions.push('Verify your Meteomatics API credentials')
        suggestions.push('Check environment variables VITE_METEO_USER and VITE_METEO_PASSWORD')
      }
      if (errorMessage.includes('parameter')) {
        suggestions.push('Try selecting fewer parameters')
        suggestions.push('Check if parameters are available for your location and time range')
      }
      
      setNotification({
        message: 'Query failed. See error details below.',
        type: 'error'
      })
    } finally {
      setIsLoading(false)
      setLoading(false)  // Update parent state
      setLoadingStage('')
      setLoadingProgress(0)
    }
  }

  async function onGeocode() {
    try {
      const r = await geocodeNominatim(place, 3)
      if (r && r.length > 0) setSelection({ lat: parseFloat(r[0].lat), lon: parseFloat(r[0].lon) })
    } catch (e) {
      console.error(e)
    }
  }

  // Autocomplete suggestions for place input
  const [suggestions, setSuggestions] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  // Debug state for last request
  const [lastDebug, setLastDebug] = useState(null)

  async function doSuggest(q) {
    if (!q || q.length < 2) return setSuggestions([])
    setSearchLoading(true)
    try {
      const res = await geocodeNominatim(q, 6)
      setSuggestions(res || [])
    } catch (e) {
      console.error(e)
      setSuggestions([])
    } finally {
      setSearchLoading(false)
    }
  }

  function selectSuggestion(r) {
    const lat = parseFloat(r.lat)
    const lon = parseFloat(r.lon)
    setSelection({ lat, lon })
    setSuggestions([])
    setPlace(r.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`)
  }

  function paramToVarKey(param) {
    if (!param) return null
    const p = param.split(':')[0]
    if (p.startsWith('t_2m')) return 'temperature'
    if (p.startsWith('precip')) return 'precipitation'
    if (p.startsWith('wind_speed')) return 'wind'
    if (p.startsWith('relative_humidity')) return 'humidity'
    if (p.startsWith('cloud_cover')) return 'cloud_cover'
    if (p.startsWith('mean_sea_level_pressure')) return 'pressure'
    if (p.startsWith('shortwave_radiation_flux_density')) return 'solar_radiation'
    return null
  }

  function removeOmittedFromSelection() {
    if (!omittedParams || omittedParams.length === 0) return
    const newVars = { ...variables }
    omittedParams.forEach(p => {
      const k = paramToVarKey(p)
      if (k && newVars[k]) newVars[k] = false
    })
    setVariables(newVars)
    setOmittedParams([])
  }

  function removeOmittedFromPresetTokens() {
    if (!omittedParams || omittedParams.length === 0) return
    const newTokens = { ...presetParamTokens }
    omittedParams.forEach(p => {
      Object.keys(newTokens).forEach(t => {
        if (t === p || t.endsWith(p) || p.endsWith(t)) {
          delete newTokens[t]
        }
      })
    })
    setPresetParamTokens(newTokens)
    setOmittedParams([])
  }
  
  // Template application handler
  function handleApplyTemplate(templateConfig) {
    // Apply template configuration
    setSelectedNasaSources(templateConfig.sources)
    setSelectedNasaParameters(templateConfig.parameters)
    setTimeRange({
      start: templateConfig.startDate,
      end: templateConfig.endDate
    })
    setNasaEnabled(true)
    setShowQuickStart(false)
    
    setNotification({
      message: `Applied template: ${templateConfig.name}`,
      type: 'success'
    })
  }

  return (
    <div>
      <div className="control-section">
        <label>Use-case presets</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select className="input" value={selectedPreset} onChange={e => setSelectedPreset(e.target.value)}>
            <option value="">-- choose preset --</option>
            {Object.keys(PRESETS).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <button className="btn" onClick={() => {
            if (!selectedPreset) return
            const keys = PRESETS[selectedPreset] || []
            // build new variables state toggling keys that exist in METEO_PARAMS
            const newVars = { ...variables }
            Object.keys(newVars).forEach(k => newVars[k] = keys.includes(k))
            setVariables(newVars)
            if (onApplyPreset) onApplyPreset(selectedPreset)
          }}>Apply</button>
          <button className="btn" onClick={() => {
            // toggle token list visibility
            if (!selectedPreset) return
            const tokens = USECASE_PARAMS[selectedPreset] || []
            const init = {}
            tokens.forEach(t => init[t] = presetParamTokens[t] === undefined ? true : presetParamTokens[t])
            setPresetParamTokens(init)
            setPresetTokensVisible(!presetTokensVisible)
          }}>{presetTokensVisible ? 'Hide preset params' : 'Show preset params'}</button>
          {presetTokensVisible && user && setUser && (
            <button className="btn" style={{ marginLeft: 8 }} onClick={() => {
              // persist current preset selections as friendly labels into user.preferences.presetSelections[preset]
              try {
                const checked = Object.keys(presetParamTokens).filter(t => presetParamTokens[t])
                const labels = checked.map(t => {
                  const k = paramTokenToKey(t)
                  return k && METEO_PARAMS[k] ? METEO_PARAMS[k].label : t
                })
                const prefs = user.preferences || {}
                const ps = prefs.presetSelections || {}
                ps[selectedPreset] = labels
                const updatedPrefs = { ...prefs, presetSelections: ps }
                const updatedUser = { ...user, preferences: updatedPrefs }
                setUser(updatedUser)
                try { localStorage.setItem('user', JSON.stringify(updatedUser)) } catch (e) {}
              } catch (e) {}
            }}>Save preset selections</button>
          )}
        </div>
      </div>
      {presetTokensVisible && selectedPreset && (
        <div className="control-section">
          <label>{selectedPreset} parameters</label>
          <div style={{ maxHeight: 220, overflow: 'auto', padding: 6, border: '1px solid #eee', background: '#fff' }}>
            {(USECASE_PARAMS[selectedPreset] || []).map(t => {
              // display human-friendly label when available
              const k = paramTokenToKey(t)
              const param = k && METEO_PARAMS[k] ? METEO_PARAMS[k] : null
              const label = param ? `${param.label} (${t})` : t
              const isOmitted = omittedParams && omittedParams.some(p => p === t || t.endsWith(p) || p.endsWith(t))
              return (
                <div key={t} style={{ opacity: isOmitted ? 0.5 : 1, position: 'relative', marginBottom: 4 }}>
                  <label style={{ cursor: 'pointer', position: 'relative' }}>
                    <input type="checkbox" disabled={isOmitted} checked={!!presetParamTokens[t]} onChange={e => setPresetParamTokens(prev => ({ ...prev, [t]: e.target.checked }))} /> {label}{isOmitted ? ' (omitted)' : ''}
                    {param && (
                      <span
                        style={{
                          marginLeft: 8,
                          color: '#1e90ff',
                          textDecoration: 'underline dotted',
                          cursor: 'help',
                          position: 'relative'
                        }}
                        tabIndex={0}
                        onMouseEnter={e => {
                          const card = e.currentTarget.nextSibling
                          if (card) card.style.display = 'block'
                        }}
                        onMouseLeave={e => {
                          const card = e.currentTarget.nextSibling
                          if (card) card.style.display = 'none'
                        }}
                        onFocus={e => {
                          const card = e.currentTarget.nextSibling
                          if (card) card.style.display = 'block'
                        }}
                        onBlur={e => {
                          const card = e.currentTarget.nextSibling
                          if (card) card.style.display = 'none'
                        }}
                        aria-label={`Info about ${param.label}`}
                      >&#9432;</span>
                    )}
                    {param && (
                      <span
                        style={{
                          display: 'none',
                          position: 'absolute',
                          left: '2em',
                          top: '1.5em',
                          zIndex: 10,
                          background: '#f8fafd',
                          color: '#222',
                          border: '1px solid #cce',
                          borderRadius: 6,
                          padding: '8px 12px',
                          minWidth: 220,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}
                        role="tooltip"
                      >
                        <strong>{param.label}</strong><br />
                        <span style={{ color: '#555', fontSize: 13 }}>{param.unit}</span><br />
                        <span style={{ fontSize: 13 }}>{param.description}</span>
                      </span>
                    )}
                  </label>
                </div>
              )
            })}
          </div>
        </div>
      )}
      <script dangerouslySetInnerHTML={{ __html: `// preset helper - handled in React; fallback for static README links` }} />
      <div style={{ marginBottom: 8 }} />
      {/* Credentials are not editable in the UI */}
      <div className="control-section">
        <label>Search place</label>
        <input className="input" value={place} onChange={e => { setPlace(e.target.value); doSuggest(e.target.value) }} />
        <VoiceInput onResult={txt => { setPlace(txt); doSuggest(txt) }} />
        {suggestions.length > 0 && (
          <div style={{ maxHeight: 160, overflow: 'auto', border: '1px solid #eee', marginTop: 6, background: '#fff' }}>
            {suggestions.map(s => (
              <div key={s.place_id} onClick={() => selectSuggestion(s)} style={{ padding: 6, cursor: 'pointer', borderBottom: '1px solid #fafafa' }}>{s.display_name}</div>
            ))}
          </div>
        )}
        <button className="btn" style={{ marginTop: 8 }} onClick={onGeocode}>Geocode (Nominatim)</button>
      </div>

      <div className="control-section">
        <label>Time</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <label><input type="radio" name="mode" value="single" checked={mode === 'single'} onChange={() => setMode('single')} /> Single date</label>
          <label><input type="radio" name="mode" value="range" checked={mode === 'range'} onChange={() => setMode('range')} /> Range</label>
        </div>
        {mode === 'single' ? (
          <input className="input" type="date" value={timeRange.start} onChange={e => setTimeRange({ ...timeRange, start: e.target.value, end: e.target.value })} />
        ) : (
          <>
            <input className="input" type="date" value={timeRange.start} onChange={e => setTimeRange({ ...timeRange, start: e.target.value })} />
            <input className="input" type="date" value={timeRange.end} onChange={e => setTimeRange({ ...timeRange, end: e.target.value })} />
          </>
        )}
      </div>

      <div className="control-section">
        <label>Variables</label>
        <div>
          <label><input type="checkbox" checked={variables.temperature} onChange={e => setVariables({ ...variables, temperature: e.target.checked })} /> Temperature</label>
        </div>
        <div>
          <label><input type="checkbox" checked={variables.precipitation} onChange={e => setVariables({ ...variables, precipitation: e.target.checked })} /> Precipitation</label>
        </div>
        <div>
          <label><input type="checkbox" checked={variables.wind} onChange={e => setVariables({ ...variables, wind: e.target.checked })} /> Windspeed</label>
        </div>
        <div>
          <label><input type="checkbox" checked={variables.humidity} onChange={e => setVariables({ ...variables, humidity: e.target.checked })} /> Humidity</label>
        </div>
        <div>
          <label><input type="checkbox" checked={variables.cloud_cover} onChange={e => setVariables({ ...variables, cloud_cover: e.target.checked })} /> Cloud cover</label>
        </div>
        <div>
          <label><input type="checkbox" checked={variables.pressure} onChange={e => setVariables({ ...variables, pressure: e.target.checked })} /> Pressure</label>
        </div>
        <div>
          <label><input type="checkbox" checked={variables.solar_radiation} onChange={e => setVariables({ ...variables, solar_radiation: e.target.checked })} /> Solar radiation</label>
        </div>
      </div>

      <div className="control-section">
        <label>Thresholds (for summary)</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <div>
            <small>Hot (°C)</small>
            <input className="input" type="number" value={thresholds.hot} onChange={e => setThresholds({ ...thresholds, hot: Number(e.target.value) })} />
          </div>
          <div>
            <small>Cold (°C)</small>
            <input className="input" type="number" value={thresholds.cold} onChange={e => setThresholds({ ...thresholds, cold: Number(e.target.value) })} />
          </div>
          <div>
            <small>Wet (mm)</small>
            <input className="input" type="number" value={thresholds.wet} onChange={e => setThresholds({ ...thresholds, wet: Number(e.target.value) })} />
          </div>
          <div>
            <small>Windy (m/s)</small>
            <input className="input" type="number" value={thresholds.windy} onChange={e => setThresholds({ ...thresholds, windy: Number(e.target.value) })} />
          </div>
        </div>
      </div>

      {/* Quick Start Templates */}
      <div className="control-section">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <button 
            className="btn" 
            onClick={() => setShowQuickStart(!showQuickStart)}
            style={{ background: showQuickStart ? '#1a73e8' : '#f8f9fa', color: showQuickStart ? 'white' : '#333' }}
          >
            🚀 Quick Start Templates
          </button>
          <button 
            className="btn" 
            onClick={() => {
              const recs = generateSmartRecommendations({
                lat: selection.lat,
                lon: selection.lon,
                startDate: timeRange.start,
                endDate: timeRange.end,
                currentSources: selectedNasaSources,
                currentParameters: selectedNasaParameters
              })
              setRecommendations(recs)
              setShowRecommendations(!showRecommendations)
            }}
            style={{ background: showRecommendations ? '#ff9f40' : '#f8f9fa', color: showRecommendations ? 'white' : '#333' }}
          >
            💡 Smart Recommendations
          </button>
        </div>
      </div>
      
      {showQuickStart && (
        <QuickStartTemplates 
          onApplyTemplate={handleApplyTemplate}
          currentLocation={selection}
          onLocationChange={setSelection}
        />
      )}
      
      {/* Smart Recommendations */}
      {showRecommendations && recommendations && (
        <div className="control-section">
          <div style={{ background: '#fff8e1', border: '1px solid #ffe08a', borderRadius: 6, padding: 12 }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#c05621' }}>💡 Smart Recommendations</h4>
            
            {recommendations.suggested_parameters.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <strong style={{ fontSize: 13 }}>Suggested Parameters:</strong>
                <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {recommendations.suggested_parameters.map(param => (
                    <button 
                      key={param}
                      className="btn"
                      onClick={() => {
                        if (!selectedNasaParameters.includes(param)) {
                          setSelectedNasaParameters([...selectedNasaParameters, param])
                        }
                      }}
                      style={{
                        fontSize: 11,
                        padding: '4px 8px',
                        background: selectedNasaParameters.includes(param) ? '#e8f5e8' : '#f8f9fa'
                      }}
                    >
                      {param.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {recommendations.reasons.length > 0 && (
              <div style={{ fontSize: 12, color: '#666' }}>
                <strong>Why these suggestions:</strong>
                <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                  {recommendations.reasons.slice(0, 3).map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <ErrorDisplay 
          error={validationErrors.join('; ')}
          suggestions={[
            'Check your parameter selections',
            'Verify date range and coordinates',
            'Try using fewer parameters'
          ]}
          onDismiss={() => setValidationErrors([])}
        />
      )}

      <div className="control-section">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>NASA Data Integration</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input 
              type="checkbox" 
              checked={nasaEnabled} 
              onChange={e => setNasaEnabled(e.target.checked)}
            />
            Enable NASA Data Sources
          </label>
          {nasaEnabled && (
            <button 
              className="btn" 
              onClick={() => setNasaSelectorVisible(!nasaSelectorVisible)}
              style={{ fontSize: 12, padding: '4px 8px' }}
            >
              {nasaSelectorVisible ? 'Hide' : 'Configure'} NASA Sources
            </button>
          )}
        </div>
        
        {nasaEnabled && selectedNasaSources.length > 0 && (
          <div style={{ 
            fontSize: 12, 
            color: '#666', 
            marginBottom: 12,
            padding: 8,
            background: '#f0f8ff',
            borderRadius: 4
          }}>
            <strong>NASA Sources:</strong> {selectedNasaSources.join(', ')}<br/>
            <strong>Parameters:</strong> {selectedNasaParameters.length} selected
          </div>
        )}
      </div>
      
      {nasaEnabled && nasaSelectorVisible && (
        <NasaDataSelector
          selectedSources={selectedNasaSources}
          onSourcesChange={setSelectedNasaSources}
          selectedParameters={selectedNasaParameters}
          onParametersChange={setSelectedNasaParameters}
        />
      )}

      {/* Quick Start Templates */}
      <div className="control-section">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <button 
            className="btn" 
            onClick={() => setShowQuickStart(!showQuickStart)}
            style={{ background: showQuickStart ? '#1a73e8' : '#f8f9fa', color: showQuickStart ? 'white' : '#333' }}
          >
            🚀 Quick Start Templates
          </button>
          <button 
            className="btn" 
            onClick={() => {
              const recs = generateSmartRecommendations({
                lat: selection.lat,
                lon: selection.lon,
                startDate: timeRange.start,
                endDate: timeRange.end,
                currentSources: selectedNasaSources,
                currentParameters: selectedNasaParameters
              })
              setRecommendations(recs)
              setShowRecommendations(!showRecommendations)
            }}
            style={{ background: showRecommendations ? '#ff9f40' : '#f8f9fa', color: showRecommendations ? 'white' : '#333' }}
          >
            💡 Smart Recommendations
          </button>
        </div>
      </div>
      
      {showQuickStart && (
        <QuickStartTemplates 
          onApplyTemplate={handleApplyTemplate}
          currentLocation={selection}
          onLocationChange={setSelection}
        />
      )}
      
      {/* Smart Recommendations */}
      {showRecommendations && recommendations && (
        <div className="control-section">
          <div style={{ background: '#fff8e1', border: '1px solid #ffe08a', borderRadius: 6, padding: 12 }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#c05621' }}>💡 Smart Recommendations</h4>
            
            {recommendations.suggested_parameters.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <strong style={{ fontSize: 13 }}>Suggested Parameters:</strong>
                <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {recommendations.suggested_parameters.map(param => (
                    <button 
                      key={param}
                      className="btn"
                      onClick={() => {
                        if (!selectedNasaParameters.includes(param)) {
                          setSelectedNasaParameters([...selectedNasaParameters, param])
                        }
                      }}
                      style={{
                        fontSize: 11,
                        padding: '4px 8px',
                        background: selectedNasaParameters.includes(param) ? '#e8f5e8' : '#f8f9fa'
                      }}
                    >
                      {param.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {recommendations.reasons.length > 0 && (
              <div style={{ fontSize: 12, color: '#666' }}>
                <strong>Why these suggestions:</strong>
                <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                  {recommendations.reasons.slice(0, 3).map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <ErrorDisplay 
          error={validationErrors.join('; ')}
          suggestions={[
            'Check your parameter selections',
            'Verify date range and coordinates',
            'Try using fewer parameters'
          ]}
          onDismiss={() => setValidationErrors([])}
        />
      )}

      <div className="control-section">
        <button 
          className="btn" 
          onClick={onQuery}
          disabled={isLoading}
          style={{
            background: isLoading ? '#ccc' : '#1a73e8',
            color: 'white',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {isLoading ? '⏳ Processing...' : '🚀 Run Query (Meteomatics + NASA)'}
        </button>
      </div>
      
      {/* Loading Indicator */}
      <LoadingIndicator 
        isLoading={isLoading}
        stage={loadingStage}
        progress={loadingProgress}
        showProgress={true}
        steps={loadingSteps}
        currentStep={loadingSteps.indexOf(loadingStage)}
      />
      
      {/* Notifications */}
      {notification && (
        <NotificationToast 
          message={notification.message}
          type={notification.type}
          onDismiss={() => setNotification(null)}
        />
      )}
      {lastDebug && (
        <div style={{ marginTop: 12, padding: 8, background: '#fff8e1', border: '1px solid #ffe08a', borderRadius: 6 }}>
          <h4 style={{ marginTop: 0 }}>Debug</h4>
          <div style={{ fontSize: 12 }}><strong>Request URL:</strong> <code style={{ wordBreak: 'break-all' }}>{lastDebug.url}</code></div>
          {lastDebug.error ? (
            <div style={{ marginTop: 6, color: 'darkred' }}><strong>Error:</strong> {lastDebug.error}</div>
          ) : (
            <div style={{ marginTop: 6 }}>
              <strong>Response (meta):</strong>
              <pre style={{ maxHeight: 200, overflow: 'auto', background: '#f1f5f9', padding: 8 }}>{JSON.stringify(lastDebug.response && lastDebug.response.meta ? lastDebug.response.meta : lastDebug.response, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
      {/* Enhanced Error Display for Omitted Parameters */}
      {omittedParams && omittedParams.length > 0 && (
        <ErrorDisplay 
          error={`${omittedParams.length} parameters were not available and were omitted`}
          suggestions={[
            'Try selecting different parameters for this location/time',
            'Check if the date range is within available data periods',
            'Some parameters may not be available for all regions'
          ]}
          onRetry={() => {
            removeOmittedFromSelection()
            setNotification({ message: 'Removed unavailable parameters', type: 'info' })
          }}
          onDismiss={() => setOmittedParams([])}
          showDetails={true}
        />
      )}
      
    </div>
  )
}
