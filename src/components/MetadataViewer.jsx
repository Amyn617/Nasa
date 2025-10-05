/**
 * MetadataViewer Component
 * Displays comprehensive information about API requests, data sources, and quality metrics
 */

import React, { useState } from 'react'

export default function MetadataViewer({ metadata, onClose }) {
  const [activeSection, setActiveSection] = useState('overview')

  if (!metadata) {
    return (
      <div className="metadata-viewer">
        <div className="metadata-header">
          <h2>📊 API Metadata Viewer</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>
        <div className="no-metadata">
          <p>No metadata available. Fetch some data first to see detailed information.</p>
        </div>
      </div>
    )
  }

  const sections = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'request', label: 'Request Details', icon: '🔗' },
    { id: 'nasa', label: 'NASA Data', icon: '🛰️' },
    { id: 'quality', label: 'Data Quality', icon: '🎯' },
    { id: 'statistics', label: 'Statistics', icon: '📈' }
  ]

  return (
    <div className="metadata-viewer">
      <div className="metadata-header">
        <h2>📊 API Metadata Viewer</h2>
        <button onClick={onClose} className="close-btn">✕</button>
      </div>

      <div className="metadata-nav">
        {sections.map(section => (
          <button
            key={section.id}
            className={`nav-btn ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            {section.icon} {section.label}
          </button>
        ))}
      </div>

      <div className="metadata-content">
        {activeSection === 'overview' && (
          <OverviewSection metadata={metadata} />
        )}
        {activeSection === 'request' && (
          <RequestSection metadata={metadata} />
        )}
        {activeSection === 'nasa' && (
          <NasaDataSection metadata={metadata} />
        )}
        {activeSection === 'quality' && (
          <QualitySection metadata={metadata} />
        )}
        {activeSection === 'statistics' && (
          <StatisticsSection metadata={metadata} />
        )}
      </div>
    </div>
  )
}

function OverviewSection({ metadata }) {
  const requestUrl = metadata.request_url
  const nasaSources = metadata.nasa_data?.meta?.sources_requested || []
  const location = metadata.nasa_data?.meta ? 
    `${metadata.nasa_data.meta.lat}°N, ${metadata.nasa_data.meta.lon}°W` : 
    'Unknown'
  
  const timeRange = metadata.nasa_data?.meta?.datetime_range
  const period = timeRange ? 
    `${new Date(timeRange.start).toLocaleDateString()} - ${new Date(timeRange.end).toLocaleDateString()}` :
    'Unknown'

  return (
    <div className="overview-section">
      <div className="overview-card">
        <h3>🌍 Location & Time</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Location:</span>
            <span className="value">{location}</span>
          </div>
          <div className="info-item">
            <span className="label">Time Period:</span>
            <span className="value">{period}</span>
          </div>
        </div>
      </div>

      <div className="overview-card">
        <h3>📡 Data Sources</h3>
        <div className="sources-list">
          {nasaSources.length > 0 ? (
            nasaSources.map(source => (
              <div key={source} className="source-badge">
                {getSourceIcon(source)} {source.toUpperCase()}
              </div>
            ))
          ) : (
            <span className="no-sources">No NASA sources requested</span>
          )}
        </div>
      </div>

      <div className="overview-card">
        <h3>📊 Data Summary</h3>
        <DataSummary metadata={metadata} />
      </div>
    </div>
  )
}

function RequestSection({ metadata }) {
  const requestUrl = metadata.request_url
  const droppedParams = metadata.droppedParameters || []
  
  return (
    <div className="request-section">
      <div className="request-card">
        <h3>🔗 API Request URL</h3>
        <div className="url-display">
          <code>{requestUrl}</code>
          <button 
            onClick={() => navigator.clipboard.writeText(requestUrl)}
            className="copy-btn"
            title="Copy URL"
          >
            📋
          </button>
        </div>
      </div>

      {droppedParams.length > 0 && (
        <div className="request-card">
          <h3>⚠️ Dropped Parameters</h3>
          <div className="dropped-params">
            {droppedParams.map((param, index) => (
              <span key={index} className="dropped-param">{param}</span>
            ))}
          </div>
          <p className="dropped-explanation">
            These parameters were requested but not available for the specified location/time.
          </p>
        </div>
      )}

      <URLAnalysis url={requestUrl} />
    </div>
  )
}

function NasaDataSection({ metadata }) {
  const nasaData = metadata.nasa_data
  
  if (!nasaData) {
    return (
      <div className="nasa-section">
        <p>No NASA data in this request.</p>
      </div>
    )
  }

  const results = nasaData.results || {}
  
  return (
    <div className="nasa-section">
      {Object.entries(results).map(([source, data]) => (
        <div key={source} className="nasa-source-card">
          <div className="source-header">
            <h3>{getSourceIcon(source)} {source.toUpperCase()}</h3>
            <span className="source-status">
              {data.error ? '❌ Error' : '✅ Success'}
            </span>
          </div>

          {data.error ? (
            <div className="error-display">
              <p className="error-message">{data.error}</p>
            </div>
          ) : (
            <NasaSourceDetails source={source} data={data} />
          )}
        </div>
      ))}
    </div>
  )
}

function NasaSourceDetails({ source, data }) {
  const meta = data.meta || {}
  const dataPoints = data.data || []
  
  return (
    <div className="source-details">
      <div className="meta-info">
        <h4>📋 Dataset Information</h4>
        <div className="info-grid">
          {meta.product && (
            <div className="info-item">
              <span className="label">Product:</span>
              <span className="value">{meta.product}</span>
            </div>
          )}
          {meta.band && (
            <div className="info-item">
              <span className="label">Band:</span>
              <span className="value">{meta.band}</span>
            </div>
          )}
          {meta.parameter && (
            <div className="info-item">
              <span className="label">Parameter:</span>
              <span className="value">{meta.parameter}</span>
            </div>
          )}
          {meta.friendly && (
            <div className="info-item">
              <span className="label">Description:</span>
              <span className="value">{meta.friendly}</span>
            </div>
          )}
          {meta.units && (
            <div className="info-item">
              <span className="label">Units:</span>
              <span className="value">{meta.units}</span>
            </div>
          )}
        </div>
      </div>

      {dataPoints.length > 0 && (
        <div className="data-preview">
          <h4>📊 Data Preview ({dataPoints.length} points)</h4>
          <DataPreviewTable data={dataPoints.slice(0, 5)} />
          {dataPoints.length > 5 && (
            <p className="preview-note">Showing first 5 of {dataPoints.length} data points</p>
          )}
        </div>
      )}
    </div>
  )
}

function QualitySection({ metadata }) {
  const nasaData = metadata.nasa_data
  
  return (
    <div className="quality-section">
      <div className="quality-card">
        <h3>🎯 Data Quality Assessment</h3>
        <QualityMetrics metadata={metadata} />
      </div>
      
      {nasaData && (
        <div className="quality-card">
          <h3>🔍 Source Reliability</h3>
          <SourceReliability nasaData={nasaData} />
        </div>
      )}
    </div>
  )
}

function StatisticsSection({ metadata }) {
  const nasaData = metadata.nasa_data
  
  if (!nasaData || !nasaData.results) {
    return <div className="stats-section">No statistical data available</div>
  }
  
  return (
    <div className="stats-section">
      {Object.entries(nasaData.results).map(([source, data]) => {
        if (data.error || !data.data) return null
        
        return (
          <div key={source} className="stats-card">
            <h3>📈 {source.toUpperCase()} Statistics</h3>
            <DataStatistics data={data.data} meta={data.meta} />
          </div>
        )
      })}
    </div>
  )
}

// Helper Components

function DataSummary({ metadata }) {
  const nasaData = metadata.nasa_data
  if (!nasaData || !nasaData.results) return null
  
  const totalSources = Object.keys(nasaData.results).length
  const successfulSources = Object.values(nasaData.results).filter(d => !d.error).length
  const totalDataPoints = Object.values(nasaData.results).reduce((sum, data) => {
    return sum + (data.data ? data.data.length : 0)
  }, 0)
  
  return (
    <div className="data-summary">
      <div className="summary-stat">
        <span className="stat-value">{totalSources}</span>
        <span className="stat-label">Sources Requested</span>
      </div>
      <div className="summary-stat">
        <span className="stat-value">{successfulSources}</span>
        <span className="stat-label">Successful</span>
      </div>
      <div className="summary-stat">
        <span className="stat-value">{totalDataPoints}</span>
        <span className="stat-label">Data Points</span>
      </div>
    </div>
  )
}

function URLAnalysis({ url }) {
  if (!url) return null
  
  const urlObj = new URL(url)
  const pathParts = urlObj.pathname.split('/')
  
  return (
    <div className="request-card">
      <h3>🔍 URL Analysis</h3>
      <div className="url-analysis">
        <div className="url-part">
          <span className="label">Host:</span>
          <span className="value">{urlObj.hostname}</span>
        </div>
        <div className="url-part">
          <span className="label">Path:</span>
          <span className="value">{urlObj.pathname}</span>
        </div>
        {urlObj.search && (
          <div className="url-part">
            <span className="label">Query:</span>
            <span className="value">{urlObj.search}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function DataPreviewTable({ data }) {
  return (
    <div className="data-preview-table">
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point, index) => (
            <tr key={index}>
              <td>{new Date(point.ts).toLocaleDateString()}</td>
              <td>{typeof point.value === 'number' ? point.value.toFixed(4) : point.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function QualityMetrics({ metadata }) {
  const nasaData = metadata.nasa_data
  if (!nasaData) return <p>No NASA data to assess</p>
  
  const results = nasaData.results || {}
  const sources = Object.keys(results)
  const errors = Object.values(results).filter(d => d.error).length
  const successRate = sources.length > 0 ? ((sources.length - errors) / sources.length * 100) : 0
  
  return (
    <div className="quality-metrics">
      <div className="metric">
        <span className="metric-label">Success Rate:</span>
        <span className={`metric-value ${successRate >= 80 ? 'good' : successRate >= 50 ? 'warning' : 'error'}`}>
          {successRate.toFixed(1)}%
        </span>
      </div>
      <div className="metric">
        <span className="metric-label">Failed Sources:</span>
        <span className="metric-value">{errors}/{sources.length}</span>
      </div>
    </div>
  )
}

function SourceReliability({ nasaData }) {
  const results = nasaData.results || {}
  
  return (
    <div className="source-reliability">
      {Object.entries(results).map(([source, data]) => (
        <div key={source} className="reliability-item">
          <span className="source-name">{source.toUpperCase()}</span>
          <span className={`reliability-status ${data.error ? 'error' : 'success'}`}>
            {data.error ? '❌ Failed' : '✅ Reliable'}
          </span>
          {data.data && (
            <span className="data-count">({data.data.length} points)</span>
          )}
        </div>
      ))}
    </div>
  )
}

function DataStatistics({ data, meta }) {
  if (!data || data.length === 0) return <p>No data points available</p>
  
  const values = data.map(d => d.value).filter(v => typeof v === 'number' && !isNaN(v))
  if (values.length === 0) return <p>No numeric values to analyze</p>
  
  const min = Math.min(...values)
  const max = Math.max(...values)
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length
  const std = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length)
  
  return (
    <div className="data-statistics">
      <div className="stat-row">
        <span className="stat-label">Count:</span>
        <span className="stat-value">{values.length}</span>
      </div>
      <div className="stat-row">
        <span className="stat-label">Range:</span>
        <span className="stat-value">{min.toFixed(4)} - {max.toFixed(4)}</span>
      </div>
      <div className="stat-row">
        <span className="stat-label">Mean:</span>
        <span className="stat-value">{mean.toFixed(4)} {meta?.units || ''}</span>
      </div>
      <div className="stat-row">
        <span className="stat-label">Std Dev:</span>
        <span className="stat-value">{std.toFixed(4)}</span>
      </div>
    </div>
  )
}

function getSourceIcon(source) {
  const icons = {
    power: '⚡',
    modis: '🛰️',
    giovanni: '🌍',
    goes: '📡',
    earthdata: '🌎'
  }
  return icons[source.toLowerCase()] || '📊'
}