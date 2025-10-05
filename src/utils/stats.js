export function mean(values) {
  if (!values || values.length === 0) return null
  return values.reduce((s, v) => s + v, 0) / values.length
}

export function std(values) {
  const m = mean(values)
  if (m === null) return null
  const variance = values.reduce((s, v) => s + (v - m) * (v - m), 0) / values.length
  return Math.sqrt(variance)
}

// Simple normal CDF based exceedance probability given threshold
export function exceedanceProbability(values, threshold) {
  const m = mean(values)
  const s = std(values)
  if (m === null || s === 0) return values.filter(v => v > threshold).length / values.length
  // z = (threshold - m) / s; probability > threshold = 1 - Phi(z)
  const z = (threshold - m) / s
  return 1 - normalCDF(z)
}

function normalCDF(x) {
  // approximate using error function
  return 0.5 * (1 + erf(x / Math.sqrt(2)))
}

function erf(x) {
  // Abramowitz and Stegun approximation
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911
  const sign = x < 0 ? -1 : 1
  const absx = Math.abs(x)
  const t = 1 / (1 + p * absx)
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absx * absx)
  return sign * y
}

export function bellCurveDataset(values, bins = 20) {
  // produce histogram-like bins for simple bell visualization
  if (!values || values.length === 0) return { labels: [], counts: [] }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const step = (max - min) / bins
  const labels = []
  const counts = new Array(bins).fill(0)
  for (let i = 0; i < bins; i++) labels.push((min + i * step).toFixed(2))
  values.forEach(v => {
    const idx = Math.min(bins - 1, Math.floor((v - min) / (step || 1)))
    counts[idx]++
  })
  return { labels, counts }
}
