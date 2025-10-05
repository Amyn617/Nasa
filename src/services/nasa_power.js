/**
 * Simple helper to fetch NASA POWER data for a single point and date range.
 * Uses the NASA POWER API (no API key required for basic access).
 * Example: https://power.larc.nasa.gov/api/temporal/daily/point?parameters=...&start=20250101&end=20250131&latitude=...&longitude=...
 */
export async function fetchNasaPower(lat, lon, startDate, endDate) {
  // Validate basic date format YYYY-MM-DD
  function normalize(d) {
    if (!d) return null
    if (typeof d !== 'string') return null
    const m = d.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!m) return null
    return d.replace(/-/g, '')
  }

  const s = normalize(startDate)
  const e = normalize(endDate)
  if (!s || !e) throw new Error('Invalid start or end date for NASA POWER request; expected YYYY-MM-DD')
  if (Number(s) > Number(e)) throw new Error('Start date must be before or equal to end date for NASA POWER request')

  // Try a primary parameter set, but fall back to temperature-only if the service cannot handle the full set
  const primaryParams = ['T2M', 'PRECTOTCORR']
  const fallbackParams = ['T2M']

  async function fetchWithParams(paramsArr) {
    const params = paramsArr.join(',')
    const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=${params}&community=RE&start=${s}&end=${e}&latitude=${lat}&longitude=${lon}&format=JSON`
    const res = await fetch(url)
    const bodyText = await res.text()
    let json = null
    try { json = JSON.parse(bodyText) } catch (e) { json = { raw: bodyText } }
    if (!res.ok) {
      const err = new Error(`NASA POWER error: ${res.status} ${res.statusText} - ${bodyText}`)
      err.status = res.status
      err.body = bodyText
      throw err
    }
    return json
  }

  try {
    return await fetchWithParams(primaryParams)
  } catch (err) {
    // If server signals unprocessable content (422), try simpler request
    if (err && err.status === 422) {
      try {
        const res2 = await fetchWithParams(fallbackParams)
        // annotate that fallback was used
        res2.meta = res2.meta || {}
        res2.meta.nasa_power_fallback = true
        res2.meta.nasa_power_fallback_error = err.body || String(err)
        return res2
      } catch (err2) {
        // throw the original or new error with body for debugging
        throw err2
      }
    }
    throw err
  }
}

/**
 * Higher-level normalized wrapper around the NASA POWER point API.
 * Returns data in the project's normalized contracts (see docs/backend.md).
 * Accepts `parameters` as array or CSV string. `temporal` defaults to 'daily'.
 */
export async function fetchNasaPowerNormalized({ lat, lon, startDate, endDate, parameters = ['T2M'], temporal = 'daily', community = 'RE' } = {}) {
  if (typeof lat === 'undefined' || typeof lon === 'undefined') throw new Error('lat and lon required')
  function normalizeDate(d) {
    if (!d) return null
    if (typeof d !== 'string') return null
    const m = d.match(/^(-?\d{4})-(\d{2})-(\d{2})$/)
    if (m) return d
    const m2 = d.match(/^(\d{4})(\d{2})(\d{2})$/)
    if (m2) return `${m2[1]}-${m2[2]}-${m2[3]}`
    return null
  }

  const s = normalizeDate(startDate)
  const e = normalizeDate(endDate)
  if (!s || !e) throw new Error('Invalid start or end date for NASA POWER request; expected YYYY-MM-DD')

  const paramsArr = Array.isArray(parameters) ? parameters.slice() : String(parameters).split(',').map(p => p.trim()).filter(Boolean)
  if (paramsArr.length === 0) throw new Error('At least one parameter required')

  const paramsCsv = paramsArr.join(',')

  // For daily the API expects YYYYMMDD; for hourly it expects YYYYMMDDHH (UTC).
  function toPowerDateString(iso, temporalMode) {
    // Accept YYYY-MM-DD or full ISO string. Convert to Date in UTC then format.
    const d = new Date(iso)
    if (isNaN(d)) {
      // fallback: if already YYYYMMDD or YYYYMMDDHH provided, return as-is
      return String(iso)
    }
    const y = d.getUTCFullYear()
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
    const dd = String(d.getUTCDate()).padStart(2, '0')
    const hh = String(d.getUTCHours()).padStart(2, '0')
    if (temporalMode === 'hourly') return `${y}${mm}${dd}${hh}`
    return `${y}${mm}${dd}`
  }

  const startPower = toPowerDateString(s, temporal)
  const endPower = toPowerDateString(e, temporal)

  const url = `https://power.larc.nasa.gov/api/temporal/${encodeURIComponent(temporal)}/point?parameters=${encodeURIComponent(paramsCsv)}&community=${encodeURIComponent(community)}&start=${startPower}&end=${endPower}&latitude=${lat}&longitude=${lon}&format=JSON`

  const res = await fetch(url)
  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch (e) { json = { raw: text } }
  if (!res.ok) {
    const err = new Error(`NASA POWER error: ${res.status} ${res.statusText} - ${text}`)
    err.status = res.status
    err.body = text
    throw err
  }

  // Defensive extraction of parameter values for different POWER response shapes
  function extractValuesForParam(p) {
    // Common POWER shapes: json.properties.parameter[PARAM].values, or json.parameters[PARAM], or json[PARAM]
    try {
      if (json && json.properties && json.properties.parameter && json.properties.parameter[p]) {
        const node = json.properties.parameter[p]
        if (node.values && typeof node.values === 'object') return node.values
        if (node.data && typeof node.data === 'object') return node.data
        // if the node itself is a mapping of date->value
        if (typeof node === 'object') return node
      }
      if (json && json.parameters && json.parameters[p]) {
        const node = json.parameters[p]
        if (node.values && typeof node.values === 'object') return node.values
        if (typeof node === 'object') return node
      }
      if (json && json[p]) {
        const node = json[p]
        if (typeof node === 'object') return node
      }
    } catch (e) {
      // ignore and return null
    }
    return null
  }

  // helper to convert POWER date keys to ISO string
  function toISODate(key) {
    if (!key) return null
    // handle YYYYMMDD or YYYY-MM-DD
    const m = key.match(/^(\d{4})(\d{2})(\d{2})$/)
    if (m) return `${m[1]}-${m[2]}-${m[3]}T00:00:00Z`
    const m2 = key.match(/^(-?\d{4})-(\d{2})-(\d{2})/)
    if (m2) return `${m2[1]}-${m2[2]}-${m2[3]}T00:00:00Z`
    // fallback to Date parse
    const d = new Date(key)
    if (!isNaN(d)) return d.toISOString()
    return key
  }

  // small mapping for friendly names/units (extend as needed)
  const paramMap = {
    'T2M': { friendly: 'Air Temperature (2m)', units: 'C' },
    'PRECTOTCORR': { friendly: 'Precipitation', units: 'mm' },
    'ALLSKY_SFC_SW_DWN': { friendly: 'Shortwave Downward Radiation', units: 'W/m2' }
  }

  // Build normalized output
  const metaBase = { source: 'nasa_power', lat: Number(lat), lon: Number(lon), temporal }

  // If single parameter requested, return a time-series object
  if (paramsArr.length === 1) {
    const p = paramsArr[0]
  const valuesObj = extractValuesForParam(p)
    const data = []
    if (valuesObj && typeof valuesObj === 'object') {
      for (const [k, v] of Object.entries(valuesObj)) {
        data.push({ ts: toISODate(k), value: v === null ? null : Number(v) })
      }
      data.sort((a, b) => a.ts.localeCompare(b.ts))
    }
    const meta = Object.assign({}, metaBase, { parameter: p, friendly: (paramMap[p] && paramMap[p].friendly) || p, units: (paramMap[p] && paramMap[p].units) || null, datetime_range: { start: `${s}T00:00:00Z`, end: `${e}T00:00:00Z`, interval_minutes: temporal === 'hourly' ? 60 : 24 * 60 } })
    const out = { meta, data }
    out.meta.request_url = url
    // attach validation diagnostic if available
    try {
      const { validateNormalized } = await import('./validation.js')
      out.meta.validation = validateNormalized(out)
    } catch (vErr) {
      out.meta.validation = { valid: false, errors: [String(vErr.message || vErr)] }
    }
    return out
  }

  // Multi-parameter: build series map
  const series = {}
  for (const p of paramsArr) {
    const valuesObj = paramBlock && paramBlock[p]
    const data = []
    if (valuesObj && typeof valuesObj === 'object') {
      for (const [k, v] of Object.entries(valuesObj)) data.push({ ts: toISODate(k), value: v === null ? null : Number(v) })
      data.sort((a, b) => a.ts.localeCompare(b.ts))
    }
    series[p] = { friendly: (paramMap[p] && paramMap[p].friendly) || p, units: (paramMap[p] && paramMap[p].units) || null, data }
  }

  const out = { meta: Object.assign({}, metaBase, { datetime_range: { start: `${s}T00:00:00Z`, end: `${e}T00:00:00Z`, interval_minutes: temporal === 'hourly' ? 60 : 24 * 60 } }), series }
  out.meta.request_url = url
  try {
    const { validateNormalized } = await import('./validation.js')
    out.meta.validation = validateNormalized(out)
  } catch (vErr) {
    out.meta.validation = { valid: false, errors: [String(vErr.message || vErr)] }
  }
  return out
}
