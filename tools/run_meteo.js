// Simple script to call Meteomatics API using VITE_METEO_USER / VITE_METEO_PASSWORD from env
// Prints status and a truncated JSON response. Does NOT print credentials.
(async () => {
  try {
    const user = process.env.VITE_METEO_USER
    const pass = process.env.VITE_METEO_PASSWORD
    if (!user || !pass) {
      console.error('ERROR: VITE_METEO_USER and/or VITE_METEO_PASSWORD are not set in the environment.')
      process.exit(2)
    }

    const start = '2025-07-01'
    const end = '2025-07-31'
    const datetime = `${start}T00:00:00Z--${end}T00:00:00Z:PT24H`
  const parameters = 't_2m:C,precip_1h:mm,wind_speed_10m:ms'
    const lat = 35.6895
    const lon = 139.6917
    const url = `https://api.meteomatics.com/${encodeURI(datetime)}/${encodeURI(parameters)}/${lat},${lon}/json`

    const auth = 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64')

    console.log('Requesting:', url)
    const res = await fetch(url, { headers: { Authorization: auth } })
    console.log('Status:', res.status, res.statusText)
    const bodyText = await res.text()
    // Try parse JSON
    try {
      const json = JSON.parse(bodyText)
      const out = JSON.stringify(json, null, 2)
      if (out.length > 3000) {
        console.log(out.slice(0, 3000))
        console.log('\n...response truncated (too long to display)')
      } else {
        console.log(out)
      }
    } catch (e) {
      console.log('Non-JSON response (truncated):')
      if (bodyText.length > 2000) console.log(bodyText.slice(0, 2000) + '\n...truncated')
      else console.log(bodyText)
    }
  } catch (err) {
    console.error('Request failed:', err.message)
    process.exit(1)
  }
})()
