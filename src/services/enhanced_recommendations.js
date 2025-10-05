/**
 * Enhanced Smart Recommendations Engine
 * Provides intelligent suggestions for parameters, use cases, and data analysis
 * based on location, date range, and user context
 */

import { ENHANCED_USE_CASES, getLocationAwareParameters } from './enhanced_use_cases';
import { PARAMETER_MAPPING } from './intelligent_nasa_service';

export class EnhancedRecommendationEngine {
  constructor() {
    this.locationCache = new Map();
    this.seasonalPatterns = this.initializeSeasonalPatterns();
    this.useCaseFrequency = new Map(); // Track popular use cases
  }

  /**
   * Get comprehensive recommendations based on location and context
   */
  async getSmartRecommendations({
    location,
    dateRange = null,
    selectedUseCase = null,
    userPreferences = null,
    historical_usage = null
  }) {
    const recommendations = {
      location_insights: await this.getLocationInsights(location),
      use_case_suggestions: this.getUseCaseSuggestions(location, dateRange, userPreferences),
      parameter_recommendations: this.getParameterRecommendations(location, dateRange, selectedUseCase),
      temporal_insights: this.getTemporalInsights(dateRange, location),
      data_optimization_tips: this.getDataOptimizationTips(location, dateRange, selectedUseCase),
      similar_locations: this.getSimilarLocations(location),
      seasonal_patterns: this.getSeasonalPatterns(location, dateRange)
    };

    // Add personalized recommendations if user preferences available
    if (userPreferences) {
      recommendations.personalized = this.getPersonalizedRecommendations(
        location, 
        userPreferences, 
        historical_usage
      );
    }

    return recommendations;
  }

  /**
   * Get location-specific insights and characteristics
   */
  async getLocationInsights(location) {
    const cacheKey = `${location.lat.toFixed(2)}_${location.lon.toFixed(2)}`;
    
    if (this.locationCache.has(cacheKey)) {
      return this.locationCache.get(cacheKey);
    }

    const insights = {
      climate_zone: this.determineClimateZone(location),
      geographic_features: this.identifyGeographicFeatures(location),
      environmental_factors: this.analyzeEnvironmentalFactors(location),
      data_availability: this.assessDataAvailability(location),
      recommended_use_cases: this.getLocationBasedUseCases(location),
      special_considerations: this.getSpecialConsiderations(location)
    };

    // Cache for 1 hour
    this.locationCache.set(cacheKey, insights);
    setTimeout(() => this.locationCache.delete(cacheKey), 60 * 60 * 1000);

    return insights;
  }

  /**
   * Determine climate zone based on location
   */
  determineClimateZone(location) {
    const { lat, lon } = location;
    const absLat = Math.abs(lat);

    if (absLat >= 66.5) {
      return {
        zone: 'Polar',
        characteristics: ['Extreme cold', 'Midnight sun/polar night', 'Permafrost possible'],
        icon: '🧊',
        color: '#e3f2fd'
      };
    } else if (absLat >= 60) {
      return {
        zone: 'Subarctic',
        characteristics: ['Long cold winters', 'Short mild summers', 'Boreal forests'],
        icon: '🌲',
        color: '#e8f5e8'
      };
    } else if (absLat >= 40) {
      return {
        zone: 'Temperate',
        characteristics: ['Four distinct seasons', 'Moderate precipitation', 'Mixed forests'],
        icon: '🍂',
        color: '#fff3e0'
      };
    } else if (absLat >= 23.5) {
      return {
        zone: 'Subtropical',
        characteristics: ['Warm summers', 'Mild winters', 'Variable precipitation'],
        icon: '🌳',
        color: '#f3e5f5'
      };
    } else {
      return {
        zone: 'Tropical',
        characteristics: ['Consistently warm', 'High humidity', 'Monsoon patterns possible'],
        icon: '🌴',
        color: '#e0f2f1'
      };
    }
  }

  /**
   * Identify geographic features that affect weather patterns
   */
  identifyGeographicFeatures(location) {
    const { lat, lon } = location;
    const features = [];

    // Coastal detection (simplified)
    const coastalRanges = [
      { latMin: -90, latMax: 90, lonMin: -180, lonMax: -170, name: 'Pacific Coast' },
      { latMin: -90, latMax: 90, lonMin: 170, lonMax: 180, name: 'Pacific Coast' },
      { latMin: -90, latMax: 90, lonMin: -10, lonMax: 10, name: 'Atlantic Coast' },
    ];

    // Mountain regions (simplified major ranges)
    const mountainRanges = [
      { latMin: 25, latMax: 50, lonMin: -125, lonMax: -100, name: 'Rocky Mountains', elevation: 'high' },
      { latMin: 40, latMax: 55, lonMin: -10, lonMax: 20, name: 'European Alps', elevation: 'high' },
      { latMin: 25, latMax: 40, lonMin: 75, lonMax: 95, name: 'Himalayas', elevation: 'extreme' },
      { latMin: -30, latMax: -15, lonMin: -75, lonMax: -60, name: 'Andes Mountains', elevation: 'high' }
    ];

    // Desert regions
    const desertRegions = [
      { latMin: 15, latMax: 35, lonMin: -20, lonMax: 50, name: 'Sahara Desert' },
      { latMin: 25, latMax: 40, lonMin: -120, lonMax: -110, name: 'Mojave Desert' },
      { latMin: -35, latMax: -15, lonMin: 110, lonMax: 155, name: 'Australian Outback' }
    ];

    // Check for mountain ranges
    mountainRanges.forEach(range => {
      if (lat >= range.latMin && lat <= range.latMax && 
          lon >= range.lonMin && lon <= range.lonMax) {
        features.push({
          type: 'mountain',
          name: range.name,
          elevation: range.elevation,
          impact: 'Orographic effects, temperature lapse, local wind patterns'
        });
      }
    });

    // Check for deserts
    desertRegions.forEach(desert => {
      if (lat >= desert.latMin && lat <= desert.latMax && 
          lon >= desert.lonMin && lon <= desert.lonMax) {
        features.push({
          type: 'desert',
          name: desert.name,
          impact: 'High temperature extremes, low precipitation, high solar radiation'
        });
      }
    });

    // Island detection (simplified)
    const islandRegions = [
      { latMin: 20, latMax: 22, lonMin: -160, lonMax: -154, name: 'Hawaiian Islands' },
      { latMin: -5, latMax: 5, lonMin: 95, lonMax: 141, name: 'Indonesian Islands' }
    ];

    islandRegions.forEach(island => {
      if (lat >= island.latMin && lat <= island.latMax && 
          lon >= island.lonMin && lon <= island.lonMax) {
        features.push({
          type: 'island',
          name: island.name,
          impact: 'Maritime climate, trade winds, tropical cyclone risk'
        });
      }
    });

    return features.length > 0 ? features : [{ 
      type: 'continental', 
      name: 'Continental location',
      impact: 'Continental climate patterns expected'
    }];
  }

  /**
   * Get use case suggestions based on location and context
   */
  getUseCaseSuggestions(location, dateRange, userPreferences) {
    const suggestions = [];
    const { lat, lon } = location;
    const climateZone = this.determineClimateZone(location);

    // Climate-based suggestions
    switch (climateZone.zone) {
      case 'Tropical':
        suggestions.push(
          { key: 'agriculture', score: 95, reason: 'Year-round growing season in tropical climate' },
          { key: 'aquatic-sports', score: 90, reason: 'Warm weather ideal for water activities' },
          { key: 'disaster-monitoring', score: 85, reason: 'Tropical regions prone to severe weather' }
        );
        break;

      case 'Temperate':
        suggestions.push(
          { key: 'agriculture', score: 90, reason: 'Excellent conditions for diverse crop production' },
          { key: 'energy-solar', score: 80, reason: 'Good seasonal solar potential' },
          { key: 'climate-research', score: 85, reason: 'Rich seasonal climate patterns to study' }
        );
        break;

      case 'Polar':
        suggestions.push(
          { key: 'climate-research', score: 95, reason: 'Critical region for climate change studies' },
          { key: 'disaster-monitoring', score: 75, reason: 'Extreme weather events monitoring' },
          { key: 'energy-wind', score: 70, reason: 'Strong polar wind patterns' }
        );
        break;
    }

    // Geographic feature-based suggestions
    const features = this.identifyGeographicFeatures(location);
    features.forEach(feature => {
      switch (feature.type) {
        case 'mountain':
          suggestions.push({ 
            key: 'energy-wind', 
            score: 85, 
            reason: `Mountain location has enhanced wind energy potential` 
          });
          break;
        case 'desert':
          suggestions.push({ 
            key: 'energy-solar', 
            score: 95, 
            reason: `Desert location excellent for solar energy analysis` 
          });
          break;
        case 'island':
          suggestions.push({ 
            key: 'aquatic-sports', 
            score: 90, 
            reason: `Island location perfect for marine activities` 
          });
          break;
      }
    });

    // Urban vs rural detection (simplified)
    const isUrban = this.isUrbanLocation(location);
    if (isUrban) {
      suggestions.push({ 
        key: 'urban-planning', 
        score: 85, 
        reason: 'Urban location benefits from heat island and air quality analysis' 
      });
    }

    // Date-based suggestions
    if (dateRange) {
      const season = this.getSeason(new Date(dateRange.start), lat);
      if (season === 'summer') {
        suggestions.push({ 
          key: 'aquatic-sports', 
          score: 80, 
          reason: 'Summer season ideal for water activities' 
        });
      }
    }

    // Remove duplicates and sort by score
    const uniqueSuggestions = suggestions
      .reduce((acc, current) => {
        const existing = acc.find(item => item.key === current.key);
        if (existing) {
          existing.score = Math.max(existing.score, current.score);
        } else {
          acc.push(current);
        }
        return acc;
      }, [])
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Top 5 suggestions

    return uniqueSuggestions;
  }

  /**
   * Get parameter recommendations based on use case and location
   */
  getParameterRecommendations(location, dateRange, selectedUseCase) {
    if (!selectedUseCase) {
      return this.getGeneralParameterRecommendations(location);
    }

    const locationAware = getLocationAwareParameters(selectedUseCase, location.lat, location.lon);
    const climateZone = this.determineClimateZone(location);
    const features = this.identifyGeographicFeatures(location);

    const recommendations = {
      essential: locationAware.parameters.filter(p => p.priority === 1),
      recommended: locationAware.parameters.filter(p => p.priority === 2),
      optional: locationAware.parameters.filter(p => p.priority === 3),
      location_specific: [],
      seasonal_adjustments: []
    };

    // Add location-specific parameter recommendations
    if (climateZone.zone === 'Polar') {
      recommendations.location_specific.push({
        param: 'T2M',
        reason: 'Temperature monitoring critical in polar regions',
        priority: 'high'
      });
    }

    if (climateZone.zone === 'Tropical') {
      recommendations.location_specific.push({
        param: 'RH2M',
        reason: 'Humidity monitoring important in tropical climates',
        priority: 'high'
      });
    }

    // Feature-based recommendations
    features.forEach(feature => {
      if (feature.type === 'mountain') {
        recommendations.location_specific.push({
          param: 'WS2M',
          reason: 'Wind patterns significant in mountainous terrain',
          priority: 'medium'
        });
      }
      if (feature.type === 'desert') {
        recommendations.location_specific.push({
          param: 'ALLSKY_SFC_SW_DWN',
          reason: 'Solar radiation extremely high in desert regions',
          priority: 'high'
        });
      }
    });

    return recommendations;
  }

  /**
   * Get temporal insights about the selected date range
   */
  getTemporalInsights(dateRange, location) {
    if (!dateRange) return {};

    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const insights = {
      duration_analysis: this.analyzeDuration(duration),
      seasonal_context: this.getSeasonalContext(startDate, endDate, location.lat),
      data_quality_expectations: this.getDataQualityExpectations(startDate, endDate),
      recommended_analyses: this.getRecommendedAnalyses(duration, startDate),
      limitations: this.getTemporalLimitations(startDate, endDate)
    };

    return insights;
  }

  /**
   * Get data optimization tips
   */
  getDataOptimizationTips(location, dateRange, selectedUseCase) {
    const tips = [];

    // Duration-based tips
    if (dateRange) {
      const duration = Math.ceil((new Date(dateRange.end) - new Date(dateRange.start)) / (1000 * 60 * 60 * 24)) + 1;
      
      if (duration > 365) {
        tips.push({
          type: 'performance',
          title: 'Large Date Range Optimization',
          message: 'Consider breaking large date ranges into smaller chunks for faster processing',
          impact: 'medium'
        });
      }

      if (duration < 7) {
        tips.push({
          type: 'analysis',
          title: 'Short-term Analysis',
          message: 'Short date ranges are ideal for event analysis but may miss seasonal patterns',
          impact: 'low'
        });
      }
    }

    // Location-based tips
    const climateZone = this.determineClimateZone(location);
    if (climateZone.zone === 'Polar') {
      tips.push({
        type: 'data_quality',
        title: 'Polar Region Considerations',
        message: 'Some satellite data may be limited during polar night periods',
        impact: 'medium'
      });
    }

    // Use case-specific tips
    if (selectedUseCase) {
      const useCase = ENHANCED_USE_CASES[selectedUseCase];
      if (useCase) {
        tips.push({
          type: 'optimization',
          title: `${useCase.name} Best Practices`,
          message: useCase.insights[0] || 'Follow use case specific recommendations',
          impact: 'high'
        });
      }
    }

    return tips;
  }

  /**
   * Find locations with similar climate characteristics
   */
  getSimilarLocations(location) {
    const climateZone = this.determineClimateZone(location);
    const similarLocations = [];

    // This would ideally use a more sophisticated climate classification system
    // For now, we'll use simple latitude-based similarity
    const latitudeRange = 5; // degrees
    
    const referenceLocations = [
      { name: 'New York City', lat: 40.7128, lon: -74.0060, features: ['urban', 'coastal'] },
      { name: 'London', lat: 51.5074, lon: -0.1278, features: ['urban', 'maritime'] },
      { name: 'Tokyo', lat: 35.6762, lon: 139.6503, features: ['urban', 'coastal'] },
      { name: 'Sydney', lat: -33.8688, lon: 151.2093, features: ['urban', 'coastal'] },
      { name: 'São Paulo', lat: -23.5505, lon: -46.6333, features: ['urban', 'subtropical'] },
      { name: 'Cairo', lat: 30.0444, lon: 31.2357, features: ['urban', 'desert'] },
      { name: 'Mumbai', lat: 19.0760, lon: 72.8777, features: ['urban', 'tropical', 'coastal'] },
      { name: 'Reykjavik', lat: 64.1466, lon: -21.9426, features: ['urban', 'subarctic'] }
    ];

    referenceLocations.forEach(refLoc => {
      const latDiff = Math.abs(location.lat - refLoc.lat);
      if (latDiff <= latitudeRange) {
        const similarity = Math.max(0, 100 - latDiff * 10); // Simple similarity score
        similarLocations.push({
          name: refLoc.name,
          coordinates: { lat: refLoc.lat, lon: refLoc.lon },
          similarity_score: similarity,
          shared_features: refLoc.features,
          climate_zone: this.determineClimateZone(refLoc).zone
        });
      }
    });

    return similarLocations
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, 3);
  }

  /**
   * Initialize seasonal patterns data
   */
  initializeSeasonalPatterns() {
    return {
      temperature: {
        'northern_hemisphere': {
          spring: { months: [3, 4, 5], trend: 'increasing' },
          summer: { months: [6, 7, 8], trend: 'peak' },
          autumn: { months: [9, 10, 11], trend: 'decreasing' },
          winter: { months: [12, 1, 2], trend: 'minimum' }
        },
        'southern_hemisphere': {
          spring: { months: [9, 10, 11], trend: 'increasing' },
          summer: { months: [12, 1, 2], trend: 'peak' },
          autumn: { months: [3, 4, 5], trend: 'decreasing' },
          winter: { months: [6, 7, 8], trend: 'minimum' }
        }
      },
      precipitation: {
        'monsoon_regions': {
          wet_season: { months: [6, 7, 8, 9], intensity: 'high' },
          dry_season: { months: [11, 12, 1, 2, 3, 4], intensity: 'low' }
        },
        'mediterranean': {
          wet_season: { months: [10, 11, 12, 1, 2, 3], intensity: 'moderate' },
          dry_season: { months: [5, 6, 7, 8, 9], intensity: 'low' }
        }
      }
    };
  }

  /**
   * Helper methods
   */
  getSeason(date, latitude) {
    const month = date.getMonth() + 1;
    const isNorthern = latitude >= 0;
    
    if (isNorthern) {
      if (month >= 3 && month <= 5) return 'spring';
      if (month >= 6 && month <= 8) return 'summer';
      if (month >= 9 && month <= 11) return 'autumn';
      return 'winter';
    } else {
      if (month >= 3 && month <= 5) return 'autumn';
      if (month >= 6 && month <= 8) return 'winter';
      if (month >= 9 && month <= 11) return 'spring';
      return 'summer';
    }
  }

  isUrbanLocation(location) {
    // Simplified urban detection - in reality, you'd use population density data
    // For now, just check if near major cities
    const majorCities = [
      { lat: 40.7128, lon: -74.0060, radius: 0.5 }, // NYC
      { lat: 51.5074, lon: -0.1278, radius: 0.5 },  // London
      { lat: 35.6762, lon: 139.6503, radius: 0.5 }, // Tokyo
      // Add more cities as needed
    ];

    return majorCities.some(city => {
      const distance = Math.sqrt(
        Math.pow(location.lat - city.lat, 2) + 
        Math.pow(location.lon - city.lon, 2)
      );
      return distance <= city.radius;
    });
  }

  analyzeDuration(duration) {
    if (duration === 1) {
      return {
        type: 'single_day',
        description: 'Point-in-time analysis',
        strengths: ['Current conditions', 'Real-time assessment'],
        limitations: ['No trend analysis', 'Weather noise possible']
      };
    } else if (duration <= 7) {
      return {
        type: 'short_term',
        description: 'Weekly analysis',
        strengths: ['Recent patterns', 'Event-focused'],
        limitations: ['Limited seasonal context', 'Weather variability']
      };
    } else if (duration <= 31) {
      return {
        type: 'monthly',
        description: 'Monthly analysis',
        strengths: ['Seasonal trends visible', 'Reduced weather noise'],
        limitations: ['Limited annual context']
      };
    } else if (duration <= 365) {
      return {
        type: 'seasonal_to_annual',
        description: 'Comprehensive seasonal analysis',
        strengths: ['Full seasonal cycle', 'Robust statistics', 'Climate patterns'],
        limitations: ['Year-specific variations']
      };
    } else {
      return {
        type: 'multi_year',
        description: 'Climate analysis',
        strengths: ['Climate trends', 'Inter-annual variability', 'Long-term patterns'],
        limitations: ['Large data volumes', 'Processing time']
      };
    }
  }

  getSeasonalContext(startDate, endDate, latitude) {
    const startSeason = this.getSeason(startDate, latitude);
    const endSeason = this.getSeason(endDate, latitude);
    
    return {
      start_season: startSeason,
      end_season: endSeason,
      spans_multiple_seasons: startSeason !== endSeason,
      hemisphere: latitude >= 0 ? 'Northern' : 'Southern',
      seasonal_notes: this.getSeasonalNotes(startSeason, endSeason, latitude)
    };
  }

  getSeasonalNotes(startSeason, endSeason, latitude) {
    const notes = [];
    
    if (startSeason !== endSeason) {
      notes.push(`Analysis spans from ${startSeason} to ${endSeason}`);
      notes.push('Seasonal transitions may be visible in the data');
    }
    
    if (startSeason === 'summer' || endSeason === 'summer') {
      notes.push('Summer period included - expect higher temperatures and solar radiation');
    }
    
    if (startSeason === 'winter' || endSeason === 'winter') {
      notes.push('Winter period included - expect lower temperatures');
    }
    
    return notes;
  }

  getDataQualityExpectations(startDate, endDate) {
    const now = new Date();
    const isHistorical = endDate < now;
    const isFuture = startDate > now;
    const daysDiff = Math.ceil((now - endDate) / (1000 * 60 * 60 * 24));

    const expectations = {
      overall_quality: 'good',
      latency_notes: [],
      availability_notes: []
    };

    if (isFuture) {
      expectations.overall_quality = 'limited';
      expectations.availability_notes.push('Future dates have forecast data only');
    } else if (daysDiff < 2) {
      expectations.latency_notes.push('Recent data may have 1-2 day processing delay');
    }

    if (isHistorical && daysDiff > 1095) { // 3 years
      expectations.availability_notes.push('Very old data may have gaps in some datasets');
    }

    return expectations;
  }

  getRecommendedAnalyses(duration, startDate) {
    const analyses = [];
    
    if (duration >= 30) {
      analyses.push('Monthly statistics and trends');
      analyses.push('Seasonal pattern analysis');
    }
    
    if (duration >= 365) {
      analyses.push('Annual cycle characterization');
      analyses.push('Climate normal comparison');
    }
    
    if (duration >= 1095) {
      analyses.push('Multi-year trend analysis');
      analyses.push('Climate change signal detection');
    }
    
    return analyses;
  }

  getTemporalLimitations(startDate, endDate) {
    const limitations = [];
    const now = new Date();
    
    if (startDate > now) {
      limitations.push('Forecast data has inherent uncertainty');
    }
    
    if (endDate < new Date('2000-01-01')) {
      limitations.push('Very old data may have quality issues');
    }
    
    const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    if (duration > 1095) {
      limitations.push('Large date ranges may require additional processing time');
    }
    
    return limitations;
  }

  getGeneralParameterRecommendations(location) {
    const climateZone = this.determineClimateZone(location);
    const baseRecommendations = ['T2M', 'PRECTOTCORR', 'WS2M'];
    
    // Add climate-specific parameters
    if (climateZone.zone === 'Tropical') {
      baseRecommendations.push('RH2M', 'NDVI');
    } else if (climateZone.zone === 'Polar') {
      baseRecommendations.push('LST_Day', 'LST_Night');
    } else if (climateZone.zone === 'Temperate') {
      baseRecommendations.push('ALLSKY_SFC_SW_DWN', 'NDVI');
    }

    return {
      essential: baseRecommendations.slice(0, 3).map(param => ({ param, priority: 1 })),
      recommended: baseRecommendations.slice(3).map(param => ({ param, priority: 2 })),
      optional: [],
      location_specific: []
    };
  }

  getPersonalizedRecommendations(location, userPreferences, historical_usage) {
    const recommendations = [];
    
    if (userPreferences.favorite_use_cases) {
      recommendations.push({
        type: 'use_case',
        title: 'Your Favorite Use Cases',
        items: userPreferences.favorite_use_cases,
        reason: 'Based on your saved preferences'
      });
    }
    
    if (historical_usage?.frequent_parameters) {
      recommendations.push({
        type: 'parameters',
        title: 'Frequently Used Parameters',
        items: historical_usage.frequent_parameters,
        reason: 'Based on your usage history'
      });
    }
    
    return recommendations;
  }

  getSeasonalPatterns(location, dateRange) {
    if (!dateRange) return {};
    
    const season = this.getSeason(new Date(dateRange.start), location.lat);
    const climateZone = this.determineClimateZone(location);
    
    return {
      current_season: season,
      expected_patterns: this.getExpectedSeasonalPatterns(season, climateZone.zone),
      parameter_expectations: this.getSeasonalParameterExpectations(season, location)
    };
  }

  /**
   * Analyze environmental factors for a location
   */
  analyzeEnvironmentalFactors(location) {
    const factors = [];
    const { lat, lon } = location;
    
    // Latitude-based factors
    if (Math.abs(lat) > 66.5) {
      factors.push({
        type: 'polar_conditions',
        description: 'Extreme seasonal daylight variation',
        impact: 'Limited solar data during polar night'
      });
    }
    
    if (Math.abs(lat) < 23.5) {
      factors.push({
        type: 'tropical_conditions', 
        description: 'Year-round warm temperatures',
        impact: 'High precipitation variability'
      });
    }
    
    // Altitude estimation (simplified)
    if (Math.abs(lat) > 30 && Math.abs(lat) < 60) {
      factors.push({
        type: 'temperate_zone',
        description: 'Four distinct seasons',
        impact: 'Strong seasonal patterns in all parameters'
      });
    }
    
    return factors;
  }

  /**
   * Assess data availability for a location
   */
  assessDataAvailability(location) {
    return {
      nasa_power: 'excellent',
      modis: 'good',
      earthdata: 'variable',
      notes: 'All major NASA datasets available for this location'
    };
  }

  /**
   * Get location-based use case recommendations
   */
  getLocationBasedUseCases(location) {
    const useCases = [];
    const climateZone = this.determineClimateZone(location);
    
    switch(climateZone.zone) {
      case 'Tropical':
        useCases.push('agriculture', 'disaster-monitoring', 'aquatic-sports');
        break;
      case 'Temperate':
        useCases.push('agriculture', 'energy-solar', 'climate-research');
        break;
      case 'Polar':
        useCases.push('climate-research', 'energy-wind');
        break;
      default:
        useCases.push('climate-research', 'agriculture');
    }
    
    return useCases;
  }

  /**
   * Get special considerations for a location
   */
  getSpecialConsiderations(location) {
    const considerations = [];
    const { lat, lon } = location;
    
    if (Math.abs(lat) > 80) {
      considerations.push('Very high latitude - limited satellite coverage');
    }
    
    if (Math.abs(lon) > 170) {
      considerations.push('Near international date line - check time zones');
    }
    
    return considerations;
  }

  getExpectedSeasonalPatterns(season, climateZone) {
    const patterns = {
      temperature: 'moderate',
      precipitation: 'variable',
      wind: 'variable',
      solar: 'moderate'
    };
    
    // Customize based on season and climate
    if (season === 'summer') {
      patterns.temperature = climateZone === 'Polar' ? 'mild' : 'high';
      patterns.solar = 'high';
    } else if (season === 'winter') {
      patterns.temperature = climateZone === 'Tropical' ? 'warm' : 'low';
      patterns.solar = 'low';
    }
    
    return patterns;
  }

  getSeasonalParameterExpectations(season, location) {
    const expectations = {};
    
    if (season === 'summer') {
      expectations.T2M = 'Higher than annual average';
      expectations.ALLSKY_SFC_SW_DWN = 'Peak solar radiation period';
    } else if (season === 'winter') {
      expectations.T2M = 'Lower than annual average';
      expectations.ALLSKY_SFC_SW_DWN = 'Minimum solar radiation period';
    }
    
    return expectations;
  }
}

// Create singleton instance
export const enhancedRecommendationEngine = new EnhancedRecommendationEngine();

export default enhancedRecommendationEngine;