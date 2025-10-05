// Lightweight validation helpers for normalized payloads.
// These are intentionally small and dependency-free so they can run in both
// browser and server environments.

export function validateTimeSeries(series) {
  const errors = []
  if (!series || typeof series !== 'object') {
    errors.push('series must be an object')
    return { valid: false, errors }
  }
  if (!series.meta) errors.push('missing meta')
  if (!Array.isArray(series.data)) errors.push('data must be an array')
  else {
    for (let i = 0; i < series.data.length; i++) {
      const p = series.data[i]
      if (!p.ts) errors.push(`data[${i}].ts missing`)
      if (typeof p.value === 'undefined') errors.push(`data[${i}].value missing`)
    }
  }
  return { valid: errors.length === 0, errors }
}

export function validateMultiSeries(payload) {
  const errors = []
  if (!payload || typeof payload !== 'object') {
    errors.push('payload must be an object')
    return { valid: false, errors }
  }
  if (!payload.series || typeof payload.series !== 'object') errors.push('missing series object')
  else {
    for (const key of Object.keys(payload.series)) {
      const s = payload.series[key]
      if (!s.data || !Array.isArray(s.data)) errors.push(`${key}: data must be array`)
    }
  }
  return { valid: errors.length === 0, errors }
}

export function validateGrid(gridPayload) {
  const errors = []
  if (!gridPayload || typeof gridPayload !== 'object') {
    errors.push('gridPayload must be an object')
    return { valid: false, errors }
  }
  if (!gridPayload.meta) errors.push('missing meta')
  if (!gridPayload.grid) errors.push('missing grid')
  else {
    const { lons, lats, values } = gridPayload.grid
    if (!Array.isArray(lons) || lons.length === 0) errors.push('lons must be non-empty array')
    if (!Array.isArray(lats) || lats.length === 0) errors.push('lats must be non-empty array')
    if (!Array.isArray(values) || values.length !== lats.length) errors.push('values must be 2D array matching lats length')
  }
  return { valid: errors.length === 0, errors }
}

// Generic validator that chooses by shape
export function validateNormalized(payload) {
  if (!payload) return { valid: false, errors: ['payload empty'] }
  // point time-series: meta + data
  if (payload.data) return validateTimeSeries(payload)
  // multi-parameter: series
  if (payload.series) return validateMultiSeries(payload)
  // array of series (multi-location)
  if (Array.isArray(payload)) {
    const errors = []
    for (let i = 0; i < payload.length; i++) {
      const v = validateTimeSeries(payload[i])
      if (!v.valid) errors.push({ index: i, errors: v.errors })
    }
    return { valid: errors.length === 0, errors }
  }
  // grids
  if (payload.grid) return validateGrid(payload)

  return { valid: false, errors: ['unrecognized payload shape'] }
}
