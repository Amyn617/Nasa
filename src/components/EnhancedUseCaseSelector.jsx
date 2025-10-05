import React, { useState, useEffect } from 'react';
import { 
  ENHANCED_USE_CASES, 
  getCategories, 
  getUseCasesByCategory,
  getRecommendedParameters,
  getLocationAwareParameters,
  generateUseCaseInsights
} from '../services/enhanced_use_cases';

export default function EnhancedUseCaseSelector({
  selectedUseCase,
  onUseCaseSelect,
  location,
  onParametersChange,
  showRecommendations = true
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedUseCase, setExpandedUseCase] = useState(null);
  const [selectedParameters, setSelectedParameters] = useState([]);
  const [showParameterDetails, setShowParameterDetails] = useState(false);
  
  const categories = ['All', ...getCategories()];

  // Get filtered use cases
  const getFilteredUseCases = () => {
    if (selectedCategory === 'All') {
      return Object.entries(ENHANCED_USE_CASES).map(([key, useCase]) => ({ key, ...useCase }));
    }
    return getUseCasesByCategory(selectedCategory);
  };

  // Handle use case selection
  const handleUseCaseSelect = (useCaseKey) => {
    const useCase = ENHANCED_USE_CASES[useCaseKey];
    if (!useCase) return;

    // Get recommended parameters based on location if available
    const paramData = location 
      ? getLocationAwareParameters(useCaseKey, location.lat, location.lon)
      : { parameters: getRecommendedParameters(useCaseKey, true), suggestions: [] };

    const essentialParams = paramData.parameters.filter(p => p.priority <= 2);
    setSelectedParameters(essentialParams);
    
    if (onUseCaseSelect) {
      onUseCaseSelect({
        key: useCaseKey,
        useCase: useCase,
        parameters: essentialParams,
        suggestions: paramData.suggestions
      });
    }

    if (onParametersChange) {
      onParametersChange(essentialParams);
    }

    setExpandedUseCase(useCaseKey);
  };

  // Toggle parameter selection
  const toggleParameter = (param) => {
    const newParameters = selectedParameters.find(p => p.param === param.param)
      ? selectedParameters.filter(p => p.param !== param.param)
      : [...selectedParameters, param];
    
    setSelectedParameters(newParameters);
    
    if (onParametersChange) {
      onParametersChange(newParameters);
    }
  };

  // Get category emoji
  const getCategoryEmoji = (category) => {
    const emojis = {
      'Environmental': '🌍',
      'Recreation': '🏖️',
      'Energy': '⚡',
      'Research': '🔬',
      'Planning': '🏗️',
      'Safety': '🚨',
      'Transportation': '🚛',
      'All': '🌟'
    };
    return emojis[category] || '📊';
  };

  // Get parameter priority color
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 1: return '#4caf50'; // High priority - green
      case 2: return '#ff9800'; // Medium priority - orange
      case 3: return '#9e9e9e'; // Low priority - gray
      default: return '#2196f3'; // Default - blue
    }
  };

  // Get priority label
  const getPriorityLabel = (priority) => {
    switch(priority) {
      case 1: return 'Essential';
      case 2: return 'Important';
      case 3: return 'Optional';
      default: return 'Standard';
    }
  };

  return (
    <div className="enhanced-usecase-selector" style={{ marginBottom: '20px' }}>
      <div className="control-section">
        <label style={{ 
          fontSize: '16px', 
          fontWeight: 'bold', 
          color: '#1a73e8', 
          display: 'block', 
          marginBottom: '12px' 
        }}>
          🎯 Choose Your Use Case
        </label>
        
        <p style={{ 
          fontSize: '14px', 
          color: '#666', 
          margin: '0 0 16px 0', 
          lineHeight: '1.4' 
        }}>
          Select a use case to get intelligent parameter recommendations optimized for your needs.
        </p>

        {/* Category Filter */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '6px',
            marginBottom: '12px'
          }}>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: '6px 12px',
                  background: selectedCategory === category ? '#1a73e8' : '#f8f9fa',
                  border: `1px solid ${selectedCategory === category ? '#1a73e8' : '#dee2e6'}`,
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: selectedCategory === category ? 'bold' : 'normal',
                  color: selectedCategory === category ? 'white' : '#495057',
                  transition: 'all 0.2s'
                }}
              >
                {getCategoryEmoji(category)} {category}
              </button>
            ))}
          </div>
        </div>

        {/* Use Case Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}>
          {getFilteredUseCases().map(useCase => (
            <div
              key={useCase.key}
              style={{
                border: `2px solid ${selectedUseCase === useCase.key ? '#1a73e8' : '#e1e5e9'}`,
                borderRadius: '8px',
                background: selectedUseCase === useCase.key ? '#f3f8ff' : '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s',
                overflow: 'hidden'
              }}
              onClick={() => handleUseCaseSelect(useCase.key)}
            >
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px', marginRight: '8px' }}>{useCase.icon}</span>
                  <h3 style={{ 
                    margin: 0, 
                    fontSize: '16px', 
                    fontWeight: 'bold',
                    color: selectedUseCase === useCase.key ? '#1a73e8' : '#333'
                  }}>
                    {useCase.name}
                  </h3>
                </div>
                
                <p style={{ 
                  fontSize: '13px', 
                  color: '#666', 
                  margin: '0 0 12px 0',
                  lineHeight: '1.3'
                }}>
                  {useCase.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                  <span style={{
                    padding: '2px 6px',
                    background: '#e3f2fd',
                    color: '#1976d2',
                    borderRadius: '10px',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}>
                    {useCase.category}
                  </span>
                  {useCase.nasaApis.map(api => (
                    <span
                      key={api}
                      style={{
                        padding: '2px 6px',
                        background: '#f3e5f5',
                        color: '#7b1fa2',
                        borderRadius: '10px',
                        fontSize: '10px'
                      }}
                    >
                      NASA {api.toUpperCase()}
                    </span>
                  ))}
                </div>

                {/* Parameter Preview */}
                <div style={{ fontSize: '11px', color: '#999' }}>
                  Essential: {useCase.parameters.essential.length} params • 
                  Optional: {useCase.parameters.optional.length} params
                </div>

                {/* Expanded Details */}
                {expandedUseCase === useCase.key && (
                  <div style={{
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid #eee'
                  }}>
                    {/* Key Insights */}
                    <div style={{ marginBottom: '12px' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: 'bold', margin: '0 0 6px 0' }}>
                        💡 Key Insights
                      </h4>
                      <ul style={{ 
                        fontSize: '11px', 
                        color: '#666', 
                        margin: 0, 
                        paddingLeft: '16px',
                        lineHeight: '1.3'
                      }}>
                        {useCase.insights.slice(0, 3).map((insight, index) => (
                          <li key={index} style={{ marginBottom: '2px' }}>{insight}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Date Recommendations */}
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: 'bold', margin: '0 0 4px 0' }}>
                        📅 Date Range Tips
                      </h4>
                      <div style={{ fontSize: '11px', color: '#666' }}>
                        <div>Single date: {useCase.dateRecommendations.singleDate}</div>
                        <div>Range: {useCase.dateRecommendations.dateRange}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Parameter Selection */}
        {selectedUseCase && (
          <div style={{
            border: '1px solid #e1e5e9',
            borderRadius: '8px',
            background: '#fff',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <h3 style={{ 
                fontSize: '14px', 
                fontWeight: 'bold', 
                margin: 0,
                color: '#1a73e8'
              }}>
                🔧 Parameter Selection
              </h3>
              <button
                onClick={() => setShowParameterDetails(!showParameterDetails)}
                style={{
                  padding: '4px 8px',
                  background: 'transparent',
                  border: '1px solid #dadce0',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                {showParameterDetails ? 'Hide Details' : 'Show Details'}
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '8px'
            }}>
              {getRecommendedParameters(selectedUseCase, true).map(param => {
                const isSelected = selectedParameters.find(p => p.param === param.param);
                const priorityColor = getPriorityColor(param.priority);
                
                return (
                  <div
                    key={param.param}
                    onClick={() => toggleParameter(param)}
                    style={{
                      padding: '10px 12px',
                      border: `2px solid ${isSelected ? priorityColor : '#e1e5e9'}`,
                      borderRadius: '6px',
                      background: isSelected ? `${priorityColor}15` : '#f8f9fa',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                      <input
                        type="checkbox"
                        checked={!!isSelected}
                        readOnly
                        style={{ marginRight: '8px' }}
                      />
                      <span style={{
                        padding: '2px 6px',
                        background: priorityColor,
                        color: 'white',
                        borderRadius: '10px',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        marginRight: '8px'
                      }}>
                        {getPriorityLabel(param.priority)}
                      </span>
                      <span style={{ 
                        fontSize: '12px', 
                        fontWeight: 'bold',
                        color: isSelected ? priorityColor : '#333'
                      }}>
                        {param.label}
                      </span>
                    </div>
                    
                    <div style={{ fontSize: '10px', color: '#666', marginBottom: '4px' }}>
                      {param.unit} • NASA {param.api.toUpperCase()}
                    </div>

                    {showParameterDetails && (
                      <div style={{ 
                        fontSize: '10px', 
                        color: '#999',
                        fontStyle: 'italic',
                        lineHeight: '1.2'
                      }}>
                        Parameter: {param.param}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ 
              marginTop: '12px', 
              fontSize: '12px', 
              color: '#666',
              padding: '8px',
              background: '#f8f9fa',
              borderRadius: '4px'
            }}>
              Selected {selectedParameters.length} parameters • 
              Essential parameters are automatically recommended
            </div>
          </div>
        )}

        {/* Location-specific recommendations */}
        {showRecommendations && selectedUseCase && location && (
          <div style={{
            background: '#e8f5e8',
            border: '1px solid #c8e6c9',
            borderRadius: '6px',
            padding: '12px',
            marginTop: '12px'
          }}>
            <h4 style={{ 
              fontSize: '12px', 
              fontWeight: 'bold', 
              margin: '0 0 6px 0',
              color: '#2e7d32'
            }}>
              🌍 Location-specific Recommendations
            </h4>
            <div style={{ fontSize: '11px', color: '#4caf50', lineHeight: '1.4' }}>
              Location: {location.lat.toFixed(2)}°, {location.lon.toFixed(2)}°
              <br />
              {getLocationAwareParameters(selectedUseCase, location.lat, location.lon).suggestions.join(' • ')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}