import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Polygon, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { geocodeNominatim } from '../services/geocode'

function ClickHandler({ setSelection }) {
  useMapEvents({
    click(e) {
      setSelection({ lat: e.latlng.lat, lon: e.latlng.lng })
    },
  })
  return null
}

export default function MapSelector({ selection, setSelection }) {
  // Provide sensible defaults if selection is not yet set
  const lat0 = selection && typeof selection.lat === 'number' ? selection.lat : 37.7749
  const lon0 = selection && typeof selection.lon === 'number' ? selection.lon : -122.4194
  const position = [lat0, lon0]
  const samplePoly = [
    [lat0 + 0.05, lon0 - 0.05],
    [lat0 + 0.05, lon0 + 0.05],
    [lat0 - 0.05, lon0 + 0.05],
    [lat0 - 0.05, lon0 - 0.05],
  ]

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const searchRef = useRef()

  useEffect(() => {
    // keep input focused after mount for convenience
    if (searchRef.current) searchRef.current.focus()
  }, [])

  async function doSearch(q) {
    if (!q) return setResults([])
    setLoading(true)
    try {
      const res = await geocodeNominatim(q, 6)
      setResults(res || [])
    } catch (err) {
      console.error('Geocode error', err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  function selectResult(r) {
    const lat = parseFloat(r.lat)
    const lon = parseFloat(r.lon)
    setSelection({ lat, lon })
    setResults([])
    setQuery(r.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`)
  }

  function onMarkerDrag(e) {
    const { lat, lng } = e.target.getLatLng()
    setSelection({ lat, lon: lng })
  }

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <div style={{ position: 'absolute', left: 12, top: 12, zIndex: 500, width: 320 }}>
        <div style={{ background: 'rgba(255,255,255,0.95)', padding: 8, borderRadius: 6, boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input ref={searchRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') doSearch(query) }} placeholder="Search place or address" style={{ flex: 1, padding: '6px 8px' }} />
            <button className="btn" onClick={() => doSearch(query)} disabled={loading} style={{ whiteSpace: 'nowrap' }}>{loading ? 'Searching...' : 'Search'}</button>
          </div>
          {results.length > 0 && (
            <div style={{ maxHeight: 220, overflow: 'auto', marginTop: 8 }}>
              {results.map(r => (
                <div key={r.place_id} onClick={() => selectResult(r)} style={{ padding: 6, borderBottom: '1px solid #eee', cursor: 'pointer' }}>{r.display_name}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      <MapContainer center={position} zoom={8} style={{ height: '100%', minHeight: 480 }}>
        {/* Use Carto Voyager tiles (neutral, English labels) to avoid locale-specific labels */}
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors &copy; CARTO" />
        <Marker position={position} draggable={true} eventHandlers={{ dragend: onMarkerDrag }} />
        <Polygon positions={samplePoly} pathOptions={{ color: 'orange' }} />
        <ClickHandler setSelection={setSelection} />
      </MapContainer>

      <div style={{ position: 'absolute', right: 12, bottom: 12, zIndex: 500, background: 'rgba(255,255,255,0.9)', padding: 8, borderRadius: 6 }}>
        <div style={{ fontSize: 12 }}>Lat: {lat0.toFixed(4)}</div>
        <div style={{ fontSize: 12 }}>Lon: {lon0.toFixed(4)}</div>
      </div>
    </div>
  )
}
