import React from 'react'
import { unparse } from 'papaparse'

function download(filename, content, type = 'application/json') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function ExportPanel({ data, user }) {
  const disabled = !data || !user
  function exportJSON() {
    if (!data) return
    download('results.json', JSON.stringify(data, null, 2), 'application/json')
  }

  function exportCSV() {
    // Flatten some data into rows for CSV
    if (!data) return
    const rows = []
    (data.data || []).forEach(param => {
      (param.coordinates || []).forEach(coord => {
        (coord.dates || []).forEach(d => rows.push({ parameter: param.parameter, lat: coord.lat, lon: coord.lon, date: d.date, value: d.value }))
      })
    })
    const csv = unparse(rows)
    download('results.csv', csv, 'text/csv')
  }

  return (
    <div style={{ marginTop: 12 }}>
      <h4>Export</h4>
      {!user && <div style={{ marginBottom: 8, color: '#7a4e04' }}>Login or register to enable data export and advanced features.</div>}
      <button className="btn" onClick={exportJSON} style={{ marginRight: 8 }} disabled={disabled}>Download JSON</button>
      <button className="btn" onClick={exportCSV} disabled={disabled}>Download CSV</button>
    </div>
  )
}
