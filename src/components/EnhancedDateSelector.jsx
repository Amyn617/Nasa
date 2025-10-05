import React, { useState, useEffect } from 'react';

export default function EnhancedDateSelector({ 
  timeRange, 
  setTimeRange, 
  mode = 'range',
  onModeChange,
  useCase = null
}) {
  const [dateMode, setDateMode] = useState(mode); // 'single' or 'range'
  const [singleDate, setSingleDate] = useState(timeRange.end || new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(timeRange.start);
  const [endDate, setEndDate] = useState(timeRange.end);
  const [quickRange, setQuickRange] = useState('');

  // Quick date range presets
  const quickRanges = [
    {
      key: 'today',
      label: 'Today',
      description: 'Current day conditions',
      getDates: () => {
        const today = new Date().toISOString().split('T')[0];
        return { start: today, end: today };
      }
    },
    {
      key: 'last7days',
      label: 'Last 7 Days',
      description: 'Recent weather patterns',
      getDates: () => {
        const end = new Date().toISOString().split('T')[0];
        const start = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return { start, end };
      }
    },
    {
      key: 'last30days',
      label: 'Last 30 Days',
      description: 'Monthly analysis',
      getDates: () => {
        const end = new Date().toISOString().split('T')[0];
        const start = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return { start, end };
      }
    },
    {
      key: 'last90days',
      label: 'Last 90 Days',
      description: 'Seasonal trends',
      getDates: () => {
        const end = new Date().toISOString().split('T')[0];
        const start = new Date(Date.now() - 89 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return { start, end };
      }
    },
    {
      key: 'thisyear',
      label: 'This Year',
      description: 'Annual data',
      getDates: () => {
        const year = new Date().getFullYear();
        return {
          start: `${year}-01-01`,
          end: new Date().toISOString().split('T')[0]
        };
      }
    },
    {
      key: 'lastyear',
      label: 'Last Year',
      description: 'Previous year comparison',
      getDates: () => {
        const year = new Date().getFullYear() - 1;
        return {
          start: `${year}-01-01`,
          end: `${year}-12-31`
        };
      }
    }
  ];

  // Use case specific recommendations
  const getUseCaseRecommendations = () => {
    if (!useCase) return [];
    
    const recommendations = {
      'agriculture': [
        { key: 'growing-season', label: 'Growing Season', start: '2024-04-01', end: '2024-10-31', desc: 'Full growing season analysis' },
        { key: 'planting-season', label: 'Planting Season', start: '2024-04-01', end: '2024-06-30', desc: 'Spring planting conditions' },
        { key: 'harvest-season', label: 'Harvest Season', start: '2024-08-01', end: '2024-10-31', desc: 'Fall harvest conditions' }
      ],
      'aquatic-sports': [
        { key: 'weekend', label: 'This Weekend', start: getNextSaturday(), end: getNextSunday(), desc: 'Weekend water activities' },
        { key: 'summer-season', label: 'Summer Season', start: '2024-06-01', end: '2024-08-31', desc: 'Peak water sports season' }
      ],
      'energy-solar': [
        { key: 'peak-sun', label: 'Peak Sun Months', start: '2024-05-01', end: '2024-09-30', desc: 'Highest solar potential' },
        { key: 'full-year', label: 'Full Year Analysis', start: '2024-01-01', end: '2024-12-31', desc: 'Annual solar assessment' }
      ],
      'energy-wind': [
        { key: 'windy-season', label: 'Windy Season', start: '2024-10-01', end: '2024-04-30', desc: 'Peak wind energy potential' },
        { key: 'full-year', label: 'Annual Assessment', start: '2024-01-01', end: '2024-12-31', desc: 'Complete wind resource analysis' }
      ]
    };
    
    return recommendations[useCase] || [];
  };

  function getNextSaturday() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysToSaturday = (6 - dayOfWeek + 7) % 7;
    const saturday = new Date(today.getTime() + daysToSaturday * 24 * 60 * 60 * 1000);
    return saturday.toISOString().split('T')[0];
  }

  function getNextSunday() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysToSunday = (7 - dayOfWeek + 7) % 7;
    const sunday = new Date(today.getTime() + daysToSunday * 24 * 60 * 60 * 1000);
    return sunday.toISOString().split('T')[0];
  }

  // Handle date mode change
  const handleModeChange = (newMode) => {
    setDateMode(newMode);
    if (onModeChange) {
      onModeChange(newMode);
    }
    
    if (newMode === 'single') {
      setTimeRange({
        start: singleDate,
        end: singleDate
      });
    } else {
      setTimeRange({
        start: startDate,
        end: endDate
      });
    }
  };

  // Handle quick range selection
  const handleQuickRange = (rangeKey) => {
    const range = quickRanges.find(r => r.key === rangeKey) || 
                 getUseCaseRecommendations().find(r => r.key === rangeKey);
    
    if (range) {
      const dates = range.getDates ? range.getDates() : { start: range.start, end: range.end };
      setStartDate(dates.start);
      setEndDate(dates.end);
      setTimeRange(dates);
      setQuickRange(rangeKey);
      
      // Auto-switch to range mode if not single date
      if (dates.start !== dates.end && dateMode === 'single') {
        setDateMode('range');
        if (onModeChange) onModeChange('range');
      }
    }
  };

  // Handle single date change
  const handleSingleDateChange = (date) => {
    setSingleDate(date);
    setTimeRange({
      start: date,
      end: date
    });
  };

  // Handle range date changes
  const handleRangeDateChange = (type, date) => {
    if (type === 'start') {
      setStartDate(date);
      setTimeRange({ start: date, end: endDate });
    } else {
      setEndDate(date);
      setTimeRange({ start: startDate, end: date });
    }
    setQuickRange(''); // Clear quick range when manual change
  };

  // Validate date range
  const isValidRange = () => {
    if (dateMode === 'single') return true;
    return new Date(startDate) <= new Date(endDate);
  };

  // Calculate range duration
  const getRangeDuration = () => {
    if (dateMode === 'single') return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  // Get data limitations warning
  const getDataLimitations = () => {
    const duration = getRangeDuration();
    const warnings = [];
    
    if (duration > 366) {
      warnings.push('⚠️ Very long date ranges may have slower processing times');
    }
    if (duration > 1095) { // 3 years
      warnings.push('⚠️ Some NASA APIs limit historical data access');
    }
    
    const endDateObj = new Date(dateMode === 'single' ? singleDate : endDate);
    const today = new Date();
    const futureDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week ahead
    
    if (endDateObj > futureDate) {
      warnings.push('⚠️ Future dates beyond 1 week may have limited forecast data');
    }
    
    return warnings;
  };

  return (
    <div className="enhanced-date-selector" style={{ marginBottom: '20px' }}>
      <div className="control-section">
        <label style={{ 
          fontSize: '16px', 
          fontWeight: 'bold', 
          color: '#1a73e8', 
          display: 'block', 
          marginBottom: '12px' 
        }}>
          📅 Select Date Range
        </label>

        {/* Date Mode Toggle */}
        <div style={{ 
          display: 'flex', 
          gap: '4px', 
          marginBottom: '16px',
          borderRadius: '6px',
          background: '#f1f3f4',
          padding: '4px'
        }}>
          <button
            onClick={() => handleModeChange('single')}
            style={{
              flex: 1,
              padding: '8px 16px',
              border: 'none',
              background: dateMode === 'single' ? '#1a73e8' : 'transparent',
              color: dateMode === 'single' ? 'white' : '#5f6368',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: dateMode === 'single' ? 'bold' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            📅 Single Date
          </button>
          <button
            onClick={() => handleModeChange('range')}
            style={{
              flex: 1,
              padding: '8px 16px',
              border: 'none',
              background: dateMode === 'range' ? '#1a73e8' : 'transparent',
              color: dateMode === 'range' ? 'white' : '#5f6368',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: dateMode === 'range' ? 'bold' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            📊 Date Range
          </button>
        </div>

        {/* Quick Range Selection */}
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#5f6368' }}>
            ⚡ Quick Select
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '6px',
            marginBottom: '12px'
          }}>
            {quickRanges.slice(0, 6).map(range => (
              <button
                key={range.key}
                onClick={() => handleQuickRange(range.key)}
                style={{
                  padding: '8px 12px',
                  background: quickRange === range.key ? '#e3f2fd' : '#f8f9fa',
                  border: `1px solid ${quickRange === range.key ? '#1976d2' : '#dee2e6'}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: quickRange === range.key ? 'bold' : 'normal',
                  color: quickRange === range.key ? '#1976d2' : '#495057',
                  textAlign: 'center',
                  transition: 'all 0.2s'
                }}
                title={range.description}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Use Case Specific Recommendations */}
        {useCase && getUseCaseRecommendations().length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#5f6368' }}>
              🎯 Recommended for {useCase.charAt(0).toUpperCase() + useCase.slice(1)}
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '6px',
              marginBottom: '12px'
            }}>
              {getUseCaseRecommendations().map(rec => (
                <button
                  key={rec.key}
                  onClick={() => handleQuickRange(rec.key)}
                  style={{
                    padding: '10px 12px',
                    background: quickRange === rec.key ? '#e8f5e8' : '#f8f9fa',
                    border: `1px solid ${quickRange === rec.key ? '#4caf50' : '#dee2e6'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                  title={rec.desc}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{rec.label}</div>
                  <div style={{ fontSize: '10px', color: '#666' }}>{rec.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Date Input Controls */}
        {dateMode === 'single' ? (
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
              Select Date
            </label>
            <input
              type="date"
              value={singleDate}
              onChange={(e) => handleSingleDateChange(e.target.value)}
              max={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // 1 week ahead
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #dadce0',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleRangeDateChange('start', e.target.value)}
                max={endDate}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #dadce0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleRangeDateChange('end', e.target.value)}
                min={startDate}
                max={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #dadce0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
        )}

        {/* Range Info & Validation */}
        <div style={{ marginTop: '12px' }}>
          <div style={{
            padding: '8px 12px',
            background: isValidRange() ? '#e8f5e8' : '#ffebee',
            border: `1px solid ${isValidRange() ? '#c8e6c9' : '#ffcdd2'}`,
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            <div style={{ 
              fontWeight: 'bold', 
              color: isValidRange() ? '#2e7d32' : '#c62828',
              marginBottom: '4px'
            }}>
              {dateMode === 'single' 
                ? `Selected: ${new Date(singleDate).toLocaleDateString()}`
                : `Range: ${getRangeDuration()} day${getRangeDuration() !== 1 ? 's' : ''}`
              }
            </div>
            {dateMode === 'range' && (
              <div style={{ color: isValidRange() ? '#4caf50' : '#f44336' }}>
                {isValidRange() 
                  ? `From ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
                  : 'Invalid range: Start date must be before end date'
                }
              </div>
            )}
          </div>

          {/* Warnings */}
          {getDataLimitations().map((warning, index) => (
            <div key={index} style={{
              padding: '6px 8px',
              background: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '4px',
              fontSize: '11px',
              color: '#856404',
              marginTop: '4px'
            }}>
              {warning}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}