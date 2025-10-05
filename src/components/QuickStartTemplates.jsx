import React, { useState } from 'react'
import { USE_CASE_TEMPLATES, getDateRangeSuggestions } from '../services/smart_recommendations'

export default function QuickStartTemplates({ 
  onApplyTemplate, 
  currentLocation, 
  onLocationChange 
}) {
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [showDetails, setShowDetails] = useState({})

  const popularLocations = [
    { name: '🌾 Iowa Farmland', lat: 42.0, lon: -93.5, description: 'Major agricultural region' },
    { name: '☀️ Mojave Desert', lat: 35.0, lon: -115.5, description: 'Solar energy hotspot' },
    { name: '🌲 Amazon Rainforest', lat: -3.0, lon: -60.0, description: 'Tropical ecosystem' },
    { name: '🏔️ Colorado Rockies', lat: 39.5, lon: -106.0, description: 'Mountain climate' },
    { name: '🏝️ Hawaii', lat: 21.3, lon: -157.8, description: 'Tropical island climate' },
    { name: '🧊 Alaska', lat: 64.8, lon: -147.7, description: 'Arctic conditions' }
  ]

  const handleApplyTemplate = (templateKey) => {
    const template = USE_CASE_TEMPLATES[templateKey]
    if (!template) return

    const dateRanges = getDateRangeSuggestions(templateKey)
    const defaultRange = dateRanges[0]

    onApplyTemplate({
      template: templateKey,
      sources: template.sources,
      parameters: template.parameters,
      startDate: defaultRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: defaultRange?.end || new Date().toISOString().split('T')[0],
      name: template.name,
      description: template.description
    })
  }

  const toggleDetails = (templateKey) => {
    setShowDetails(prev => ({
      ...prev,
      [templateKey]: !prev[templateKey]
    }))
  }

  return (
    <div className="quick-start-templates">
      <div className="control-section">
        <label style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a73e8' }}>
          🚀 Quick Start Templates
        </label>
        <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 16px 0' }}>
          Get started quickly with pre-configured templates for common use cases
        </p>

        {/* Popular Locations */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>📍 Popular Study Locations</h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '8px' 
          }}>
            {popularLocations.map((location, index) => (
              <button
                key={index}
                className="btn"
                onClick={() => onLocationChange({ lat: location.lat, lon: location.lon })}
                style={{
                  padding: '8px 12px',
                  fontSize: '12px',
                  textAlign: 'left',
                  background: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontWeight: 'bold' }}>{location.name}</div>
                <div style={{ fontSize: '11px', color: '#666' }}>{location.description}</div>
                <div style={{ fontSize: '10px', color: '#999' }}>
                  {location.lat.toFixed(1)}°, {location.lon.toFixed(1)}°
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Use Case Templates */}
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>🎯 Use Case Templates</h4>
          <div style={{ display: 'grid', gap: '12px' }}>
            {Object.entries(USE_CASE_TEMPLATES).map(([key, template]) => (
              <div 
                key={key}
                style={{
                  border: '1px solid #e1e5e9',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: '#fff'
                }}
              >
                {/* Template Header */}
                <div 
                  style={{
                    padding: '12px 16px',
                    background: selectedTemplate === key ? '#e8f5e8' : '#f8f9fa',
                    borderBottom: showDetails[key] ? '1px solid #e1e5e9' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onClick={() => toggleDetails(key)}
                >
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                      {template.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {template.description}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      className="btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleApplyTemplate(key)
                        setSelectedTemplate(key)
                      }}
                      style={{
                        background: '#1a73e8',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        fontSize: '12px',
                        borderRadius: '4px'
                      }}
                    >
                      Use Template
                    </button>
                    <span style={{ fontSize: '12px' }}>
                      {showDetails[key] ? '▼' : '▶'}
                    </span>
                  </div>
                </div>

                {/* Template Details */}
                {showDetails[key] && (
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      {/* Data Sources */}
                      <div>
                        <h5 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#333' }}>
                          📡 Data Sources
                        </h5>
                        <div style={{ fontSize: '12px' }}>
                          {template.sources.map(source => (
                            <div key={source} style={{ 
                              padding: '4px 8px', 
                              margin: '2px 0', 
                              background: '#e8f4f8', 
                              borderRadius: '4px',
                              color: '#1a73e8'
                            }}>
                              NASA {source.toUpperCase()}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Parameters */}
                      <div>
                        <h5 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#333' }}>
                          📊 Key Parameters
                        </h5>
                        <div style={{ fontSize: '12px' }}>
                          {template.parameters.slice(0, 4).map(param => {
                            const [source, paramName] = param.split('_')
                            return (
                              <div key={param} style={{ 
                                padding: '2px 6px', 
                                margin: '2px 0', 
                                background: '#f0f8f0', 
                                borderRadius: '3px',
                                color: '#2d5a2d'
                              }}>
                                {getParameterFriendlyName(paramName)}
                              </div>
                            )
                          })}
                          {template.parameters.length > 4 && (
                            <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                              +{template.parameters.length - 4} more parameters
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tips */}
                    <div style={{ marginTop: '12px' }}>
                      <h5 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#333' }}>
                        💡 Pro Tips
                      </h5>
                      <ul style={{ 
                        margin: 0, 
                        paddingLeft: '16px', 
                        fontSize: '12px', 
                        color: '#555' 
                      }}>
                        {template.tips.slice(0, 3).map((tip, index) => (
                          <li key={index} style={{ marginBottom: '4px' }}>{tip}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Date Range Suggestions */}
                    <div style={{ marginTop: '12px' }}>
                      <h5 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#333' }}>
                        📅 Recommended Date Ranges
                      </h5>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {getDateRangeSuggestions(key).map((range, index) => (
                          <div 
                            key={index}
                            style={{
                              padding: '6px 10px',
                              background: '#f8f9fa',
                              border: '1px solid #dee2e6',
                              borderRadius: '4px',
                              fontSize: '11px'
                            }}
                          >
                            <div style={{ fontWeight: 'bold' }}>{range.label}</div>
                            <div style={{ color: '#666' }}>{range.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Selected Template Summary */}
        {selectedTemplate && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: '#e8f5e8',
            border: '1px solid #9ae6b4',
            borderRadius: '6px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#2f855a' }}>
              ✅ Template Applied: {USE_CASE_TEMPLATES[selectedTemplate].name}
            </h4>
            <p style={{ margin: 0, fontSize: '12px', color: '#2f855a' }}>
              Configuration has been applied to your data selection. You can now run the query or further customize the parameters.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function for parameter names
function getParameterFriendlyName(param) {
  const names = {
    'T2M': 'Temperature',
    'PRECTOTCORR': 'Precipitation',
    'ALLSKY_SFC_SW_DWN': 'Solar Radiation',
    'WS2M': 'Wind Speed',
    'RH2M': 'Humidity',
    'NDVI': 'Vegetation Index',
    'EVI': 'Enhanced Veg Index',
    'LST_Day': 'Land Temp (Day)',
    'LST_Night': 'Land Temp (Night)',
    'Temperature_A': 'Atm Temperature',
    'Humidity_A': 'Atm Humidity',
    'TOTEXTTAU': 'Aerosol Thickness',
    'C01': 'Visible Blue',
    'C02': 'Visible Red',
    'C07': 'Shortwave IR',
    'C13': 'Longwave IR'
  }
  
  return names[param] || param
}