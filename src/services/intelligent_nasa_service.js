/**
 * Enhanced NASA API Service with Intelligent Use Case Mapping
 * Automatically selects and calls appropriate NASA APIs based on use cases
 */

import { fetchNasaPowerNormalized } from './nasa_power';
import { fetchNasaData } from './nasa_enhanced';

// NASA API endpoint configurations
const NASA_APIS = {
  power: {
    name: 'NASA POWER',
    description: 'Meteorological and solar data for renewable energy applications',
    baseUrl: 'https://power.larc.nasa.gov/api/temporal/daily/point',
    supportedParams: [
      'T2M', 'T2M_MAX', 'T2M_MIN', 'PRECTOTCORR', 'WS2M', 'WS10M', 
      'WD2M', 'WD10M', 'RH2M', 'PS', 'ALLSKY_SFC_SW_DWN', 'CLRSKY_SFC_SW_DWN'
    ],
    parameterGroups: ['meteorology', 'solar'],
    maxDateRange: 366, // days
    realTimeDelay: 1 // days
  },
  
  modis: {
    name: 'MODIS Earth Observations',
    description: 'Land surface temperature, vegetation, and cloud data',
    supportedParams: [
      'LST_Day', 'LST_Night', 'NDVI', 'EVI', 'Cloud_Fraction',
      'Albedo_WSA_shortwave', 'Emis_31', 'Emis_32'
    ],
    parameterGroups: ['land_surface', 'vegetation', 'atmosphere'],
    maxDateRange: 365,
    realTimeDelay: 2
  },

  earthdata: {
    name: 'NASA Earthdata',
    description: 'Comprehensive Earth science datasets',
    supportedParams: [
      'precipitation', 'soil_moisture', 'snow_depth', 'sea_ice_extent',
      'aerosol_optical_depth', 'fire_radiative_power'
    ],
    parameterGroups: ['hydrology', 'cryosphere', 'atmosphere'],
    maxDateRange: 1095,
    realTimeDelay: 7
  }
};

// Parameter mapping between use cases and NASA API parameters
const PARAMETER_MAPPING = {
  // NASA POWER parameters
  'T2M': {
    api: 'power',
    group: 'meteorology',
    unit: '°C',
    description: 'Temperature at 2 meters above ground',
    typical_range: [-50, 50],
    quality_flags: ['good', 'fair', 'poor']
  },
  'PRECTOTCORR': {
    api: 'power',
    group: 'meteorology', 
    unit: 'mm/day',
    description: 'Bias-corrected precipitation',
    typical_range: [0, 100],
    quality_flags: ['good', 'fair']
  },
  'WS2M': {
    api: 'power',
    group: 'meteorology',
    unit: 'm/s',
    description: 'Wind speed at 2 meters',
    typical_range: [0, 30],
    quality_flags: ['good', 'fair']
  },
  'RH2M': {
    api: 'power',
    group: 'meteorology',
    unit: '%',
    description: 'Relative humidity at 2 meters',
    typical_range: [0, 100],
    quality_flags: ['good', 'fair']
  },
  'ALLSKY_SFC_SW_DWN': {
    api: 'power',
    group: 'solar',
    unit: 'kWh/m²/day',
    description: 'All sky surface shortwave downward irradiance',
    typical_range: [0, 12],
    quality_flags: ['good', 'fair', 'poor']
  },
  'CLRSKY_SFC_SW_DWN': {
    api: 'power',
    group: 'solar',
    unit: 'kWh/m²/day', 
    description: 'Clear sky surface shortwave downward irradiance',
    typical_range: [0, 12],
    quality_flags: ['good', 'fair']
  },

  // MODIS parameters
  'NDVI': {
    api: 'modis',
    group: 'vegetation',
    unit: 'index',
    description: 'Normalized Difference Vegetation Index',
    typical_range: [-0.3, 1.0],
    quality_flags: ['good', 'marginal', 'poor']
  },
  'LST_Day': {
    api: 'modis',
    group: 'land_surface',
    unit: '°C',
    description: 'Land surface temperature during day',
    typical_range: [-50, 70],
    quality_flags: ['good', 'fair', 'poor']
  },
  'LST_Night': {
    api: 'modis',
    group: 'land_surface', 
    unit: '°C',
    description: 'Land surface temperature during night',
    typical_range: [-50, 70],
    quality_flags: ['good', 'fair', 'poor']
  }
};

/**
 * Intelligent NASA API selector based on use case and parameters
 */
export class IntelligentNASAService {
  constructor() {
    this.cache = new Map();
    this.requestQueue = [];
    this.isProcessing = false;
  }

  /**
   * Get optimal NASA APIs for a use case
   */
  getOptimalAPIs(useCaseKey, parameters = []) {
    const requiredAPIs = new Set();
    const apiSupport = {};

    // Check which APIs support the required parameters
    parameters.forEach(param => {
      const paramInfo = PARAMETER_MAPPING[param.param || param];
      if (paramInfo) {
        requiredAPIs.add(paramInfo.api);
        if (!apiSupport[paramInfo.api]) {
          apiSupport[paramInfo.api] = [];
        }
        apiSupport[paramInfo.api].push(param);
      }
    });

    return {
      apis: Array.from(requiredAPIs),
      distribution: apiSupport,
      recommendations: this.getAPIRecommendations(useCaseKey, Array.from(requiredAPIs))
    };
  }

  /**
   * Get API-specific recommendations
   */
  getAPIRecommendations(useCaseKey, apis) {
    const recommendations = [];

    apis.forEach(api => {
      const apiInfo = NASA_APIS[api];
      if (!apiInfo) return;

      const rec = {
        api: api,
        name: apiInfo.name,
        strengths: [],
        limitations: [],
        bestFor: []
      };

      switch (api) {
        case 'power':
          rec.strengths = ['High temporal resolution', 'Global coverage', 'Weather data'];
          rec.limitations = ['Limited real-time data', 'Point data only'];
          rec.bestFor = ['Energy analysis', 'Meteorological studies', 'Agriculture'];
          break;

        case 'modis':
          rec.strengths = ['High spatial resolution', 'Vegetation monitoring', 'Land surface data'];
          rec.limitations = ['Cloud contamination', 'Temporal gaps'];
          rec.bestFor = ['Vegetation analysis', 'Urban heat islands', 'Land cover studies'];
          break;

        case 'earthdata':
          rec.strengths = ['Comprehensive datasets', 'Long time series', 'Research quality'];
          rec.limitations = ['Complex data access', 'Processing required'];
          rec.bestFor = ['Climate research', 'Hydrology', 'Disaster monitoring'];
          break;
      }

      recommendations.push(rec);
    });

    return recommendations;
  }

  /**
   * Fetch data with intelligent API selection and optimization
   */
  async fetchIntelligentData({
    location,
    dateRange, 
    parameters,
    useCaseKey,
    onProgress = null,
    quality = 'standard' // 'fast', 'standard', 'comprehensive'
  }) {
    const { apis, distribution } = this.getOptimalAPIs(useCaseKey, parameters);
    
    if (apis.length === 0) {
      throw new Error('No suitable NASA APIs found for the selected parameters');
    }

    const results = {
      metadata: {
        location,
        dateRange,
        requestedParameters: parameters.length,
        usedAPIs: apis,
        quality,
        timestamp: new Date().toISOString()
      },
      data: {},
      quality_info: {},
      recommendations: this.getAPIRecommendations(useCaseKey, apis)
    };

    // Process APIs in parallel with progress tracking
    const apiPromises = apis.map(async (api, index) => {
      if (onProgress) {
        onProgress({
          stage: `fetching_${api}`,
          progress: (index / apis.length) * 100,
          message: `Fetching data from NASA ${api.toUpperCase()}...`
        });
      }

      try {
        const apiData = await this.fetchFromAPI(api, {
          location,
          dateRange,
          parameters: distribution[api] || [],
          quality
        });

        results.data[api] = apiData.data;
        results.quality_info[api] = apiData.quality_info;

        if (onProgress) {
          onProgress({
            stage: `completed_${api}`,
            progress: ((index + 1) / apis.length) * 100,
            message: `Completed NASA ${api.toUpperCase()}`
          });
        }

      } catch (error) {
        console.error(`Error fetching from NASA ${api}:`, error);
        results.data[api] = { error: error.message };
        results.quality_info[api] = { status: 'error', message: error.message };
      }
    });

    await Promise.all(apiPromises);

    // Post-process and enhance data
    results.processed = this.postProcessData(results, useCaseKey);
    results.insights = this.generateDataInsights(results, useCaseKey, location);

    // Format data for Charts component compatibility
    results.chartData = this.formatDataForCharts(results);

    return results;
  }

  /**
   * Fetch data from specific NASA API
   */
  async fetchFromAPI(api, options) {
    const cacheKey = `${api}_${JSON.stringify(options)}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    let result;

    switch (api) {
      case 'power':
        result = await this.fetchPowerData(options);
        break;
        
      case 'modis':
        result = await this.fetchModisData(options);
        break;
        
      case 'earthdata':
        result = await this.fetchEarthdataData(options);
        break;
        
      default:
        throw new Error(`Unsupported API: ${api}`);
    }

    // Cache result for 5 minutes
    this.cache.set(cacheKey, result);
    setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000);

    return result;
  }

  /**
   * Fetch NASA POWER data
   */
  async fetchPowerData({ location, dateRange, parameters, quality }) {
    try {
      const powerParams = parameters
        .filter(p => PARAMETER_MAPPING[p.param]?.api === 'power')
        .map(p => p.param);

      if (powerParams.length === 0) {
        return { data: {}, quality_info: { status: 'no_parameters' } };
      }

      const data = await fetchNasaPowerNormalized({
        lat: location.lat,
        lon: location.lon,
        startDate: dateRange.start,
        endDate: dateRange.end,
        parameters: powerParams,
        community: 'ag', // Agriculture community for broader parameter access
        format: 'json'
      });

      return {
        data: data,
        quality_info: {
          status: 'success',
          api: 'NASA POWER',
          parameters: powerParams.length,
          temporal_coverage: this.calculateTemporalCoverage(data),
          data_quality: this.assessPowerDataQuality(data)
        }
      };

    } catch (error) {
      throw new Error(`NASA POWER API error: ${error.message}`);
    }
  }

  /**
   * Fetch MODIS data (simulated for now - would connect to actual MODIS API)
   */
  async fetchModisData({ location, dateRange, parameters, quality }) {
    // This is a placeholder implementation
    // In a real app, you'd connect to NASA's MODIS API or use a service like Google Earth Engine
    
    const modisParams = parameters
      .filter(p => PARAMETER_MAPPING[p.param]?.api === 'modis')
      .map(p => p.param);

    if (modisParams.length === 0) {
      return { data: {}, quality_info: { status: 'no_parameters' } };
    }

    // Simulate MODIS data generation
    const data = this.generateSimulatedModisData(location, dateRange, modisParams);

    return {
      data: data,
      quality_info: {
        status: 'simulated',
        api: 'MODIS',
        parameters: modisParams.length,
        note: 'This is simulated MODIS data. Real implementation would use NASA MODIS API.',
        spatial_resolution: '1km',
        temporal_resolution: '8-day composite'
      }
    };
  }

  /**
   * Fetch NASA Earthdata (placeholder)
   */
  async fetchEarthdataData({ location, dateRange, parameters, quality }) {
    // Placeholder for NASA Earthdata integration
    return {
      data: {},
      quality_info: {
        status: 'not_implemented',
        api: 'NASA Earthdata',
        note: 'NASA Earthdata integration coming soon'
      }
    };
  }

  /**
   * Generate simulated MODIS data for demo purposes
   */
  generateSimulatedModisData(location, dateRange, parameters) {
    const data = {};
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    parameters.forEach(param => {
      data[param] = {};
      
      for (let i = 0; i < daysDiff; i += 8) { // 8-day composites for MODIS
        const currentDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        const dateStr = currentDate.toISOString().split('T')[0];
        
        let value;
        switch (param) {
          case 'NDVI':
            // Simulate seasonal NDVI variation
            const dayOfYear = this.getDayOfYear(currentDate);
            const seasonalFactor = 0.3 + 0.4 * Math.sin((dayOfYear - 80) * Math.PI / 182.5);
            value = Math.max(0.1, seasonalFactor + (Math.random() - 0.5) * 0.2);
            break;
            
          case 'LST_Day':
            // Simulate temperature based on latitude and season
            const basTemp = 20 - Math.abs(location.lat) * 0.6;
            const seasonalTemp = 10 * Math.sin((this.getDayOfYear(currentDate) - 80) * Math.PI / 182.5);
            value = basTemp + seasonalTemp + (Math.random() - 0.5) * 5;
            break;
            
          case 'LST_Night':
            const dayTemp = data['LST_Day']?.[dateStr] || 15;
            value = dayTemp - 8 - Math.random() * 4;
            break;
            
          default:
            value = Math.random() * 100;
        }
        
        data[param][dateStr] = parseFloat(value.toFixed(3));
      }
    });

    return data;
  }

  /**
   * Post-process combined data
   */
  postProcessData(results, useCaseKey) {
    const processed = {
      combined_metrics: {},
      derived_indicators: {},
      anomalies: [],
      trends: {}
    };

    // Combine data from multiple APIs
    const allData = Object.values(results.data).reduce((acc, apiData) => {
      return { ...acc, ...apiData };
    }, {});

    // Calculate derived metrics based on use case
    switch (useCaseKey) {
      case 'agriculture':
        processed.derived_indicators = this.calculateAgricultureIndicators(allData);
        break;
        
      case 'energy-solar':
        processed.derived_indicators = this.calculateSolarEnergyIndicators(allData);
        break;
        
      case 'energy-wind':
        processed.derived_indicators = this.calculateWindEnergyIndicators(allData);
        break;
        
      default:
        processed.derived_indicators = this.calculateBasicIndicators(allData);
    }

    return processed;
  }

  /**
   * Calculate agriculture-specific indicators
   */
  calculateAgricultureIndicators(data) {
    const indicators = {};

    if (data.T2M && data.PRECTOTCORR) {
      // Growing Degree Days (base 10°C)
      const gdd = Object.entries(data.T2M).reduce((acc, [date, temp]) => {
        acc[date] = Math.max(0, temp - 10);
        return acc;
      }, {});
      indicators.growing_degree_days = gdd;

      // Water stress indicator
      const waterStress = Object.entries(data.PRECTOTCORR).reduce((acc, [date, precip]) => {
        const temp = data.T2M[date] || 20;
        acc[date] = precip < 5 && temp > 25 ? 'high' : 
                   precip < 10 && temp > 20 ? 'moderate' : 'low';
        return acc;
      }, {});
      indicators.water_stress = waterStress;
    }

    return indicators;
  }

  /**
   * Calculate solar energy indicators
   */
  calculateSolarEnergyIndicators(data) {
    const indicators = {};

    if (data.ALLSKY_SFC_SW_DWN) {
      // Daily solar potential (kWh/m²)
      indicators.daily_solar_potential = data.ALLSKY_SFC_SW_DWN;

      // Monthly averages
      const monthlyAvg = this.calculateMonthlyAverages(data.ALLSKY_SFC_SW_DWN);
      indicators.monthly_solar_avg = monthlyAvg;

      // Peak sun hours (assuming standard test conditions)
      const peakSunHours = Object.entries(data.ALLSKY_SFC_SW_DWN).reduce((acc, [date, irradiance]) => {
        acc[date] = irradiance / 1000; // Convert to peak sun hours
        return acc;
      }, {});
      indicators.peak_sun_hours = peakSunHours;
    }

    return indicators;
  }

  /**
   * Calculate wind energy indicators
   */
  calculateWindEnergyIndicators(data) {
    const indicators = {};

    if (data.WS2M || data.WS10M) {
      const windSpeed = data.WS10M || data.WS2M;
      
      // Wind power density calculation (simplified)
      const windPowerDensity = Object.entries(windSpeed).reduce((acc, [date, speed]) => {
        // Power density = 0.5 * air_density * wind_speed^3 (simplified)
        // Using standard air density of 1.225 kg/m³
        acc[date] = 0.5 * 1.225 * Math.pow(speed, 3);
        return acc;
      }, {});
      indicators.wind_power_density = windPowerDensity;

      // Capacity factor estimation (very simplified)
      const capacityFactor = Object.entries(windSpeed).reduce((acc, [date, speed]) => {
        // Simplified capacity factor based on wind speed
        if (speed < 3) acc[date] = 0; // Cut-in speed
        else if (speed > 25) acc[date] = 0; // Cut-out speed
        else if (speed >= 12) acc[date] = 1; // Rated speed
        else acc[date] = Math.pow(speed / 12, 3); // Cubic relationship
        return acc;
      }, {});
      indicators.capacity_factor = capacityFactor;

      // Wind speed statistics
      const speeds = Object.values(windSpeed);
      indicators.wind_statistics = {
        mean_speed: speeds.reduce((sum, val) => sum + val, 0) / speeds.length,
        max_speed: Math.max(...speeds),
        min_speed: Math.min(...speeds)
      };
    }

    return indicators;
  }

  /**
   * Calculate basic indicators for general use cases
   */
  calculateBasicIndicators(data) {
    const indicators = {};

    // Temperature statistics
    if (data.T2M) {
      const temps = Object.values(data.T2M);
      indicators.temperature_stats = {
        mean: temps.reduce((sum, val) => sum + val, 0) / temps.length,
        max: Math.max(...temps),
        min: Math.min(...temps),
        range: Math.max(...temps) - Math.min(...temps)
      };
    }

    // Precipitation statistics  
    if (data.PRECTOTCORR) {
      const precip = Object.values(data.PRECTOTCORR);
      indicators.precipitation_stats = {
        total: precip.reduce((sum, val) => sum + val, 0),
        mean_daily: precip.reduce((sum, val) => sum + val, 0) / precip.length,
        max_daily: Math.max(...precip),
        wet_days: precip.filter(val => val > 1).length
      };
    }

    // Wind statistics
    if (data.WS2M) {
      const winds = Object.values(data.WS2M);
      indicators.wind_stats = {
        mean_speed: winds.reduce((sum, val) => sum + val, 0) / winds.length,
        max_speed: Math.max(...winds),
        calm_days: winds.filter(val => val < 2).length
      };
    }

    return indicators;
  }

  /**
   * Generate data insights based on results and use case
   */
  generateDataInsights(results, useCaseKey, location) {
    const insights = [];

    // Data quality insights
    const qualityIssues = Object.values(results.quality_info)
      .filter(qi => qi.status === 'error' || qi.data_quality === 'poor')
      .length;

    if (qualityIssues > 0) {
      insights.push({
        type: 'warning',
        title: 'Data Quality Issues',
        message: `${qualityIssues} API(s) returned poor quality or error data. Results may be incomplete.`,
        impact: 'medium'
      });
    }

    // Location-specific insights
    if (Math.abs(location.lat) > 60) {
      insights.push({
        type: 'info',
        title: 'Polar Region Data',
        message: 'High latitude location may have seasonal data gaps, especially for solar parameters.',
        impact: 'low'
      });
    }

    // Use case specific insights
    const processed = results.processed;
    if (processed?.derived_indicators) {
      const indicators = processed.derived_indicators;
      
      if (indicators.water_stress) {
        const highStressDays = Object.values(indicators.water_stress)
          .filter(stress => stress === 'high').length;
        
        if (highStressDays > 5) {
          insights.push({
            type: 'alert',
            title: 'High Water Stress Detected',
            message: `${highStressDays} days show high water stress conditions for agriculture.`,
            impact: 'high'
          });
        }
      }

      if (indicators.peak_sun_hours) {
        const avgPeakSun = Object.values(indicators.peak_sun_hours)
          .reduce((sum, val) => sum + val, 0) / Object.keys(indicators.peak_sun_hours).length;
        
        if (avgPeakSun > 6) {
          insights.push({
            type: 'positive',
            title: 'Excellent Solar Potential',
            message: `Average ${avgPeakSun.toFixed(1)} peak sun hours per day - ideal for solar energy.`,
            impact: 'high'
          });
        }
      }
    }

    return insights;
  }

  /**
   * Helper methods
   */
  getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  calculateMonthlyAverages(data) {
    const monthly = {};
    Object.entries(data).forEach(([date, value]) => {
      const month = date.substring(0, 7); // YYYY-MM
      if (!monthly[month]) monthly[month] = [];
      monthly[month].push(value);
    });

    return Object.entries(monthly).reduce((acc, [month, values]) => {
      acc[month] = values.reduce((sum, val) => sum + val, 0) / values.length;
      return acc;
    }, {});
  }

  calculateTemporalCoverage(data) {
    if (!data || Object.keys(data).length === 0) return 0;
    
    const firstParam = Object.values(data)[0];
    if (!firstParam || typeof firstParam !== 'object') return 0;
    
    return Object.keys(firstParam).length;
  }

  assessPowerDataQuality(data) {
    if (!data || Object.keys(data).length === 0) return 'no_data';
    
    let totalPoints = 0;
    let validPoints = 0;

    Object.values(data).forEach(paramData => {
      if (typeof paramData === 'object') {
        Object.values(paramData).forEach(value => {
          totalPoints++;
          if (value !== null && value !== undefined && !isNaN(value)) {
            validPoints++;
          }
        });
      }
    });

    const coverage = validPoints / totalPoints;
    return coverage > 0.9 ? 'good' : coverage > 0.7 ? 'fair' : 'poor';
  }

  /**
   * Format data for Charts component compatibility
   * Converts NASA API data to the format expected by Charts.jsx
   */
  formatDataForCharts(results) {
    if (!results || !results.data) {
      console.warn('No results data provided to formatDataForCharts');
      return { data: [], meta: {} };
    }

    const chartData = {
      data: [],
      meta: {
        source: 'intelligent_nasa_service',
        apis_used: results.metadata?.usedAPIs || [],
        timestamp: results.metadata?.timestamp,
        location: results.metadata?.location
      }
    };

    console.log('Formatting chart data from:', Object.keys(results.data));

    // Process each API's data
    Object.entries(results.data).forEach(([apiName, apiData]) => {
      if (!apiData || typeof apiData !== 'object') return;

      // Handle NASA POWER normalized data structure
      if (apiData.series) {
        // Multi-parameter response from fetchNasaPowerNormalized
        Object.entries(apiData.series).forEach(([param, paramInfo]) => {
          if (paramInfo.data && Array.isArray(paramInfo.data)) {
            const series = {
              parameter: param,
              coordinates: [{
                lat: results.metadata.location.lat,
                lon: results.metadata.location.lon,
                dates: paramInfo.data.map(item => ({
                  date: item.ts ? item.ts.split('T')[0] : item.date,
                  value: item.value
                }))
              }]
            };
            chartData.data.push(series);
          }
        });
      } else if (apiData.data && Array.isArray(apiData.data)) {
        // Single-parameter response from fetchNasaPowerNormalized
        const series = {
          parameter: apiData.meta?.parameter || 'unknown',
          coordinates: [{
            lat: results.metadata.location.lat,
            lon: results.metadata.location.lon,
            dates: apiData.data.map(item => ({
              date: item.ts ? item.ts.split('T')[0] : item.date,
              value: item.value
            }))
          }]
        };
        chartData.data.push(series);
      } else {
        // Handle raw parameter data (key-value pairs)
        Object.entries(apiData).forEach(([param, values]) => {
          if (typeof values === 'object' && values !== null) {
            const series = {
              parameter: param,
              coordinates: [{
                lat: results.metadata.location.lat,
                lon: results.metadata.location.lon,
                dates: Object.entries(values).map(([date, value]) => ({
                  date: date,
                  value: value
                }))
              }]
            };
            chartData.data.push(series);
          }
        });
      }
    });

    return chartData;
  }
}

// Create singleton instance
export const intelligentNASAService = new IntelligentNASAService();

// Export utility functions
export { PARAMETER_MAPPING, NASA_APIS };

export default intelligentNASAService;