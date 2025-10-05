import React, { useState, useEffect } from 'react';
import EnhancedLocationSelector from './EnhancedLocationSelector';
import EnhancedDateSelector from './EnhancedDateSelector';
import EnhancedUseCaseSelector from './EnhancedUseCaseSelector';
import { enhancedRecommendationEngine } from '../services/enhanced_recommendations';
import { intelligentNASAService } from '../services/intelligent_nasa_service';
import { ENHANCED_USE_CASES } from '../services/enhanced_use_cases';

export default function MainWorkflow({ 
  user, 
  onDataFetched, 
  onAuthRequired 
}) {
  // Main workflow state
  const [currentStep, setCurrentStep] = useState(1);
  const [workflowData, setWorkflowData] = useState({
    location: { lat: 40.7128, lon: -74.0060 }, // Default to NYC
    dateRange: { 
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0] 
    },
    dateMode: 'range',
    selectedUseCase: null,
    selectedParameters: [],
    recommendations: null
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [progress, setProgress] = useState(0);
  const [recommendations, setRecommendations] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Load recommendations when location changes
  useEffect(() => {
    if (workflowData.location) {
      loadSmartRecommendations();
    }
  }, [workflowData.location, workflowData.dateRange]);

  const loadSmartRecommendations = async () => {
    try {
      const recs = await enhancedRecommendationEngine.getSmartRecommendations({
        location: workflowData.location,
        dateRange: workflowData.dateRange,
        selectedUseCase: workflowData.selectedUseCase,
        userPreferences: user?.preferences
      });
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  // Handle location selection
  const handleLocationChange = (location) => {
    setWorkflowData(prev => ({ ...prev, location }));
  };

  // Handle date selection
  const handleDateChange = (dateRange) => {
    setWorkflowData(prev => ({ ...prev, dateRange }));
  };

  // Handle date mode change
  const handleDateModeChange = (mode) => {
    setWorkflowData(prev => ({ ...prev, dateMode: mode }));
  };

  // Handle use case selection
  const handleUseCaseSelect = (useCaseData) => {
    setWorkflowData(prev => ({
      ...prev,
      selectedUseCase: useCaseData.key,
      selectedParameters: useCaseData.parameters || []
    }));
  };

  // Handle parameter changes
  const handleParametersChange = (parameters) => {
    setWorkflowData(prev => ({ ...prev, selectedParameters: parameters }));
  };

  // Navigate between steps
  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  // Execute data fetching
  const fetchData = async () => {
    if (!workflowData.selectedParameters.length) {
      alert('Please select at least one parameter to fetch data.');
      return;
    }

    setIsLoading(true);
    setProgress(0);

    try {
      const result = await intelligentNASAService.fetchIntelligentData({
        location: workflowData.location,
        dateRange: workflowData.dateRange,
        parameters: workflowData.selectedParameters,
        useCaseKey: workflowData.selectedUseCase,
        onProgress: (progressData) => {
          setLoadingStage(progressData.message);
          setProgress(progressData.progress);
        },
        quality: 'standard'
      });

      if (onDataFetched) {
        // Pass the formatted chart data instead of raw result
        onDataFetched(result.chartData || result);
      }

      // Move to results view
      setCurrentStep(4);

    } catch (error) {
      console.error('Error fetching data:', error);
      alert(`Error fetching data: ${error.message}`);
    } finally {
      setIsLoading(false);
      setLoadingStage('');
      setProgress(0);
    }
  };

  // Get step validation
  const isStepValid = (step) => {
    switch (step) {
      case 1: return workflowData.location;
      case 2: return workflowData.dateRange?.start && workflowData.dateRange?.end;
      case 3: return workflowData.selectedUseCase && workflowData.selectedParameters.length > 0;
      default: return true;
    }
  };

  // Save preferences for authenticated users
  const savePreferences = () => {
    if (!user) {
      if (onAuthRequired) onAuthRequired();
      return;
    }

    const preferences = {
      favorite_location: workflowData.location,
      preferred_use_case: workflowData.selectedUseCase,
      frequent_parameters: workflowData.selectedParameters,
      default_date_mode: workflowData.dateMode,
      saved_at: new Date().toISOString()
    };

    // This would typically save to a backend
    localStorage.setItem(`user_preferences_${user.email}`, JSON.stringify(preferences));
    alert('Preferences saved successfully!');
  };

  return (
    <div className="main-workflow" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Progress Indicator */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '30px',
        padding: '0 20px'
      }}>
        {[
          { step: 1, title: 'Location', icon: '📍' },
          { step: 2, title: 'Date Range', icon: '📅' },
          { step: 3, title: 'Use Case & Parameters', icon: '🎯' },
          { step: 4, title: 'Data & Results', icon: '📊' }
        ].map(({ step, title, icon }) => (
          <div
            key={step}
            onClick={() => goToStep(step)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              opacity: step <= currentStep ? 1 : 0.5,
              transition: 'all 0.3s'
            }}
          >
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: step === currentStep ? '#1a73e8' : 
                         step < currentStep ? '#34a853' : '#f1f3f4',
              color: step <= currentStep ? 'white' : '#666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '8px',
              border: `2px solid ${step === currentStep ? '#1a73e8' : 'transparent'}`
            }}>
              {step < currentStep ? '✓' : icon}
            </div>
            <span style={{
              fontSize: '12px',
              fontWeight: step === currentStep ? 'bold' : 'normal',
              color: step === currentStep ? '#1a73e8' : '#666',
              textAlign: 'center'
            }}>
              {title}
            </span>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div style={{
        width: '100%',
        height: '4px',
        background: '#f1f3f4',
        borderRadius: '2px',
        marginBottom: '30px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${(currentStep - 1) * 33.33}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #1a73e8, #34a853)',
          borderRadius: '2px',
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Main Content Area */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        minHeight: '500px'
      }}>
        
        {/* Step 1: Location Selection */}
        {currentStep === 1 && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#1a73e8' }}>
                📍 Select Your Location
              </h2>
              <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>
                Choose a location by searching, entering coordinates, or selecting from popular locations.
              </p>
            </div>

            <EnhancedLocationSelector
              selection={workflowData.location}
              setSelection={handleLocationChange}
              onLocationChange={handleLocationChange}
            />

            {/* Smart Recommendations Preview */}
            {recommendations?.location_insights && (
              <div style={{
                marginTop: '24px',
                padding: '16px',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 12px 0', color: '#495057' }}>
                  🧠 Smart Insights for This Location
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '12px'
                }}>
                  <div style={{
                    padding: '12px',
                    background: recommendations.location_insights.climate_zone.color,
                    borderRadius: '6px'
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      {recommendations.location_insights.climate_zone.icon} Climate Zone
                    </div>
                    <div style={{ fontSize: '14px' }}>
                      {recommendations.location_insights.climate_zone.zone}
                    </div>
                  </div>
                  
                  {recommendations.location_insights.geographic_features.map((feature, index) => (
                    <div key={index} style={{
                      padding: '12px',
                      background: '#e8f5e8',
                      borderRadius: '6px'
                    }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        🏞️ Geographic Feature
                      </div>
                      <div style={{ fontSize: '14px' }}>{feature.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Date Selection */}
        {currentStep === 2 && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#1a73e8' }}>
                📅 Select Date Range
              </h2>
              <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>
                Choose a single date for current conditions or a date range for trend analysis.
              </p>
            </div>

            <EnhancedDateSelector
              timeRange={workflowData.dateRange}
              setTimeRange={handleDateChange}
              mode={workflowData.dateMode}
              onModeChange={handleDateModeChange}
              useCase={workflowData.selectedUseCase}
            />

            {/* Temporal Insights */}
            {recommendations?.temporal_insights && (
              <div style={{
                marginTop: '24px',
                padding: '16px',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 12px 0', color: '#495057' }}>
                  ⏰ Temporal Analysis Insights
                </h3>
                <div style={{ fontSize: '14px', lineHeight: '1.5', color: '#666' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Duration:</strong> {recommendations.temporal_insights.duration_analysis?.description}
                  </div>
                  {recommendations.temporal_insights.seasonal_context && (
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Season:</strong> {recommendations.temporal_insights.seasonal_context.start_season}
                      {recommendations.temporal_insights.seasonal_context.spans_multiple_seasons && 
                       ` to ${recommendations.temporal_insights.seasonal_context.end_season}`
                      }
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Use Case & Parameters */}
        {currentStep === 3 && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#1a73e8' }}>
                🎯 Choose Use Case & Parameters
              </h2>
              <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>
                Select a use case to get intelligent parameter recommendations optimized for your analysis.
              </p>
            </div>

            <EnhancedUseCaseSelector
              selectedUseCase={workflowData.selectedUseCase}
              onUseCaseSelect={handleUseCaseSelect}
              location={workflowData.location}
              onParametersChange={handleParametersChange}
              showRecommendations={true}
            />

            {/* Use Case Suggestions */}
            {recommendations?.use_case_suggestions && recommendations.use_case_suggestions.length > 0 && (
              <div style={{
                marginTop: '24px',
                padding: '16px',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 12px 0', color: '#495057' }}>
                  💡 Recommended Use Cases for Your Location
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '12px'
                }}>
                  {recommendations.use_case_suggestions.slice(0, 3).map((suggestion, index) => (
                    <div key={index} style={{
                      padding: '12px',
                      background: '#fff',
                      borderRadius: '6px',
                      border: '1px solid #dee2e6',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      // Auto-select this use case
                      const useCase = ENHANCED_USE_CASES[suggestion.key];
                      if (useCase) {
                        handleUseCaseSelect({
                          key: suggestion.key,
                          useCase: useCase,
                          parameters: useCase.parameters.essential
                        });
                      }
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '6px'
                      }}>
                        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
                          {suggestion.key.charAt(0).toUpperCase() + suggestion.key.slice(1).replace('-', ' ')}
                        </span>
                        <span style={{
                          padding: '2px 8px',
                          background: '#e3f2fd',
                          color: '#1976d2',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>
                          {suggestion.score}% match
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.3' }}>
                        {suggestion.reason}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Review & Fetch */}
        {currentStep === 4 && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#1a73e8' }}>
                🚀 Review & Fetch Data
              </h2>
              <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>
                Review your selection and fetch NASA Earth data for analysis.
              </p>
            </div>

            {/* Configuration Summary */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                padding: '16px',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                  📍 Location
                </h3>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {workflowData.location.lat.toFixed(4)}°, {workflowData.location.lon.toFixed(4)}°
                </div>
              </div>

              <div style={{
                padding: '16px',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                  📅 Date Range
                </h3>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {workflowData.dateRange.start} to {workflowData.dateRange.end}
                </div>
              </div>

              <div style={{
                padding: '16px',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                  🎯 Use Case
                </h3>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {workflowData.selectedUseCase || 'None selected'}
                </div>
              </div>

              <div style={{
                padding: '16px',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                  🔧 Parameters
                </h3>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {workflowData.selectedParameters.length} selected
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div style={{
                padding: '24px',
                background: '#e3f2fd',
                borderRadius: '8px',
                border: '1px solid #90caf9',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    border: '3px solid #90caf9',
                    borderTop: '3px solid #1976d2',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginRight: '12px'
                  }} />
                  <span style={{ fontWeight: 'bold', color: '#1976d2' }}>
                    Fetching NASA Earth Data...
                  </span>
                </div>
                
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#bbdefb',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                
                <div style={{ fontSize: '12px', color: '#1565c0' }}>
                  {loadingStage}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              {user && (
                <button
                  onClick={savePreferences}
                  className="btn"
                  style={{
                    padding: '12px 24px',
                    background: '#fff',
                    border: '2px solid #1a73e8',
                    color: '#1a73e8',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  💾 Save Preferences
                </button>
              )}
              
              <button
                onClick={fetchData}
                disabled={isLoading || !workflowData.selectedParameters.length}
                className="btn"
                style={{
                  padding: '12px 24px',
                  background: isLoading ? '#ccc' : '#1a73e8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? '⏳ Fetching...' : '🚀 Fetch NASA Data'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '20px',
        padding: '0 20px'
      }}>
        <button
          onClick={previousStep}
          disabled={currentStep === 1}
          className="btn"
          style={{
            padding: '10px 20px',
            background: currentStep === 1 ? '#f5f5f5' : '#fff',
            border: '1px solid #dadce0',
            color: currentStep === 1 ? '#999' : '#5f6368',
            borderRadius: '6px',
            cursor: currentStep === 1 ? 'not-allowed' : 'pointer'
          }}
        >
          ← Previous
        </button>

        <div style={{ fontSize: '14px', color: '#666' }}>
          Step {currentStep} of 4
        </div>

        <button
          onClick={nextStep}
          disabled={currentStep === 4 || !isStepValid(currentStep)}
          className="btn"
          style={{
            padding: '10px 20px',
            background: (currentStep === 4 || !isStepValid(currentStep)) ? '#f5f5f5' : '#1a73e8',
            border: 'none',
            color: (currentStep === 4 || !isStepValid(currentStep)) ? '#999' : 'white',
            borderRadius: '6px',
            cursor: (currentStep === 4 || !isStepValid(currentStep)) ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          Next →
        </button>
      </div>

      {/* CSS Animation */}
      <style jsx="true">{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}