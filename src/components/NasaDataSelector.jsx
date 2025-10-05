import React, { useState } from 'react'
import { NASA_APIS } from '../services/nasa_enhanced'

export default function NasaDataSelector({ selectedSources, onSourcesChange, selectedParameters, onParametersChange }) {
  const [showDetails, setShowDetails] = useState({})

  const toggleSourceDetails = (source) => {
    setShowDetails(prev => ({
      ...prev,
      [source]: !prev[source]
    }))
  }

  const handleSourceToggle = (source) => {
    const newSources = selectedSources.includes(source)
      ? selectedSources.filter(s => s !== source)
      : [...selectedSources, source]
    
    onSourcesChange(newSources)
  }

  const handleParameterToggle = (source, parameter) => {
    const key = `${source}_${parameter}`
    const newParams = selectedParameters.includes(key)
      ? selectedParameters.filter(p => p !== key)
      : [...selectedParameters, key]
    
    onParametersChange(newParams)
  }

  return (
    <div className="nasa-data-selector">
      <div className="control-section">
        <label>NASA Data Sources</label>
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 14, color: '#666', margin: 0 }}>
            Select NASA data sources and parameters for comprehensive Earth observation and climate data
          </p>
        </div>
        
        {Object.entries(NASA_APIS).map(([source, config]) => (
          <div key={source} style={{ marginBottom: 16, border: '1px solid #eee', borderRadius: 6, overflow: 'hidden' }}>
            {/* Source Header */}
            <div 
              style={{ 
                padding: 12, 
                background: selectedSources.includes(source) ? '#e8f5e8' : '#f8f9fa',
                borderBottom: showDetails[source] ? '1px solid #eee' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
              onClick={() => toggleSourceDetails(source)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={selectedSources.includes(source)}
                  onChange={(e) => {
                    e.stopPropagation()
                    handleSourceToggle(source)
                  }}
                  style={{ cursor: 'pointer' }}
                />
                <div>
                  <strong>{config.name}</strong>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    Resolution: {config.spatial_resolution}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {selectedSources.includes(source) && (
                  <span style={{ 
                    background: '#28a745', 
                    color: 'white', 
                    padding: '2px 8px', 
                    borderRadius: 12, 
                    fontSize: 12 
                  }}>
                    Active
                  </span>
                )}
                <span style={{ fontSize: 12 }}>
                  {showDetails[source] ? '▼' : '▶'}
                </span>
              </div>
            </div>

            {/* Source Details */}
            {showDetails[source] && (
              <div style={{ padding: 12, background: '#fff' }}>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 14, marginBottom: 8 }}>
                    <strong>Description:</strong> {config.description}
                  </div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    <strong>Data Range:</strong> {config.temporal_range.min} to {config.temporal_range.max}
                  </div>
                </div>

                {/* Parameters */}
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                    Available Parameters:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                    {config.parameters.map(param => {
                      const paramKey = `${source}_${param}`
                      const isSelected = selectedParameters.includes(paramKey)
                      
                      return (
                        <label 
                          key={param}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 6,
                            padding: 8,
                            background: isSelected ? '#e8f5e8' : '#f8f9fa',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: 13,
                            border: isSelected ? '1px solid #28a745' : '1px solid #dee2e6'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleParameterToggle(source, param)}
                            disabled={!selectedSources.includes(source)}
                            style={{ cursor: 'pointer' }}
                          />
                          <span style={{ 
                            opacity: selectedSources.includes(source) ? 1 : 0.5 
                          }}>
                            {getParameterFriendlyName(source, param)}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Quick Select All/None */}
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                  <button
                    className="btn"
                    style={{ fontSize: 12, padding: '4px 8px' }}
                    onClick={() => {
                      const allParams = config.parameters.map(p => `${source}_${p}`)
                      const newParams = [...selectedParameters.filter(p => !p.startsWith(`${source}_`)), ...allParams]
                      onParametersChange(newParams)
                    }}
                    disabled={!selectedSources.includes(source)}
                  >
                    Select All
                  </button>
                  <button
                    className="btn"
                    style={{ fontSize: 12, padding: '4px 8px' }}
                    onClick={() => {
                      const newParams = selectedParameters.filter(p => !p.startsWith(`${source}_`))
                      onParametersChange(newParams)
                    }}
                    disabled={!selectedSources.includes(source)}
                  >
                    Select None
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Summary */}
        {selectedSources.length > 0 && (
          <div style={{ 
            padding: 12, 
            background: '#f0f8ff', 
            border: '1px solid #b8daff', 
            borderRadius: 6,
            marginTop: 16
          }}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
              Selection Summary:
            </div>
            <div style={{ fontSize: 13 }}>
              <div><strong>Sources:</strong> {selectedSources.length} selected ({selectedSources.join(', ')})</div>
              <div><strong>Parameters:</strong> {selectedParameters.length} selected</div>
              {selectedParameters.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <strong>Selected Parameters:</strong>
                  <div style={{ fontSize: 12, marginTop: 4 }}>
                    {selectedParameters.map(p => {
                      const [source, param] = p.split('_', 2)
                      return (
                        <span 
                          key={p}
                          style={{ 
                            display: 'inline-block',
                            background: '#28a745',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: 10,
                            fontSize: 11,
                            margin: '2px 4px 2px 0'
                          }}
                        >
                          {NASA_APIS[source]?.name}: {getParameterFriendlyName(source, param)}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to get friendly parameter names
function getParameterFriendlyName(source, param) {
  const friendlyNames = {
    power: {
      'T2M': 'Temperature (2m)',
      'PRECTOTCORR': 'Precipitation',
      'ALLSKY_SFC_SW_DWN': 'Solar Radiation',
      'WS2M': 'Wind Speed (2m)',
      'RH2M': 'Relative Humidity (2m)',
      'PS': 'Surface Pressure'
    },
    modis: {
      'NDVI': 'Vegetation Index',
      'EVI': 'Enhanced Vegetation Index', 
      'LST_Day': 'Land Surface Temp (Day)',
      'LST_Night': 'Land Surface Temp (Night)'
    },
    giovanni: {
      'Temperature_A': 'Atmospheric Temperature',
      'Humidity_A': 'Atmospheric Humidity',
      'TOTEXTTAU': 'Aerosol Optical Thickness'
    },
    goes: {
      'C01': 'Visible Blue Channel',
      'C02': 'Visible Red Channel',
      'C07': 'Shortwave IR Channel',
      'C13': 'Clean Longwave IR Channel'
    },
    earthdata: {
      'temperature': 'Temperature',
      'precipitation': 'Precipitation',
      'vegetation': 'Vegetation Indices',
      'aerosols': 'Aerosol Properties'
    }
  }

  return friendlyNames[source]?.[param] || param
}