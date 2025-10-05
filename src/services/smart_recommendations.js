/**
 * Smart Parameter Recommendation System
 * Provides intelligent suggestions based on location, season, and use case
 */

// Location-based parameter suggestions
export function getLocationBasedSuggestions(lat, lon) {
  const suggestions = {
    parameters: [],
    reasons: []
  }

  // Tropical regions (between 23.5°N and 23.5°S)
  if (Math.abs(lat) <= 23.5) {
    suggestions.parameters.push('power_PRECTOTCORR', 'power_RH2M', 'modis_NDVI')
    suggestions.reasons.push('High precipitation and humidity variability in tropical regions')
    suggestions.reasons.push('Vegetation monitoring important for tropical ecosystems')
  }

  // Arctic/Antarctic regions (above 66.5° or below -66.5°)
  if (Math.abs(lat) >= 66.5) {
    suggestions.parameters.push('power_T2M', 'modis_LST_Day', 'modis_LST_Night')
    suggestions.reasons.push('Extreme temperature variations in polar regions')
    suggestions.reasons.push('Land surface temperature critical for ice/snow analysis')
  }

  // Temperate regions (between 30° and 60°)
  if ((lat >= 30 && lat <= 60) || (lat >= -60 && lat <= -30)) {
    suggestions.parameters.push('power_T2M', 'power_PRECTOTCORR', 'power_WS2M')
    suggestions.reasons.push('Seasonal weather patterns important in temperate zones')
  }

  // Arid regions (specific longitude ranges and latitudes)
  if ((lat >= 15 && lat <= 35 && lon >= -20 && lon <= 50) || // North Africa, Middle East
      (lat >= -35 && lat <= -15 && lon >= 110 && lon <= 155)) { // Australia
    suggestions.parameters.push('power_ALLSKY_SFC_SW_DWN', 'power_T2M', 'modis_NDVI')
    suggestions.reasons.push('Solar radiation and temperature extremes in arid regions')
    suggestions.reasons.push('Vegetation stress monitoring in water-limited environments')
  }

  // Coastal regions (simplified check)
  // This would need more sophisticated coastline data in production
  suggestions.parameters.push('power_WS2M', 'power_RH2M')
  suggestions.reasons.push('Wind and humidity patterns affected by ocean proximity')

  return suggestions
}

// Seasonal parameter suggestions
export function getSeasonalSuggestions(date, lat) {
  const month = new Date(date).getMonth() + 1 // 1-12
  const isNorthern = lat > 0
  
  const suggestions = {
    parameters: [],
    reasons: []
  }

  // Determine season based on hemisphere
  let season
  if (isNorthern) {
    if (month >= 3 && month <= 5) season = 'spring'
    else if (month >= 6 && month <= 8) season = 'summer'
    else if (month >= 9 && month <= 11) season = 'autumn'
    else season = 'winter'
  } else {
    if (month >= 3 && month <= 5) season = 'autumn'
    else if (month >= 6 && month <= 8) season = 'winter'
    else if (month >= 9 && month <= 11) season = 'spring'
    else season = 'summer'
  }

  switch (season) {
    case 'spring':
      suggestions.parameters.push('modis_NDVI', 'power_T2M', 'power_PRECTOTCORR')
      suggestions.reasons.push('Spring vegetation growth monitoring')
      suggestions.reasons.push('Temperature warming trends and precipitation patterns')
      break
      
    case 'summer':
      suggestions.parameters.push('power_ALLSKY_SFC_SW_DWN', 'power_T2M', 'modis_LST_Day')
      suggestions.reasons.push('Peak solar radiation and temperature conditions')
      suggestions.reasons.push('Heat stress monitoring during hottest period')
      break
      
    case 'autumn':
      suggestions.parameters.push('modis_NDVI', 'power_WS2M', 'power_PRECTOTCORR')
      suggestions.reasons.push('Vegetation senescence and harvest monitoring')
      suggestions.reasons.push('Storm season and precipitation changes')
      break
      
    case 'winter':
      suggestions.parameters.push('power_T2M', 'modis_LST_Night', 'power_ALLSKY_SFC_SW_DWN')
      suggestions.reasons.push('Cold temperature extremes and frost monitoring')
      suggestions.reasons.push('Reduced solar radiation during shortest days')
      break
  }

  return suggestions
}

// Use case specific suggestions
export const USE_CASE_TEMPLATES = {
  agriculture: {
    name: '🌾 Agriculture & Farming',
    description: 'Monitor crop health, growing conditions, and agricultural productivity',
    sources: ['power', 'modis'],
    parameters: ['power_T2M', 'power_PRECTOTCORR', 'power_ALLSKY_SFC_SW_DWN', 'modis_NDVI', 'modis_EVI'],
    dateRange: 'growing_season',
    tips: [
      'Use NDVI to track crop growth and health over time',
      'Monitor temperature for frost risk and heat stress',
      'Track precipitation for irrigation planning',
      'Solar radiation data helps optimize planting schedules'
    ]
  },
  
  solar_energy: {
    name: '☀️ Solar Energy Assessment',
    description: 'Evaluate solar potential and energy generation conditions',
    sources: ['power', 'goes'],
    parameters: ['power_ALLSKY_SFC_SW_DWN', 'power_T2M', 'goes_C02', 'power_WS2M'],
    dateRange: 'annual',
    tips: [
      'Solar radiation data critical for energy yield estimates',
      'Temperature affects solar panel efficiency',
      'Wind speed helps with cooling considerations',
      'Cloud cover patterns from GOES satellite data'
    ]
  },

  weather_research: {
    name: '🌦️ Weather & Climate Research',
    description: 'Study atmospheric patterns, extreme events, and climate trends',
    sources: ['power', 'giovanni', 'goes'],
    parameters: ['power_T2M', 'power_PRECTOTCORR', 'power_WS2M', 'giovanni_Temperature_A', 'goes_C13'],
    dateRange: 'event_based',
    tips: [
      'Combine surface and atmospheric measurements',
      'Use multiple data sources for validation',
      'GOES provides real-time weather monitoring',
      'Giovanni offers atmospheric profile data'
    ]
  },

  environmental_monitoring: {
    name: '🌿 Environmental Monitoring',
    description: 'Track ecosystem health, vegetation changes, and environmental quality',
    sources: ['modis', 'giovanni', 'earthdata'],
    parameters: ['modis_NDVI', 'modis_LST_Day', 'giovanni_TOTEXTTAU', 'earthdata_vegetation'],
    dateRange: 'long_term',
    tips: [
      'NDVI tracks vegetation health and changes',
      'Land surface temperature indicates ecosystem stress',
      'Aerosol data shows air quality patterns',
      'Long-term trends reveal environmental changes'
    ]
  },

  disaster_response: {
    name: '🚨 Disaster Response & Monitoring',
    description: 'Monitor natural disasters, emergency conditions, and recovery',
    sources: ['goes', 'modis', 'power'],
    parameters: ['goes_C13', 'modis_LST_Day', 'power_WS2M', 'power_PRECTOTCORR'],
    dateRange: 'event_focused',
    tips: [
      'Real-time GOES data for immediate monitoring',
      'Land surface temperature for fire detection',
      'Wind patterns for fire spread and storm tracking',
      'Precipitation for flood monitoring'
    ]
  },

  urban_planning: {
    name: '🏙️ Urban Planning & Development',
    description: 'Assess urban climate, heat islands, and development impact',
    sources: ['modis', 'power'],
    parameters: ['modis_LST_Day', 'modis_LST_Night', 'power_T2M', 'power_ALLSKY_SFC_SW_DWN'],
    dateRange: 'seasonal',
    tips: [
      'Land surface temperature reveals urban heat islands',
      'Day/night temperature differences show urban effects',
      'Solar radiation for building energy planning',
      'Compare urban vs rural temperature patterns'
    ]
  }
}

// Generate smart recommendations based on multiple factors
export function generateSmartRecommendations({ lat, lon, startDate, endDate, currentSources = [], currentParameters = [] }) {
  const recommendations = {
    suggested_sources: [],
    suggested_parameters: [],
    use_cases: [],
    reasons: [],
    tips: []
  }

  // Get location-based suggestions
  const locationSuggestions = getLocationBasedSuggestions(lat, lon)
  
  // Get seasonal suggestions
  const seasonalSuggestions = getSeasonalSuggestions(startDate, lat)
  
  // Combine and deduplicate parameters
  const allSuggestedParams = [...locationSuggestions.parameters, ...seasonalSuggestions.parameters]
  const uniqueParams = [...new Set(allSuggestedParams)]
  
  // Filter out already selected parameters
  const newParams = uniqueParams.filter(p => !currentParameters.includes(p))
  
  recommendations.suggested_parameters = newParams.slice(0, 5) // Limit to top 5
  recommendations.reasons = [...locationSuggestions.reasons, ...seasonalSuggestions.reasons]
  
  // Suggest sources based on parameters
  const suggestedSources = new Set()
  newParams.forEach(param => {
    const source = param.split('_')[0]
    if (!currentSources.includes(source)) {
      suggestedSources.add(source)
    }
  })
  
  recommendations.suggested_sources = Array.from(suggestedSources)
  
  // Find matching use cases
  Object.entries(USE_CASE_TEMPLATES).forEach(([key, template]) => {
    const matchingParams = template.parameters.filter(p => newParams.includes(p))
    if (matchingParams.length >= 2) {
      recommendations.use_cases.push({
        key,
        name: template.name,
        description: template.description,
        match_score: matchingParams.length / template.parameters.length
      })
    }
  })
  
  // Sort use cases by match score
  recommendations.use_cases.sort((a, b) => b.match_score - a.match_score)
  
  // Add contextual tips
  if (Math.abs(lat) > 60) {
    recommendations.tips.push('💡 Polar regions: Focus on temperature extremes and ice/snow dynamics')
  }
  
  if (Math.abs(lat) < 30) {
    recommendations.tips.push('💡 Tropical regions: Vegetation and precipitation patterns are key indicators')
  }
  
  const dateRange = Math.abs(new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
  if (dateRange > 365) {
    recommendations.tips.push('💡 Long time series: Great for trend analysis and seasonal patterns')
  } else if (dateRange < 7) {
    recommendations.tips.push('💡 Short time series: Focus on real-time/recent conditions and events')
  }
  
  return recommendations
}

// Date range suggestions based on use case
export function getDateRangeSuggestions(useCase, currentDate = new Date()) {
  const suggestions = []
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  switch (useCase) {
    case 'agriculture':
      // Growing season suggestions
      suggestions.push({
        label: 'Current Growing Season',
        start: `${year}-04-01`,
        end: `${year}-10-31`,
        description: 'Full growing season for most crops'
      })
      suggestions.push({
        label: 'Last 30 Days',
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: currentDate.toISOString().split('T')[0],
        description: 'Recent crop conditions'
      })
      break
      
    case 'solar_energy':
      suggestions.push({
        label: 'Annual Assessment',
        start: `${year}-01-01`,
        end: `${year}-12-31`,
        description: 'Full year solar potential analysis'
      })
      suggestions.push({
        label: 'Summer Peak',
        start: `${year}-06-01`,
        end: `${year}-08-31`,
        description: 'Peak solar generation period'
      })
      break
      
    case 'weather_research':
      suggestions.push({
        label: 'Recent Weather Event',
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: currentDate.toISOString().split('T')[0],
        description: 'Last 7 days of weather data'
      })
      suggestions.push({
        label: 'Seasonal Analysis',
        start: `${year}-${String(month - 2).padStart(2, '0')}-01`,
        end: currentDate.toISOString().split('T')[0],
        description: '3-month seasonal pattern'
      })
      break
      
    default:
      suggestions.push({
        label: 'Last 30 Days',
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: currentDate.toISOString().split('T')[0],
        description: 'Recent month of data'
      })
  }
  
  return suggestions
}