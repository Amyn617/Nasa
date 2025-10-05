import React, { useState } from 'react';
import { ENHANCED_USE_CASES } from '../services/enhanced_use_cases';
import { PARAMETER_MAPPING } from '../services/intelligent_nasa_service';

export default function EnhancedPreferences({ 
  initial = {}, 
  onSave, 
  onCancel 
}) {
  const [preferences, setPreferences] = useState({
    favorite_use_cases: initial.favorite_use_cases || [],
    preferred_locations: initial.preferred_locations || [],
    frequent_parameters: initial.frequent_parameters || [],
    notification_settings: {
      data_updates: true,
      new_features: true,
      recommendations: true,
      ...initial.notification_settings
    },
    display_preferences: {
      units: 'metric',
      chart_style: 'modern',
      color_scheme: 'default',
      ...initial.display_preferences
    },
    analysis_preferences: {
      default_date_range: 'last_30_days',
      auto_recommendations: true,
      save_history: true,
      ...initial.analysis_preferences
    }
  });

  const [activeTab, setActiveTab] = useState('use_cases');

  // Handle use case selection
  const toggleUseCase = (useCaseKey) => {
    const newUseCases = preferences.favorite_use_cases.includes(useCaseKey)
      ? preferences.favorite_use_cases.filter(key => key !== useCaseKey)
      : [...preferences.favorite_use_cases, useCaseKey];
    
    setPreferences(prev => ({
      ...prev,
      favorite_use_cases: newUseCases
    }));
  };

  // Handle parameter selection
  const toggleParameter = (paramKey) => {
    const newParams = preferences.frequent_parameters.includes(paramKey)
      ? preferences.frequent_parameters.filter(key => key !== paramKey)
      : [...preferences.frequent_parameters, paramKey];
    
    setPreferences(prev => ({
      ...prev,
      frequent_parameters: newParams
    }));
  };

  // Handle location management
  const addLocation = (location) => {
    const newLocation = {
      id: Date.now(),
      name: location.name || `Location ${preferences.preferred_locations.length + 1}`,
      lat: location.lat,
      lon: location.lon,
      added_at: new Date().toISOString()
    };
    
    setPreferences(prev => ({
      ...prev,
      preferred_locations: [...prev.preferred_locations, newLocation]
    }));
  };

  const removeLocation = (locationId) => {
    setPreferences(prev => ({
      ...prev,
      preferred_locations: prev.preferred_locations.filter(loc => loc.id !== locationId)
    }));
  };

  // Handle settings updates
  const updateSetting = (category, key, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    onSave(preferences);
  };

  const tabs = [
    { key: 'use_cases', label: '🎯 Use Cases', icon: '🎯' },
    { key: 'parameters', label: '🔧 Parameters', icon: '🔧' },
    { key: 'locations', label: '📍 Locations', icon: '📍' },
    { key: 'display', label: '🎨 Display', icon: '🎨' },
    { key: 'notifications', label: '🔔 Notifications', icon: '🔔' }
  ];

  return (
    <div className="enhanced-preferences" style={{
      maxWidth: '600px',
      background: '#fff',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        background: 'linear-gradient(135deg, #1a73e8, #34a853)',
        color: 'white'
      }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 'bold' }}>
          ⚙️ Customize Your Experience
        </h2>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
          Set your preferences to get personalized recommendations and faster workflows
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        background: '#f8f9fa',
        borderBottom: '1px solid #dee2e6',
        overflowX: 'auto'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              minWidth: '120px',
              padding: '12px 16px',
              border: 'none',
              background: activeTab === tab.key ? '#fff' : 'transparent',
              color: activeTab === tab.key ? '#1a73e8' : '#666',
              borderBottom: activeTab === tab.key ? '2px solid #1a73e8' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: activeTab === tab.key ? 'bold' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            <div>{tab.icon}</div>
            <div style={{ marginTop: '2px' }}>{tab.label.split(' ')[1]}</div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '24px', minHeight: '400px', maxHeight: '500px', overflowY: 'auto' }}>
        
        {/* Use Cases Tab */}
        {activeTab === 'use_cases' && (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 16px 0' }}>
              Select Your Favorite Use Cases
            </h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
              Choose the use cases you work with most frequently to get prioritized recommendations.
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '12px'
            }}>
              {Object.entries(ENHANCED_USE_CASES).map(([key, useCase]) => {
                const isSelected = preferences.favorite_use_cases.includes(key);
                return (
                  <div
                    key={key}
                    onClick={() => toggleUseCase(key)}
                    style={{
                      padding: '16px',
                      border: `2px solid ${isSelected ? '#1a73e8' : '#e1e5e9'}`,
                      borderRadius: '8px',
                      background: isSelected ? '#f3f8ff' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '20px', marginRight: '8px' }}>
                        {useCase.icon}
                      </span>
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: 'bold',
                        color: isSelected ? '#1a73e8' : '#333'
                      }}>
                        {useCase.name}
                      </span>
                      {isSelected && (
                        <span style={{ marginLeft: 'auto', color: '#1a73e8' }}>✓</span>
                      )}
                    </div>
                    <p style={{ 
                      fontSize: '12px', 
                      color: '#666', 
                      margin: 0,
                      lineHeight: '1.3'
                    }}>
                      {useCase.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Parameters Tab */}
        {activeTab === 'parameters' && (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 16px 0' }}>
              Frequently Used Parameters
            </h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
              Select parameters you use often to have them pre-selected in future analyses.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '8px'
            }}>
              {Object.entries(PARAMETER_MAPPING).map(([key, param]) => {
                const isSelected = preferences.frequent_parameters.includes(key);
                return (
                  <div
                    key={key}
                    onClick={() => toggleParameter(key)}
                    style={{
                      padding: '12px',
                      border: `1px solid ${isSelected ? '#1a73e8' : '#e1e5e9'}`,
                      borderRadius: '6px',
                      background: isSelected ? '#f3f8ff' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        style={{ marginRight: '8px' }}
                      />
                      <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                        {param.description}
                      </span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#666' }}>
                      {param.unit} • NASA {param.api.toUpperCase()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Locations Tab */}
        {activeTab === 'locations' && (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 16px 0' }}>
              Saved Locations
            </h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
              Save frequently analyzed locations for quick access.
            </p>

            {preferences.preferred_locations.length === 0 ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: '#666',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '2px dashed #dee2e6'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📍</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                  No saved locations yet
                </div>
                <div style={{ fontSize: '14px' }}>
                  Locations you save during analysis will appear here for quick reuse
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {preferences.preferred_locations.map((location) => (
                  <div key={location.id} style={{
                    padding: '16px',
                    background: '#fff',
                    border: '1px solid #e1e5e9',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        {location.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {location.lat.toFixed(4)}°, {location.lon.toFixed(4)}°
                      </div>
                    </div>
                    <button
                      onClick={() => removeLocation(location.id)}
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Display Tab */}
        {activeTab === 'display' && (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 16px 0' }}>
              Display Preferences
            </h3>

            <div style={{ display: 'grid', gap: '20px' }}>
              {/* Units */}
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                  Units System
                </label>
                <select
                  value={preferences.display_preferences.units}
                  onChange={(e) => updateSetting('display_preferences', 'units', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #dadce0',
                    borderRadius: '4px'
                  }}
                >
                  <option value="metric">Metric (°C, km/h, mm)</option>
                  <option value="imperial">Imperial (°F, mph, in)</option>
                  <option value="scientific">Scientific (K, m/s, Pa)</option>
                </select>
              </div>

              {/* Chart Style */}
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                  Chart Style
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {['modern', 'classic', 'minimal'].map(style => (
                    <button
                      key={style}
                      onClick={() => updateSetting('display_preferences', 'chart_style', style)}
                      style={{
                        padding: '12px',
                        border: `2px solid ${preferences.display_preferences.chart_style === style ? '#1a73e8' : '#e1e5e9'}`,
                        borderRadius: '6px',
                        background: preferences.display_preferences.chart_style === style ? '#f3f8ff' : '#fff',
                        cursor: 'pointer',
                        textTransform: 'capitalize'
                      }}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Scheme */}
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                  Color Scheme
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[
                    { key: 'default', label: 'Default', colors: ['#1a73e8', '#34a853', '#ea4335'] },
                    { key: 'earth', label: 'Earth Tones', colors: ['#8bc34a', '#ff9800', '#795548'] },
                    { key: 'ocean', label: 'Ocean Blues', colors: ['#2196f3', '#00bcd4', '#009688'] }
                  ].map(scheme => (
                    <button
                      key={scheme.key}
                      onClick={() => updateSetting('display_preferences', 'color_scheme', scheme.key)}
                      style={{
                        padding: '12px',
                        border: `2px solid ${preferences.display_preferences.color_scheme === scheme.key ? '#1a73e8' : '#e1e5e9'}`,
                        borderRadius: '6px',
                        background: preferences.display_preferences.color_scheme === scheme.key ? '#f3f8ff' : '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                        {scheme.label}
                      </div>
                      <div style={{ display: 'flex', gap: '2px', justifyContent: 'center' }}>
                        {scheme.colors.map((color, index) => (
                          <div
                            key={index}
                            style={{
                              width: '20px',
                              height: '12px',
                              background: color,
                              borderRadius: '2px'
                            }}
                          />
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 16px 0' }}>
              Notification Settings
            </h3>

            <div style={{ display: 'grid', gap: '16px' }}>
              {[
                {
                  key: 'data_updates',
                  label: 'Data Updates',
                  description: 'Get notified when new data becomes available for your saved locations'
                },
                {
                  key: 'new_features',
                  label: 'New Features',
                  description: 'Be the first to know about new NASA datasets and analysis capabilities'
                },
                {
                  key: 'recommendations',
                  label: 'Smart Recommendations',
                  description: 'Receive intelligent suggestions based on your usage patterns'
                }
              ].map(notification => (
                <div key={notification.key} style={{
                  padding: '16px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        {notification.label}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {notification.description}
                      </div>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={preferences.notification_settings[notification.key]}
                        onChange={(e) => updateSetting('notification_settings', notification.key, e.target.checked)}
                        style={{ marginRight: '8px' }}
                      />
                      <span style={{
                        width: '40px',
                        height: '20px',
                        background: preferences.notification_settings[notification.key] ? '#1a73e8' : '#ccc',
                        borderRadius: '10px',
                        position: 'relative',
                        transition: 'background 0.2s'
                      }}>
                        <span style={{
                          position: 'absolute',
                          width: '16px',
                          height: '16px',
                          background: 'white',
                          borderRadius: '50%',
                          top: '2px',
                          left: preferences.notification_settings[notification.key] ? '22px' : '2px',
                          transition: 'left 0.2s'
                        }} />
                      </span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '20px 24px',
        background: '#f8f9fa',
        borderTop: '1px solid #dee2e6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ fontSize: '12px', color: '#666' }}>
          {preferences.favorite_use_cases.length} use cases • {preferences.frequent_parameters.length} parameters selected
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              background: '#fff',
              border: '1px solid #dadce0',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              background: '#1a73e8',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}