import React, { useState, useMemo, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { METEO_PARAMS, PRESETS, paramTokenToKey } from '../services/meteomatics_params'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

// small palette for charts (cycled)
const palette = ['#ff6384', '#36a2eb', '#ff9f40', '#4bc0c0', '#9e9ea6', '#9966ff', '#ffd700']

function friendlyName(parameter) {
  if (!parameter) return { label: parameter, unit: '', color: '#666' }
  const [base, unitToken] = parameter.split(':')
  // lookup in METEO_PARAMS by matching base code
  for (const v of Object.values(METEO_PARAMS)) {
    if (v.code.split(':')[0] === base) {
      const idx = Object.keys(METEO_PARAMS).indexOf(Object.keys(METEO_PARAMS).find(k => METEO_PARAMS[k] === v))
      return { label: v.label, unit: v.unit, color: palette[idx % palette.length] }
    }
  }

  // Fallback: derive a friendly label and unit from the token
  // Prettify base: replace underscores, expand common tokens and capitalize
  let label = base.replace(/_/g, ' ')
  // replace patterns like 000m -> 0 m, and remove redundant numeric markers when possible
  label = label.replace(/\b0+0m\b/g, match => match.replace('000m', 'm'))
  label = label.replace(/\b(\d+)m\b/g, '$1 m')
  // Capitalize words
  label = label.split(' ').map(w => w.length ? (w[0].toUpperCase() + w.slice(1)) : w).join(' ')

  // Map common compact unit tokens to readable units
  const unitMap = {
    'gm3': 'g/m3',
    'kgm3': 'kg/m3',
    'ugm3': 'µg/m3',
    'ugm2': 'µg/m2',
    'm3m3': 'm3/m3',
    'ms': 'm/s',
    'ms-1': 'm/s',
    'm/s': 'm/s',
    'Pa': 'Pa',
    'hPa': 'hPa',
    'C': '°C',
    'K': 'K',
    'W/m2': 'W/m²',
    'W': 'W',
    'mm': 'mm',
    'm': 'm',
    'd': 'd',
    'idx': 'index',
    'pgm3': 'pg/m3',
    'grainsm3': 'grains/m3',
    'sql': 'SQL date',
    's': 's',
    'ms2': 'm/s²'
  }
  const unit = (unitToken && unitMap[unitToken]) ? unitMap[unitToken] : (unitToken || '')

  // Choose a stable color from the palette based on the base string
  const color = palette[Math.abs(base.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % palette.length]
  return { label, unit, color }
}

function buildDatasetForSeries(series) {
  if (!series || !series.coordinates || !Array.isArray(series.coordinates) || series.coordinates.length === 0) {
    console.warn('Invalid series structure:', series)
    return null
  }
  
  const coords = series.coordinates[0]
  if (!coords || !coords.dates || !Array.isArray(coords.dates) || coords.dates.length === 0) {
    console.warn('Invalid coordinates structure:', coords)
    return null
  }
  
  // Filter out invalid data points
  const validDates = coords.dates.filter(d => d && d.date && typeof d.value === 'number' && !isNaN(d.value))
  
  if (validDates.length === 0) {
    console.warn('No valid data points found in series:', series.parameter)
    return null
  }
  
  const labels = validDates.map(d => d.date)
  const values = validDates.map(d => d.value)
  const meta = friendlyName(series.parameter)
  
  return { 
    labels, 
    datasets: [{ 
      label: `${meta.label} ${meta.unit ? `(${meta.unit})` : ''}`, 
      data: values, 
      borderColor: meta.color, 
      backgroundColor: meta.color + '20', // Add transparency for area
      tension: 0.2,
      fill: false,
      pointRadius: 2,
      pointHoverRadius: 5
    }] 
  }
}

export default function Charts({ data, preset = '' , onClearPreset }) {
  // Better data validation
  if (!data) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', background: '#f5f5f5', borderRadius: '8px' }}>
        <h4>📊 No Chart Data Available</h4>
        <p>Please fetch data using the workflow above to see visualizations.</p>
      </div>
    )
  }

  // Handle both direct data array and nested data structure
  const chartData = data.data || data.chartData?.data || (Array.isArray(data) ? data : [])
  
  if (!chartData || !Array.isArray(chartData) || chartData.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
        <h4>⚠️ No Valid Data Series Found</h4>
        <p>The API returned data but no valid time series could be extracted for visualization.</p>
        <details style={{ textAlign: 'left', marginTop: '10px' }}>
          <summary>Debug Info (click to expand)</summary>
          <pre style={{ background: '#f8f9fa', padding: '10px', overflow: 'auto', fontSize: '12px' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      </div>
    )
  }

  // available parameters (use parameter string as key)
  const params = useMemo(() => chartData.map(s => s.parameter), [chartData])
  // initialize visibility state per parameter; if a preset is provided, only show matching variables
  const [visible, setVisible] = useState(() => {
    const m = {}
    params.forEach(p => { m[p] = false })
    return m
  })

  // When preset or data changes, update visibility: show only parameters that map to the preset's keys
  useEffect(() => {
    if (!preset) {
      // if no preset, default to all visible
      const m = {}
      params.forEach(p => { m[p] = true })
      setVisible(m)
      return
    }
    const wantedKeys = new Set((PRESETS[preset] || []).map(k => k))
    const m = {}
    params.forEach(p => {
      const key = paramTokenToKey(p)
      m[p] = !!(key && wantedKeys.has(key))
    })
    setVisible(m)
  }, [preset, data])

  function toggle(p) { setVisible(prev => ({ ...prev, [p]: !prev[p] })) }
  function setAll(v) { const m = {}; params.forEach(p => m[p] = v); setVisible(m) }

  return (
    <div>
      <h3>Time Series</h3>

      <div style={{ marginBottom: 8, padding: 8, background: '#fafafa', borderRadius: 6 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div><button className="btn" type="button" onClick={() => setAll(true)}>Select all</button></div>
          <div><button className="btn" type="button" onClick={() => setAll(false)}>Clear all</button></div>
          {preset && (
            <div style={{ marginLeft: 8 }}>
              <small>Preset: <strong>{preset}</strong></small>
              {onClearPreset && <button className="btn" style={{ marginLeft: 8 }} onClick={() => onClearPreset()}>Clear preset</button>}
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {params.map(p => {
              const meta = friendlyName(p)
              return (
                <label key={p} style={{ marginRight: 8 }}>
                  <input type="checkbox" checked={!!visible[p]} onChange={() => toggle(p)} /> {meta.label}
                </label>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
        {chartData.map(series => {
          if (!visible[series.parameter]) return null
          const ds = buildDatasetForSeries(series)
          if (!ds) return null
          return (
            <div key={series.parameter} style={{ background: '#fff', padding: 8, borderRadius: 6, border: '1px solid #eee' }}>
              <h4 style={{ margin: '6px 0' }}>{ds.datasets[0].label}</h4>
              <div style={{ height: 220 }}>
                <Line 
                  data={ds} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: 'Date'
                        }
                      },
                      y: {
                        title: {
                          display: true,
                          text: ds.datasets[0].label.match(/\(([^)]+)\)$/)?.[1] || 'Value'
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <h3 style={{ marginTop: 14 }}>Metadata</h3>
      <pre style={{ background: '#f1f5f9', padding: 10 }}>{JSON.stringify((data && data.meta) || {}, null, 2)}</pre>
    </div>
  )
}
