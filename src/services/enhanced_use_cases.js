/**
 * Enhanced Use Case System with NASA API Integration
 * Maps specific use cases to appropriate NASA APIs and parameters
 */

// Use case definitions with NASA API mappings
export const ENHANCED_USE_CASES = {
  'agriculture': {
    name: '🌾 Agriculture & Farming',
    description: 'Monitor crop conditions, soil moisture, and weather patterns for agricultural planning',
    icon: '🌾',
    category: 'Environmental',
    nasaApis: ['power', 'earthdata', 'modis'],
    parameters: {
      essential: [
        { api: 'power', param: 'T2M', label: 'Air Temperature', unit: '°C', priority: 1 },
        { api: 'power', param: 'PRECTOTCORR', label: 'Precipitation', unit: 'mm/day', priority: 1 },
        { api: 'power', param: 'RH2M', label: 'Relative Humidity', unit: '%', priority: 2 },
        { api: 'modis', param: 'NDVI', label: 'Vegetation Index', unit: 'index', priority: 1 },
        { api: 'power', param: 'ALLSKY_SFC_SW_DWN', label: 'Solar Irradiance', unit: 'kWh/m²/day', priority: 2 }
      ],
      optional: [
        { api: 'power', param: 'WS2M', label: 'Wind Speed', unit: 'm/s', priority: 3 },
        { api: 'modis', param: 'LST_Day', label: 'Land Surface Temperature (Day)', unit: '°C', priority: 3 },
        { api: 'power', param: 'T2M_MIN', label: 'Min Temperature', unit: '°C', priority: 3 },
        { api: 'power', param: 'T2M_MAX', label: 'Max Temperature', unit: '°C', priority: 3 }
      ]
    },
    dateRecommendations: {
      singleDate: 'Use for current conditions assessment',
      dateRange: 'Recommended: 30-90 days for seasonal analysis'
    },
    insights: [
      'Monitor growing degree days for crop development',
      'Track precipitation patterns for irrigation planning',
      'Assess vegetation health using NDVI trends',
      'Evaluate solar radiation for photosynthesis potential'
    ]
  },

  'aquatic-sports': {
    name: '🏄 Aquatic Sports & Recreation',
    description: 'Weather conditions for water sports, fishing, and coastal activities',
    icon: '🏄',
    category: 'Recreation',
    nasaApis: ['power', 'modis'],
    parameters: {
      essential: [
        { api: 'power', param: 'WS2M', label: 'Wind Speed', unit: 'm/s', priority: 1 },
        { api: 'power', param: 'T2M', label: 'Air Temperature', unit: '°C', priority: 1 },
        { api: 'power', param: 'PRECTOTCORR', label: 'Precipitation', unit: 'mm/day', priority: 1 },
        { api: 'modis', param: 'LST_Day', label: 'Surface Temperature', unit: '°C', priority: 2 }
      ],
      optional: [
        { api: 'power', param: 'RH2M', label: 'Humidity', unit: '%', priority: 3 },
        { api: 'power', param: 'ALLSKY_SFC_SW_DWN', label: 'Solar Radiation', unit: 'kWh/m²/day', priority: 3 },
        { api: 'power', param: 'WD2M', label: 'Wind Direction', unit: 'degrees', priority: 2 }
      ]
    },
    dateRecommendations: {
      singleDate: 'Perfect for planning today\'s activities',
      dateRange: 'Use 7-14 days for trip planning'
    },
    insights: [
      'Optimal wind conditions: 10-25 km/h for most water sports',
      'Monitor precipitation for visibility and safety',
      'Temperature affects comfort and gear selection',
      'Wind direction impacts wave conditions near shore'
    ]
  },

  'energy-solar': {
    name: '☀️ Solar Energy Planning',
    description: 'Solar irradiance and weather patterns for renewable energy assessment',
    icon: '☀️',
    category: 'Energy',
    nasaApis: ['power', 'modis'],
    parameters: {
      essential: [
        { api: 'power', param: 'ALLSKY_SFC_SW_DWN', label: 'Solar Irradiance (All Sky)', unit: 'kWh/m²/day', priority: 1 },
        { api: 'power', param: 'CLRSKY_SFC_SW_DWN', label: 'Solar Irradiance (Clear Sky)', unit: 'kWh/m²/day', priority: 1 },
        { api: 'power', param: 'T2M', label: 'Air Temperature', unit: '°C', priority: 2 },
        { api: 'modis', param: 'Cloud_Fraction', label: 'Cloud Cover', unit: '%', priority: 1 }
      ],
      optional: [
        { api: 'power', param: 'WS2M', label: 'Wind Speed', unit: 'm/s', priority: 3 },
        { api: 'power', param: 'RH2M', label: 'Humidity', unit: '%', priority: 3 },
        { api: 'power', param: 'PRECTOTCORR', label: 'Precipitation', unit: 'mm/day', priority: 3 }
      ]
    },
    dateRecommendations: {
      singleDate: 'For real-time solar assessment',
      dateRange: 'Recommended: 1 year for annual energy potential'
    },
    insights: [
      'Peak solar hours typically 10 AM - 4 PM local time',
      'Cloud cover significantly reduces solar output',
      'Temperature affects panel efficiency (cooler is better)',
      'Seasonal variations impact energy production planning'
    ]
  },

  'energy-wind': {
    name: '💨 Wind Energy Assessment',
    description: 'Wind patterns and speeds for wind energy site evaluation',
    icon: '💨',
    category: 'Energy',
    nasaApis: ['power'],
    parameters: {
      essential: [
        { api: 'power', param: 'WS2M', label: 'Wind Speed (2m)', unit: 'm/s', priority: 1 },
        { api: 'power', param: 'WS10M', label: 'Wind Speed (10m)', unit: 'm/s', priority: 1 },
        { api: 'power', param: 'WD2M', label: 'Wind Direction (2m)', unit: 'degrees', priority: 1 },
        { api: 'power', param: 'WD10M', label: 'Wind Direction (10m)', unit: 'degrees', priority: 1 }
      ],
      optional: [
        { api: 'power', param: 'T2M', label: 'Temperature', unit: '°C', priority: 3 },
        { api: 'power', param: 'PS', label: 'Surface Pressure', unit: 'kPa', priority: 3 }
      ]
    },
    dateRecommendations: {
      singleDate: 'Current wind assessment',
      dateRange: 'Recommended: 1+ years for wind resource assessment'
    },
    insights: [
      'Wind speeds 3-25 m/s optimal for turbines',
      'Consistent wind direction improves efficiency',
      'Seasonal patterns affect annual energy yield',
      'Higher altitudes generally have stronger winds'
    ]
  },

  'climate-research': {
    name: '🌡️ Climate Research',
    description: 'Comprehensive climate data for research and analysis',
    icon: '🌡️',
    category: 'Research',
    nasaApis: ['power', 'modis', 'earthdata'],
    parameters: {
      essential: [
        { api: 'power', param: 'T2M', label: 'Temperature', unit: '°C', priority: 1 },
        { api: 'power', param: 'PRECTOTCORR', label: 'Precipitation', unit: 'mm/day', priority: 1 },
        { api: 'power', param: 'RH2M', label: 'Humidity', unit: '%', priority: 1 },
        { api: 'modis', param: 'LST_Day', label: 'Land Surface Temp (Day)', unit: '°C', priority: 1 },
        { api: 'modis', param: 'LST_Night', label: 'Land Surface Temp (Night)', unit: '°C', priority: 1 }
      ],
      optional: [
        { api: 'power', param: 'WS2M', label: 'Wind Speed', unit: 'm/s', priority: 2 },
        { api: 'power', param: 'ALLSKY_SFC_SW_DWN', label: 'Solar Radiation', unit: 'kWh/m²/day', priority: 2 },
        { api: 'modis', param: 'NDVI', label: 'Vegetation Index', unit: 'index', priority: 2 },
        { api: 'modis', param: 'EVI', label: 'Enhanced Vegetation Index', unit: 'index', priority: 3 }
      ]
    },
    dateRecommendations: {
      singleDate: 'Snapshot analysis',
      dateRange: 'Multi-year ranges for trend analysis'
    },
    insights: [
      'Long-term datasets reveal climate trends',
      'Compare seasonal and annual variations',
      'Land surface temperature shows urban heat effects',
      'Vegetation indices indicate ecosystem health'
    ]
  },

  'urban-planning': {
    name: '🏙️ Urban Planning',
    description: 'Environmental data for city planning and development',
    icon: '🏙️',
    category: 'Planning',
    nasaApis: ['power', 'modis'],
    parameters: {
      essential: [
        { api: 'modis', param: 'LST_Day', label: 'Urban Heat (Day)', unit: '°C', priority: 1 },
        { api: 'modis', param: 'LST_Night', label: 'Urban Heat (Night)', unit: '°C', priority: 1 },
        { api: 'power', param: 'T2M', label: 'Air Temperature', unit: '°C', priority: 1 },
        { api: 'modis', param: 'NDVI', label: 'Green Space Index', unit: 'index', priority: 1 }
      ],
      optional: [
        { api: 'power', param: 'PRECTOTCORR', label: 'Precipitation', unit: 'mm/day', priority: 2 },
        { api: 'power', param: 'WS2M', label: 'Wind Speed', unit: 'm/s', priority: 2 },
        { api: 'power', param: 'RH2M', label: 'Humidity', unit: '%', priority: 3 }
      ]
    },
    dateRecommendations: {
      singleDate: 'Current urban conditions',
      dateRange: 'Seasonal analysis for planning cycles'
    },
    insights: [
      'Urban heat island effects visible in LST data',
      'NDVI shows green space distribution',
      'Temperature differences guide development planning',
      'Wind patterns affect air quality and comfort'
    ]
  },

  'disaster-monitoring': {
    name: '🚨 Natural Disaster Monitoring',
    description: 'Early warning and impact assessment for natural disasters',
    icon: '🚨',
    category: 'Safety',
    nasaApis: ['power', 'modis', 'earthdata'],
    parameters: {
      essential: [
        { api: 'power', param: 'PRECTOTCORR', label: 'Extreme Precipitation', unit: 'mm/day', priority: 1 },
        { api: 'power', param: 'WS2M', label: 'Wind Speed', unit: 'm/s', priority: 1 },
        { api: 'power', param: 'T2M', label: 'Temperature Extremes', unit: '°C', priority: 1 },
        { api: 'modis', param: 'LST_Day', label: 'Heat Events', unit: '°C', priority: 1 }
      ],
      optional: [
        { api: 'modis', param: 'NDVI', label: 'Vegetation Stress', unit: 'index', priority: 2 },
        { api: 'power', param: 'RH2M', label: 'Humidity', unit: '%', priority: 3 },
        { api: 'power', param: 'PS', label: 'Pressure Systems', unit: 'kPa', priority: 2 }
      ]
    },
    dateRecommendations: {
      singleDate: 'Current threat assessment',
      dateRange: 'Historical analysis for risk patterns'
    },
    insights: [
      'Extreme precipitation indicates flood risk',
      'High winds signal storm intensity',
      'Temperature extremes affect heat/cold emergencies',
      'Vegetation stress shows drought impact'
    ]
  },

  'aviation': {
    name: '✈️ Aviation Weather',
    description: 'Flight planning and aviation weather conditions',
    icon: '✈️',
    category: 'Transportation',
    nasaApis: ['power'],
    parameters: {
      essential: [
        { api: 'power', param: 'WS2M', label: 'Surface Wind Speed', unit: 'm/s', priority: 1 },
        { api: 'power', param: 'WD2M', label: 'Wind Direction', unit: 'degrees', priority: 1 },
        { api: 'power', param: 'T2M', label: 'Temperature', unit: '°C', priority: 1 },
        { api: 'power', param: 'PRECTOTCORR', label: 'Precipitation', unit: 'mm/day', priority: 1 }
      ],
      optional: [
        { api: 'power', param: 'RH2M', label: 'Humidity', unit: '%', priority: 2 },
        { api: 'power', param: 'PS', label: 'Barometric Pressure', unit: 'kPa', priority: 2 },
        { api: 'power', param: 'ALLSKY_SFC_SW_DWN', label: 'Visibility Factor', unit: 'kWh/m²/day', priority: 3 }
      ]
    },
    dateRecommendations: {
      singleDate: 'Flight day conditions',
      dateRange: '7-14 days for flight planning'
    },
    insights: [
      'Crosswinds affect takeoff and landing safety',
      'Temperature impacts aircraft performance',
      'Precipitation reduces visibility and creates hazards',
      'Pressure changes indicate weather system movement'
    ]
  }
};

// Get use case by key
export function getUseCase(key) {
  return ENHANCED_USE_CASES[key] || null;
}

// Get all use cases in a category
export function getUseCasesByCategory(category) {
  return Object.entries(ENHANCED_USE_CASES)
    .filter(([key, useCase]) => useCase.category === category)
    .map(([key, useCase]) => ({ key, ...useCase }));
}

// Get all categories
export function getCategories() {
  const categories = new Set();
  Object.values(ENHANCED_USE_CASES).forEach(useCase => {
    categories.add(useCase.category);
  });
  return Array.from(categories).sort();
}

// Get recommended parameters for a use case
export function getRecommendedParameters(useCaseKey, includeOptional = false) {
  const useCase = ENHANCED_USE_CASES[useCaseKey];
  if (!useCase) return [];
  
  let params = [...useCase.parameters.essential];
  if (includeOptional) {
    params = [...params, ...useCase.parameters.optional];
  }
  
  return params.sort((a, b) => a.priority - b.priority);
}

// Get NASA APIs needed for a use case
export function getRequiredNasaApis(useCaseKey) {
  const useCase = ENHANCED_USE_CASES[useCaseKey];
  return useCase ? useCase.nasaApis : [];
}

// Smart parameter suggestions based on location and use case
export function getLocationAwareParameters(useCaseKey, lat, lon) {
  const baseParams = getRecommendedParameters(useCaseKey, true);
  const suggestions = [];
  
  // Add location-specific logic
  if (Math.abs(lat) > 60) {
    // Polar regions - emphasize temperature
    suggestions.push('Temperature monitoring is critical in polar regions');
    baseParams.filter(p => p.param.includes('T2M')).forEach(p => p.priority -= 1);
  }
  
  if (Math.abs(lat) < 30) {
    // Tropical regions - emphasize precipitation and humidity
    suggestions.push('High precipitation variability in tropical regions');
    baseParams.filter(p => p.param.includes('PREC') || p.param.includes('RH')).forEach(p => p.priority -= 1);
  }
  
  // Coastal regions (simplified detection)
  if (Math.abs(lon) > 120 || Math.abs(lon) < 30) {
    suggestions.push('Coastal location - wind patterns important');
    baseParams.filter(p => p.param.includes('WS') || p.param.includes('WD')).forEach(p => p.priority -= 1);
  }
  
  return {
    parameters: baseParams.sort((a, b) => a.priority - b.priority),
    suggestions
  };
}

// Generate insights for selected parameters and use case
export function generateUseCaseInsights(useCaseKey, selectedParams, location, dateRange) {
  const useCase = ENHANCED_USE_CASES[useCaseKey];
  if (!useCase) return [];
  
  const insights = [...useCase.insights];
  
  // Add parameter-specific insights
  selectedParams.forEach(param => {
    switch(param.param) {
      case 'T2M':
        insights.push(`Temperature range affects ${useCase.name.toLowerCase()} operations significantly`);
        break;
      case 'PRECTOTCORR':
        insights.push(`Precipitation patterns are crucial for ${useCase.name.toLowerCase()} planning`);
        break;
      case 'WS2M':
        insights.push(`Wind conditions directly impact ${useCase.name.toLowerCase()} activities`);
        break;
      case 'NDVI':
        insights.push('Vegetation health indicates environmental conditions');
        break;
    }
  });
  
  return insights.slice(0, 6); // Limit to 6 insights
}

export default ENHANCED_USE_CASES;