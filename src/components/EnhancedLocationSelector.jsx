import React, { useState, useEffect, useRef } from 'react';
import { geocodeNominatim } from '../services/geocode';

export default function EnhancedLocationSelector({ 
  selection, 
  setSelection, 
  onLocationChange,
  showMap = true 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [manualCoords, setManualCoords] = useState({
    lat: selection.lat.toFixed(4),
    lon: selection.lon.toFixed(4)
  });
  const [inputMethod, setInputMethod] = useState('search'); // 'search', 'coordinates', 'map'
  const searchTimeoutRef = useRef(null);

  // Popular locations for quick selection
  const popularLocations = [
    { name: '🌆 New York City', lat: 40.7128, lon: -74.0060, country: 'USA' },
    { name: '🌁 San Francisco', lat: 37.7749, lon: -122.4194, country: 'USA' },
    { name: '🏛️ Washington DC', lat: 38.9072, lon: -77.0369, country: 'USA' },
    { name: '🌴 Miami', lat: 25.7617, lon: -80.1918, country: 'USA' },
    { name: '🗼 Tokyo', lat: 35.6762, lon: 139.6503, country: 'Japan' },
    { name: '🎭 London', lat: 51.5074, lon: -0.1278, country: 'UK' },
    { name: '🥖 Paris', lat: 48.8566, lon: 2.3522, country: 'France' },
    { name: '🍝 Rome', lat: 41.9028, lon: 12.4964, country: 'Italy' },
    { name: '🕌 Istanbul', lat: 41.0082, lon: 28.9784, country: 'Turkey' },
    { name: '🏔️ Swiss Alps', lat: 46.5197, lon: 8.0398, country: 'Switzerland' },
    { name: '🏜️ Sahara Desert', lat: 23.4162, lon: 25.6628, country: 'Libya' },
    { name: '🌿 Amazon Rainforest', lat: -3.4653, lon: -62.2159, country: 'Brazil' },
    { name: '🧊 Greenland', lat: 72.0000, lon: -40.0000, country: 'Greenland' },
    { name: '🏝️ Maldives', lat: 3.2028, lon: 73.2207, country: 'Maldives' },
    { name: '🦘 Sydney', lat: -33.8688, lon: 151.2093, country: 'Australia' },
    { name: '🐧 Antarctica', lat: -82.8628, lon: 135.0000, country: 'Antarctica' }
  ];

  // Handle search with debouncing
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await geocodeNominatim(searchQuery);
        setSearchResults(results.slice(0, 8)); // Limit to 8 results
        setShowSearchResults(true);
      } catch (error) {
        console.error('Geocoding error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleLocationSelect = (lat, lon, name = '') => {
    const newSelection = { lat: parseFloat(lat), lon: parseFloat(lon) };
    setSelection(newSelection);
    setManualCoords({
      lat: lat.toFixed(4),
      lon: lon.toFixed(4)
    });
    
    if (onLocationChange) {
      onLocationChange(newSelection);
    }
    
    if (name) {
      setSearchQuery(name);
    }
    
    setShowSearchResults(false);
  };

  const handleManualCoordinateChange = (field, value) => {
    setManualCoords(prev => ({ ...prev, [field]: value }));
  };

  const applyManualCoordinates = () => {
    const lat = parseFloat(manualCoords.lat);
    const lon = parseFloat(manualCoords.lon);
    
    if (isNaN(lat) || isNaN(lon)) {
      alert('Please enter valid coordinates');
      return;
    }
    
    if (lat < -90 || lat > 90) {
      alert('Latitude must be between -90 and 90 degrees');
      return;
    }
    
    if (lon < -180 || lon > 180) {
      alert('Longitude must be between -180 and 180 degrees');
      return;
    }
    
    handleLocationSelect(lat, lon);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleLocationSelect(latitude, longitude, 'Current Location');
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get current location. Please check your browser permissions.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  // Format coordinates for display
  const formatCoord = (coord, type) => {
    const abs = Math.abs(coord);
    const dir = type === 'lat' 
      ? (coord >= 0 ? 'N' : 'S')
      : (coord >= 0 ? 'E' : 'W');
    return `${abs.toFixed(4)}°${dir}`;
  };

  return (
    <div className="enhanced-location-selector" style={{ marginBottom: '20px' }}>
      <div className="control-section">
        <label style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a73e8', display: 'block', marginBottom: '12px' }}>
          📍 Select Location
        </label>
        
        {/* Input Method Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '4px', 
          marginBottom: '16px',
          borderRadius: '6px',
          background: '#f1f3f4',
          padding: '4px'
        }}>
          {[
            { key: 'search', label: '🔍 Search', desc: 'Search by city/address' },
            { key: 'coordinates', label: '🎯 Coordinates', desc: 'Enter lat/lon directly' },
            { key: 'current', label: '📱 My Location', desc: 'Use device location' }
          ].map(method => (
            <button
              key={method.key}
              onClick={() => {
                if (method.key === 'current') {
                  getCurrentLocation();
                } else {
                  setInputMethod(method.key);
                }
              }}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: 'none',
                background: inputMethod === method.key ? '#1a73e8' : 'transparent',
                color: inputMethod === method.key ? 'white' : '#5f6368',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: inputMethod === method.key ? 'bold' : 'normal',
                transition: 'all 0.2s'
              }}
              title={method.desc}
            >
              {method.label}
            </button>
          ))}
        </div>

        {/* Current Location Display */}
        <div style={{
          padding: '12px',
          background: '#e8f5e8',
          border: '1px solid #c8e6c9',
          borderRadius: '6px',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          <div style={{ fontWeight: 'bold', color: '#2e7d32' }}>
            Selected: {formatCoord(selection.lat, 'lat')}, {formatCoord(selection.lon, 'lon')}
          </div>
          <div style={{ fontSize: '12px', color: '#4caf50', marginTop: '4px' }}>
            Decimal: {selection.lat.toFixed(4)}, {selection.lon.toFixed(4)}
          </div>
        </div>

        {/* Search Interface */}
        {inputMethod === 'search' && (
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for cities, addresses, or landmarks..."
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 16px',
                  border: '1px solid #dadce0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={() => {
                  if (searchResults.length > 0) setShowSearchResults(true);
                }}
              />
              {isSearching && (
                <div style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '16px'
                }}>
                  ⏳
                </div>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'white',
                border: '1px solid #dadce0',
                borderTop: 'none',
                borderRadius: '0 0 6px 6px',
                maxHeight: '300px',
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}>
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    onClick={() => handleLocationSelect(result.lat, result.lon, result.display_name)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: index < searchResults.length - 1 ? '1px solid #f0f0f0' : 'none',
                      cursor: 'pointer',
                      background: 'white',
                      ':hover': { background: '#f5f5f5' }
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                    onMouseLeave={(e) => e.target.style.background = 'white'}
                  >
                    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '2px' }}>
                      {result.display_name.split(',')[0]}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {result.display_name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                      {formatCoord(parseFloat(result.lat), 'lat')}, {formatCoord(parseFloat(result.lon), 'lon')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Manual Coordinates Interface */}
        {inputMethod === 'coordinates' && (
          <div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '12px',
              marginBottom: '12px' 
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                  Latitude (-90 to 90)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min="-90"
                  max="90"
                  value={manualCoords.lat}
                  onChange={(e) => handleManualCoordinateChange('lat', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #dadce0',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                  Longitude (-180 to 180)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min="-180"
                  max="180"
                  value={manualCoords.lon}
                  onChange={(e) => handleManualCoordinateChange('lon', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #dadce0',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
            <button
              onClick={applyManualCoordinates}
              className="btn"
              style={{
                width: '100%',
                padding: '10px',
                background: '#1a73e8',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold'
              }}
            >
              Apply Coordinates
            </button>
          </div>
        )}

        {/* Popular Locations */}
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ 
            fontSize: '14px', 
            fontWeight: 'bold', 
            margin: '0 0 12px 0',
            color: '#5f6368'
          }}>
            🌍 Popular Locations
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '8px',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {popularLocations.map((location, index) => (
              <button
                key={index}
                onClick={() => handleLocationSelect(location.lat, location.lon, location.name)}
                style={{
                  padding: '10px 12px',
                  background: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '12px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#e9ecef';
                  e.target.style.borderColor = '#1a73e8';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#f8f9fa';
                  e.target.style.borderColor = '#dee2e6';
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                  {location.name}
                </div>
                <div style={{ fontSize: '10px', color: '#666' }}>
                  {location.country} • {formatCoord(location.lat, 'lat')}, {formatCoord(location.lon, 'lon')}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Click outside to close search results */}
      {showSearchResults && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setShowSearchResults(false)}
        />
      )}
    </div>
  );
}