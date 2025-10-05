import React from 'react'
import { mean, std, exceedanceProbability, bellCurveDataset } from '../utils/stats'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, BarController, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, BarController, Title, Tooltip, Legend)

export default function ResultsSummary({ data, thresholds = { hot: 35, cold: 0, wet: 10, windy: 15 } }) {
  if (!data) return <div>No results available</div>
  
  // Handle both direct data array and nested data structure
  const chartData = data.data || data.chartData?.data || (Array.isArray(data) ? data : [])
  
  if (!chartData || !Array.isArray(chartData) || chartData.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
        <h3>📊 No Analysis Data Available</h3>
        <p>Please fetch weather data to see statistical analysis and probability summaries.</p>
      </div>
    )
  }

  // Extract temperature series if available (more flexible parameter matching)
  const tparam = chartData.find(d => 
    d.parameter && (
      d.parameter.toLowerCase().includes('t2m') || 
      d.parameter.toLowerCase().includes('temperature') ||
      d.parameter.toLowerCase().includes('temp')
    )
  )
  const pparam = chartData.find(d => 
    d.parameter && (
      d.parameter.toLowerCase().includes('precip') || 
      d.parameter.toLowerCase().includes('rain') ||
      d.parameter.toLowerCase().includes('prectotcorr')
    )
  )
  const windparam = chartData.find(d => 
    d.parameter && (
      d.parameter.toLowerCase().includes('wind') ||
      d.parameter.toLowerCase().includes('ws2m')
    )
  )

  // Safely extract values with error checking
  const extractValues = (param) => {
    if (!param || !param.coordinates || !Array.isArray(param.coordinates) || !param.coordinates[0]) {
      return []
    }
    const coords = param.coordinates[0]
    if (!coords.dates || !Array.isArray(coords.dates)) {
      return []
    }
    return coords.dates
      .filter(d => d && typeof d.value === 'number' && !isNaN(d.value))
      .map(d => d.value)
  }

  const temps = extractValues(tparam)
  const precs = extractValues(pparam)
  const winds = extractValues(windparam)

  const hotProb = temps.length ? exceedanceProbability(temps, thresholds.hot) : null
  const coldProb = temps.length ? exceedanceProbability(temps, thresholds.cold, 'lt') : null
  const wetProb = precs.length ? exceedanceProbability(precs, thresholds.wet) : null
  const windyProb = winds.length ? exceedanceProbability(winds, thresholds.windy) : null

  const bell = bellCurveDataset(temps, 12)

  const barData = {
    labels: [
      `Very hot >${thresholds.hot}°C`,
      `Very cold <${thresholds.cold}°C`,
      `Very wet >${thresholds.wet}mm`,
      `Very windy >${thresholds.windy}m/s`
    ],
    datasets: [{ label: 'Probability', data: [hotProb || 0, coldProb || 0, wetProb || 0, windyProb || 0], backgroundColor: ['#ff7b7b', '#7bb8ff', '#7bd9ff', '#ffd27b'] }]
  }

  return (
    <div>
      <h3>Summary</h3>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Bar data={barData} />
        </div>
        <div style={{ width: 320 }}>
          <h4>Temperature stats</h4>
          <div>Mean: {temps.length ? mean(temps).toFixed(2) : 'N/A'} °C</div>
          <div>Std: {temps.length ? std(temps).toFixed(2) : 'N/A'} °C</div>
          <h4>Bell curve (approx)</h4>
          <Bar data={{ labels: bell.labels, datasets: [{ label: 'Counts', data: bell.counts, backgroundColor: '#c7e9b4' }] }} />
        </div>
      </div>
      <div style={{ marginTop: 8 }}>
        <p>{temps.length ? `There is a ${(hotProb * 100).toFixed(0)}% chance of temperatures exceeding ${thresholds.hot}°C in the selected period` : ''}</p>
        {data.meta && data.meta.droppedParameters && data.meta.droppedParameters.length > 0 && (
          <div style={{ marginTop: 8, color: '#b45f06' }}>
            <strong>Note:</strong> The following parameters were not available for the selected model/time and were omitted: {data.meta.droppedParameters.join(', ')}
          </div>
        )}
      </div>
    </div>
  )
}
