// Expanded mapping of internal keys => Meteomatics parameter codes, labels, and units.
// This is not exhaustive of every Meteomatics variable, but includes a broad set of commonly used ones.
export const METEO_PARAMS = {
  temperature: { code: 't_2m:C', label: 'Air temperature (2m)', unit: '°C', description: 'Ambient air temperature measured at 2 meters above ground. Important for comfort, crop growth, and weather analysis.' },
  dew_point: { code: 'dew_point_2m:C', label: 'Dew point (2m)', unit: '°C', description: 'Temperature at which air becomes saturated with moisture. Indicates humidity and risk of condensation or frost.' },
  precipitation: { code: 'precip_1h:mm', label: 'Precipitation', unit: 'mm', description: 'Total precipitation (rain, snow, etc.) in the last hour. Useful for storm tracking and water management.' },
  precipitation_total: { code: 'precip_total:mm', label: 'Precipitation total', unit: 'mm', description: 'Cumulative precipitation over a period. Key for agriculture, hydrology, and flood risk.' },
  precipitation_rate: { code: 'precip_rate:mm/h', label: 'Precipitation rate', unit: 'mm/h', description: 'Rate of precipitation per hour. Indicates storm intensity and rainfall events.' },
  wind: { code: 'wind_speed_10m:ms', label: 'Wind speed (10m)', unit: 'm/s', description: 'Average wind speed at 10 meters above ground. Important for energy, transport, and weather safety.' },
  wind_gust: { code: 'wind_gust_10m:ms', label: 'Wind gust (10m)', unit: 'm/s', description: 'Maximum wind gusts at 10 meters. Critical for safety in sports, aviation, and construction.' },
  wind_dir: { code: 'wind_direction_10m:d', label: 'Wind direction (10m)', unit: '°', description: 'Direction from which the wind is blowing at 10 meters. Used for navigation, aviation, and weather analysis.' },
  u_wind: { code: 'u_component_of_wind_10m:ms', label: 'U wind comp (10m)', unit: 'm/s', description: 'East-west component of wind at 10 meters. Used in advanced weather and transport modeling.' },
  v_wind: { code: 'v_component_of_wind_10m:ms', label: 'V wind comp (10m)', unit: 'm/s', description: 'North-south component of wind at 10 meters. Used in advanced weather and transport modeling.' },
  humidity: { code: 'relative_humidity_2m:p', label: 'Relative humidity (2m)', unit: '%', description: 'Percentage of moisture in the air at 2 meters. Affects comfort, health, and crop growth.' },
  cloud_cover: { code: 'cloud_cover:p', label: 'Cloud cover', unit: '%', description: 'Fraction of sky covered by clouds. Impacts solar energy, aviation, and weather forecasting.' },
  pressure: { code: 'mean_sea_level_pressure:Pa', label: 'Mean sea level pressure', unit: 'Pa', description: 'Atmospheric pressure reduced to sea level. Used for weather systems and storm tracking.' },
  surface_pressure: { code: 'surface_pressure:Pa', label: 'Surface pressure', unit: 'Pa', description: 'Atmospheric pressure at ground level. Useful for local weather and altitude effects.' },
  solar_radiation: { code: 'shortwave_radiation_flux_density:W/m2', label: 'Shortwave radiation', unit: 'W/m2', description: 'Incoming solar energy at the surface. Key for solar power, agriculture, and UV exposure.' },
  longwave_radiation: { code: 'longwave_radiation_flux:W/m2', label: 'Longwave radiation', unit: 'W/m2', description: 'Outgoing thermal radiation from the surface. Used in energy balance and climate studies.' },
  visibility: { code: 'visibility:m', label: 'Visibility', unit: 'm', description: 'Distance at which objects can be clearly seen. Critical for transport, aviation, and safety.' },
  snow_depth: { code: 'snow_depth:mm', label: 'Snow depth', unit: 'mm', description: 'Depth of snow cover. Important for winter sports, hydrology, and risk management.' },
  snow_rate: { code: 'snow_rate:mm/h', label: 'Snow rate', unit: 'mm/h', description: 'Rate of snowfall per hour. Used for storm tracking and winter operations.' },
  soil_temp_0cm: { code: 'soil_temperature_0cm:C', label: 'Soil temp (0cm)', unit: '°C', description: 'Temperature at the soil surface. Affects planting, germination, and groundworks.' },
  soil_temp_5cm: { code: 'soil_temperature_5cm:C', label: 'Soil temp (5cm)', unit: '°C', description: 'Temperature at 5cm depth. Used for crop and soil health monitoring.' },
  soil_moisture_0_10cm: { code: 'soil_moisture_0_10cm:m3/m3', label: 'Soil moisture 0-10cm', unit: 'm3/m3', description: 'Volumetric soil moisture in the top 10cm. Key for irrigation, planting, and drought monitoring.' },
  evapotranspiration: { code: 'evapotranspiration:mm', label: 'Evapotranspiration', unit: 'mm', description: 'Combined water loss from soil and plants. Used for irrigation planning and water balance.' },
  potential_evapotranspiration: { code: 'potential_evapotranspiration:mm', label: 'Potential evapotranspiration', unit: 'mm', description: 'Maximum possible evapotranspiration under ideal conditions. Used for crop water requirement estimates.' },
  ground_heat_flux: { code: 'ground_heat_flux:W/m2', label: 'Ground heat flux', unit: 'W/m2', description: 'Heat transfer into or out of the ground. Relevant for soil temperature and energy studies.' },
  direct_radiation: { code: 'direct_radiation:W/m2', label: 'Direct radiation', unit: 'W/m2', description: 'Direct solar radiation at the surface. Used for solar energy and climate modeling.' },
  diffuse_radiation: { code: 'diffuse_radiation:W/m2', label: 'Diffuse radiation', unit: 'W/m2', description: 'Scattered solar radiation. Important for total solar input and plant growth.' },
  air_density: { code: 'air_density:kg/m3', label: 'Air density', unit: 'kg/m3', description: 'Density of air at ground level. Used in wind energy, aviation, and pollutant dispersion.' },
  convective_precip: { code: 'convective_precipitation:mm', label: 'Convective precipitation', unit: 'mm', description: 'Precipitation from convective storms. Indicates risk of flash flooding and severe weather.' },
  total_cloud_cover: { code: 'total_cloud_cover:p', label: 'Total cloud cover', unit: '%', description: 'Total fraction of sky covered by clouds. Used for solar energy and weather forecasting.' }
}

// Reverse mapping helper: attempt to match a returned parameter token to an internal key.
export function paramTokenToKey(paramToken) {
  if (!paramToken) return null
  const base = paramToken.split(':')[0]
  for (const [key, v] of Object.entries(METEO_PARAMS)) {
    if (v.code.split(':')[0] === base) return key
  }
  // If no direct match found, try simple contains match
  for (const [key, v] of Object.entries(METEO_PARAMS)) {
    if (paramToken.includes(v.code.split(':')[0])) return key
  }
  return null
}

// Common use-case presets mapping to internal variable keys
export const PRESETS = {
  Agriculture: ['temperature', 'precipitation', 'soil_moisture_0_10cm', 'evapotranspiration', 'dew_point'],
  Energy: ['solar_radiation', 'wind', 'wind_gust', 'temperature'],
  'Aquatic Sports': ['wind', 'precipitation', 'temperature', 'visibility', 'solar_radiation'],
  Aviation: ['wind', 'wind_dir', 'visibility', 'cloud_cover', 'precipitation'],
  'Supply Chain': ['visibility', 'precipitation', 'temperature', 'pressure'],
  Health: ['temperature', 'humidity', 'solar_radiation']
}

// Concrete Meteomatics parameter tokens (codes) for each use-case preset.
// Use METEO_PARAMS codes when possible; fall back to common tokens from the wider parameter list.
export const USECASE_PARAMS = {
  Agriculture: [
    METEO_PARAMS.temperature.code,
    METEO_PARAMS.precipitation.code,
    METEO_PARAMS.soil_moisture_0_10cm.code,
    METEO_PARAMS.evapotranspiration.code,
    METEO_PARAMS.dew_point.code
  ],
  Energy: [
    METEO_PARAMS.solar_radiation.code,
    METEO_PARAMS.wind.code,
    METEO_PARAMS.wind_gust.code,
    METEO_PARAMS.temperature.code,
    // useful additional metrics for energy
    'global_rad:W',
    'global_rad_00h:J'
  ],
  'Aquatic Sports': [
    METEO_PARAMS.wind.code,
    METEO_PARAMS.wind_gust.code,
    METEO_PARAMS.precipitation.code,
    METEO_PARAMS.temperature.code,
    METEO_PARAMS.visibility.code,
    // wave parameters removed; point API may not accept ocean wave tokens for all locations
  ],
  Aviation: [
    METEO_PARAMS.wind.code,
    METEO_PARAMS.wind_dir.code,
    METEO_PARAMS.visibility.code,
    METEO_PARAMS.cloud_cover.code,
    METEO_PARAMS.precipitation.code,
    'ceiling_height_agl:m',
    'icing_potential_000hPa:idx'
  ],
  'Supply Chain': [
    METEO_PARAMS.visibility.code,
    METEO_PARAMS.precipitation.code,
    METEO_PARAMS.temperature.code,
    METEO_PARAMS.pressure.code,
    'prob_slippery_road_00h:p',
    'wind_speed_10m_00d_efi:idx'
  ],
  Health: [
    METEO_PARAMS.temperature.code,
    METEO_PARAMS.humidity.code,
    METEO_PARAMS.solar_radiation.code,
    'air_quality:idx',
    'pm2p5:ugm3',
    'pm10:ugm3'
  ]
}


