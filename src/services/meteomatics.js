/**
 * Real Meteomatics API wrapper.
 * This function performs a direct request to https://api.meteomatics.com
 * and requires credentials either passed in the `username`/`password` args
 * or available via Vite env vars `VITE_METEO_USER` / `VITE_METEO_PASSWORD`.
 *
 * Throws on non-2xx responses with diagnostics.
 */
export async function fetchMeteomatics({ datetime, parameters, lat, lon, username, password, maxRetries = 2 } = {}) {
  if (!datetime || !parameters || typeof lat === 'undefined' || typeof lon === 'undefined') {
    throw new Error('Missing required parameters for fetchMeteomatics: datetime, parameters, lat, lon')
  }

  // Encode datetime safely
  // Meteomatics expects the datetime path segment to include ':' and '/' as meaningful separators
  // Avoid encoding the datetime segment. Encode parameter tokens but preserve ':' separators and commas.
  const safeEncodeParam = (p) => encodeURIComponent(p).replace(/%3A/g, ':')
  const encParameters = String(parameters).split(',').map(p => safeEncodeParam(p)).join(',')
  let url = `https://api.meteomatics.com/${datetime}/${encParameters}/${lat},${lon}/json`

  // Prefer explicit args, fallback to Vite env vars
  const user = username || import.meta.env.VITE_METEO_USER
  const pass = password || import.meta.env.VITE_METEO_PASSWORD

  if (!user || !pass) {
    throw new Error('Meteomatics credentials missing. Set username/password via args or VITE_METEO_USER/VITE_METEO_PASSWORD env vars')
  }

  const headers = {
    'Authorization': 'Basic ' + btoa(`${user}:${pass}`)
  }

  // Attempt fetch with simple exponential backoff for transient errors (network errors or 5xx)
  let attempt = 0
  let lastErr = null
  while (attempt <= maxRetries) {
    try {
      console.log('Meteomatics URL:', url)
      const res = await fetch(url, { headers })
      const bodyText = await res.text()
      let json = null
      try { json = JSON.parse(bodyText) } catch (e) { json = { raw: bodyText } }

      // Attach request URL to returned payload for debugging
      json.meta = json.meta || {}
      json.meta.request_url = url

      if (!res.ok) {
        const msg = `Meteomatics request failed: ${res.status} ${res.statusText} - ${bodyText}`
        // Retry on server errors
        if (res.status >= 500 && attempt < maxRetries) {
          lastErr = new Error(msg)
          const wait = 500 * Math.pow(2, attempt)
          await new Promise(r => setTimeout(r, wait))
          attempt++
          continue
        }
        // If we received a 400 / Incorrect URL, it may be due to unsupported parameter tokens.
        // Let the caller's higher-level fallback (e.g., fetchMeteomaticsWithFallback) attempt parameter normalization.
        throw new Error(msg)
      }

      return json
    } catch (err) {
      lastErr = err
      // treat network errors as retryable
      if (attempt < maxRetries) {
        const wait = 500 * Math.pow(2, attempt)
        await new Promise(r => setTimeout(r, wait))
        attempt++
        continue
      }
      throw lastErr
    }
  }
  throw lastErr
}

export async function fetchMeteomaticsWithFallback({ datetime, parameters, lat, lon, username, password } = {}) {
  if (!parameters) throw new Error('parameters required')
  // normalize parameters to array
  let params = Array.isArray(parameters) ? parameters.slice() : String(parameters).split(',').map(s => s.trim()).filter(Boolean)
  const dropped = []

  while (params.length > 0) {
    try {
      const res = await fetchMeteomatics({ datetime, parameters: params.join(','), lat, lon, username, password })
      // ensure meta exists and attach dropped info
      res.meta = res.meta || {}
      res.meta.droppedParameters = dropped
      return res
    } catch (err) {
      // try to parse parameter name from the error message
      const msg = String(err.message || '')

      // If Meteomatics returns an 'Incorrect URL' / 400 error, some parameter tokens
      // (particularly ones containing slashes or unusual unit tokens) may not be accepted.
      // Try a simple fallback: strip unit suffixes (everything after ':'), retry once.
      if ((/Incorrect URL/i.test(msg) || /400 Bad Request/i.test(msg) || /Incorrect parameter/i.test(msg)) && params.some(p => p.includes(':'))) {
        const stripped = params.map(p => p.split(':')[0])
        // only try this fallback if it actually changes the params
        if (stripped.join(',') !== params.join(',')) {
          // record which parameters were changed (for diagnostics)
          // don't mark them as dropped - we are simply trying a normalized token set
          params = stripped
          // loop and retry
          continue
        }
      }

      const m = msg.match(/Parameter\s+([^\s,]+)\s+not available/i)
      if (m && m[1]) {
        const paramName = m[1].trim()
        // remove this param and retry
        const idx = params.findIndex(p => p === paramName)
        if (idx !== -1) {
          dropped.push(paramName)
          params.splice(idx, 1)
          // loop and retry
          continue
        }
        // If not found exact match, try to remove by suffix match
        const idx2 = params.findIndex(p => p.endsWith(paramName))
        if (idx2 !== -1) {
          dropped.push(params[idx2])
          params.splice(idx2, 1)
          continue
        }
      }
      // Could not handle the error; rethrow
      throw err
    }
  }

  throw new Error('All requested parameters were unavailable for the selected model/time')
}
