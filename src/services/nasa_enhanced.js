/**
 * Enhanced NASA API Integration
 * Provides access to multiple NASA Earth observation and climate data APIs
 * Including: POWER, MODIS, Giovanni, GOES, and more
 */

// NASA POWER API (already implemented, but enhanced)
export { fetchNasaPowerNormalized, fetchNasaPower } from './nasa_power.js'

/**
 * NASA MODIS (Moderate Resolution Imaging Spectroradiometer) Data
 * Provides satellite imagery and earth observation data
 */
export async function fetchNasaModis({ lat, lon, startDate, endDate, product = 'MOD13Q1', band = 'NDVI' }) {
  // MODIS data via NASA's AppEEARS API or direct MODIS endpoints
  // This is a simplified implementation - in production you'd use proper MODIS APIs
  
  console.log('Fetching NASA MODIS data:', { lat, lon, startDate, endDate, product, band })
  
  // Mock MODIS data for demonstration
  await new Promise(r => setTimeout(r, 500))
  
  const days = getDaysBetween(startDate, endDate)
  const data = days.map(day => ({
    ts: `${day}T12:00:00Z`,
    value: product === 'MOD13Q1' && band === 'NDVI' 
      ? 0.3 + Math.random() * 0.4 + 0.2 * Math.sin((new Date(day).getTime() / (1000 * 60 * 60 * 24)) * 2 * Math.PI / 365)
      : Math.random() * 100
  }))
  
  return {
    meta: {
      source: 'nasa_modis',
      lat: Number(lat),
      lon: Number(lon),
      product,
      band,
      parameter: `${product}_${band}`,
      friendly: getModisParameterInfo(product, band).friendly,
      units: getModisParameterInfo(product, band).units,
      datetime_range: {
        start: `${startDate}T00:00:00Z`,
        end: `${endDate}T00:00:00Z`,
        interval_minutes: 24 * 60
      }
    },
    data
  }
}

/**
 * NASA Giovanni - Atmospheric and Climate Data
 * Provides access to satellite-based atmospheric measurements
 */
export async function fetchNasaGiovanni({ lat, lon, startDate, endDate, variable = 'AIRX3STD_006_Temperature_A', level = 'surface' }) {
  console.log('Fetching NASA Giovanni data:', { lat, lon, startDate, endDate, variable, level })
  
  // Mock Giovanni data
  await new Promise(r => setTimeout(r, 400))
  
  const days = getDaysBetween(startDate, endDate)
  const data = days.map(day => ({
    ts: `${day}T12:00:00Z`,
    value: variable.includes('Temperature') 
      ? 15 + Math.random() * 20 + 10 * Math.sin((new Date(day).getTime() / (1000 * 60 * 60 * 24)) * 2 * Math.PI / 365)
      : Math.random() * 50
  }))
  
  return {
    meta: {
      source: 'nasa_giovanni',
      lat: Number(lat),
      lon: Number(lon),
      variable,
      level,
      parameter: `${variable}_${level}`,
      friendly: getGiovanniParameterInfo(variable).friendly,
      units: getGiovanniParameterInfo(variable).units,
      datetime_range: {
        start: `${startDate}T00:00:00Z`,
        end: `${endDate}T00:00:00Z`,
        interval_minutes: 24 * 60
      }
    },
    data
  }
}

/**
 * NASA GOES (Geostationary Operational Environmental Satellite) Data
 * Provides real-time weather and atmospheric monitoring
 */
export async function fetchNasaGOES({ lat, lon, startDate, endDate, channel = 'C02', product = 'ABI-L1b-RadC' }) {
  console.log('Fetching NASA GOES data:', { lat, lon, startDate, endDate, channel, product })
  
  // Mock GOES data
  await new Promise(r => setTimeout(r, 300))
  
  const hours = getHoursBetween(startDate, endDate, 6) // 6-hour intervals for GOES
  const data = hours.map(hour => ({
    ts: hour,
    value: Math.random() * 300 + 200 // Brightness temperature or radiance
  }))
  
  return {
    meta: {
      source: 'nasa_goes',
      lat: Number(lat),
      lon: Number(lon),
      channel,
      product,
      parameter: `${product}_${channel}`,
      friendly: getGOESParameterInfo(channel).friendly,
      units: getGOESParameterInfo(channel).units,
      datetime_range: {
        start: `${startDate}T00:00:00Z`,
        end: `${endDate}T00:00:00Z`,
        interval_minutes: 6 * 60
      }
    },
    data
  }
}

/**
 * NASA Earthdata Search - General Earth observation data search
 */
export async function fetchNasaEarthdata({ lat, lon, startDate, endDate, collection = 'MODIS', datatype = 'temperature' }) {
  console.log('Fetching NASA Earthdata:', { lat, lon, startDate, endDate, collection, datatype })
  
  // This would typically use NASA's CMR (Common Metadata Repository) API
  // Mock implementation for demonstration
  await new Promise(r => setTimeout(r, 600))
  
  const days = getDaysBetween(startDate, endDate)
  const data = days.map(day => ({
    ts: `${day}T12:00:00Z`,
    value: Math.random() * 100,
    quality: Math.random() > 0.1 ? 'good' : 'fair' // Quality flag
  }))
  
  return {
    meta: {
      source: 'nasa_earthdata',
      lat: Number(lat),
      lon: Number(lon),
      collection,
      datatype,
      parameter: `${collection}_${datatype}`,
      friendly: `${collection} ${datatype}`,
      units: getEarthdataUnits(datatype),
      datetime_range: {
        start: `${startDate}T00:00:00Z`,
        end: `${endDate}T00:00:00Z`,
        interval_minutes: 24 * 60
      }
    },
    data
  }
}

/**
 * Unified NASA API caller - automatically selects best data source
 */
export async function fetchNasaData({ lat, lon, startDate, endDate, parameters = [], sources = ['power'] }) {
  const results = {}
  
  for (const source of sources) {
    try {
      switch (source.toLowerCase()) {
        case 'power':
          if (parameters.some(p => ['T2M', 'PRECTOTCORR', 'ALLSKY_SFC_SW_DWN'].includes(p))) {
            results.power = await fetchNasaPowerNormalized({
              lat, lon, startDate, endDate, 
              parameters: parameters.filter(p => ['T2M', 'PRECTOTCORR', 'ALLSKY_SFC_SW_DWN', 'WS2M'].includes(p)) || ['T2M']
            })
          }
          break
          
        case 'modis':
          if (parameters.some(p => p.includes('NDVI') || p.includes('EVI'))) {
            results.modis = await fetchNasaModis({ lat, lon, startDate, endDate, band: 'NDVI' })
          }
          break
          
        case 'giovanni':
          if (parameters.some(p => p.includes('atmospheric') || p.includes('aerosol'))) {
            results.giovanni = await fetchNasaGiovanni({ lat, lon, startDate, endDate })
          }
          break
          
        case 'goes':
          if (parameters.some(p => p.includes('radiance') || p.includes('brightness'))) {
            results.goes = await fetchNasaGOES({ lat, lon, startDate, endDate })
          }
          break
          
        case 'earthdata':
          results.earthdata = await fetchNasaEarthdata({ lat, lon, startDate, endDate })
          break
      }
    } catch (error) {
      console.warn(`Failed to fetch from ${source}:`, error)
      results[source] = { error: error.message }
    }
  }
  
  return {
    meta: {
      sources_requested: sources,
      lat: Number(lat),
      lon: Number(lon),
      datetime_range: {
        start: `${startDate}T00:00:00Z`,
        end: `${endDate}T00:00:00Z`
      }
    },
    results
  }
}

// Helper functions
function getDaysBetween(startDate, endDate) {
  const days = []
  const current = new Date(startDate)
  const end = new Date(endDate)
  
  while (current <= end) {
    days.push(current.toISOString().split('T')[0])
    current.setDate(current.getDate() + 1)
  }
  
  return days
}

function getHoursBetween(startDate, endDate, intervalHours = 1) {
  const hours = []
  const current = new Date(startDate)
  const end = new Date(endDate)
  
  while (current <= end) {
    hours.push(current.toISOString())
    current.setTime(current.getTime() + intervalHours * 60 * 60 * 1000)
  }
  
  return hours
}

function getModisParameterInfo(product, band) {
  const info = {
    'MOD13Q1_NDVI': { friendly: 'Normalized Difference Vegetation Index', units: 'index' },
    'MOD13Q1_EVI': { friendly: 'Enhanced Vegetation Index', units: 'index' },
    'MOD11A1_LST_Day': { friendly: 'Land Surface Temperature (Day)', units: 'K' },
    'MOD11A1_LST_Night': { friendly: 'Land Surface Temperature (Night)', units: 'K' }
  }
  
  return info[`${product}_${band}`] || { friendly: `${product} ${band}`, units: 'unknown' }
}

function getGiovanniParameterInfo(variable) {
  const info = {
    'AIRX3STD_006_Temperature_A': { friendly: 'Atmospheric Temperature', units: 'K' },
    'AIRX3STD_006_Humidity_A': { friendly: 'Atmospheric Humidity', units: '%' },
    'MERRA2_400_M2T1NXAER_TOTEXTTAU': { friendly: 'Aerosol Optical Thickness', units: 'unitless' }
  }
  
  return info[variable] || { friendly: variable, units: 'unknown' }
}

function getGOESParameterInfo(channel) {
  const info = {
    'C01': { friendly: 'Visible Blue', units: 'reflectance' },
    'C02': { friendly: 'Visible Red', units: 'reflectance' },
    'C07': { friendly: 'Shortwave IR', units: 'brightness_temperature' },
    'C13': { friendly: 'Clean Longwave IR', units: 'brightness_temperature' }
  }
  
  return info[channel] || { friendly: `Channel ${channel}`, units: 'unknown' }
}

function getEarthdataUnits(datatype) {
  const units = {
    'temperature': '°C',
    'precipitation': 'mm',
    'humidity': '%',
    'pressure': 'hPa',
    'wind_speed': 'm/s'
  }
  
  return units[datatype] || 'unknown'
}

// NASA API Configuration
export const NASA_APIS = {
  power: {
    name: 'NASA POWER',
    description: 'Meteorological and solar energy data from satellite and reanalysis',
    parameters: ['T2M', 'PRECTOTCORR', 'ALLSKY_SFC_SW_DWN', 'WS2M', 'RH2M', 'PS'],
    temporal_range: { min: '1981-01-01', max: 'present' },
    spatial_resolution: '0.5° x 0.625°'
  },
  modis: {
    name: 'MODIS',
    description: 'Moderate Resolution Imaging Spectroradiometer satellite data',
    parameters: ['NDVI', 'EVI', 'LST_Day', 'LST_Night'],
    temporal_range: { min: '2000-02-18', max: 'present' },
    spatial_resolution: '250m - 1km'
  },
  giovanni: {
    name: 'Giovanni',
    description: 'Atmospheric and climate satellite data analysis',
    parameters: ['Temperature_A', 'Humidity_A', 'TOTEXTTAU'],
    temporal_range: { min: '1979-01-01', max: 'present' },
    spatial_resolution: 'Various'
  },
  goes: {
    name: 'GOES',
    description: 'Geostationary weather satellite real-time data',
    parameters: ['C01', 'C02', 'C07', 'C13'],
    temporal_range: { min: '2017-01-01', max: 'present' },
    spatial_resolution: '0.5km - 2km'
  },
  earthdata: {
    name: 'Earthdata',
    description: 'NASA Earth science data from multiple missions',
    parameters: ['temperature', 'precipitation', 'vegetation', 'aerosols'],
    temporal_range: { min: '1979-01-01', max: 'present' },
    spatial_resolution: 'Various'
  }
}