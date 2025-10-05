/** Nominatim geocoding helper (no API key required for basic usage) */
export async function geocodeNominatim(q, limit = 5) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=${limit}`
  const res = await fetch(url, { headers: { 'User-Agent': 'nasa-meteo-dashboard/1.0' } })
  if (!res.ok) throw new Error('Geocoding failed')
  return res.json()
}
