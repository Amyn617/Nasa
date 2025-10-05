# Enhanced NASA API Integration - User Guide

## Overview

Your NASA Weather Data Dashboard now supports comprehensive NASA Earth observation and climate data through multiple APIs. Users can select locations, date ranges (single date or range), and various parameters to visualize NASA satellite and climate data.

## Available NASA Data Sources

### 1. **NASA POWER** 🔋
- **Description**: Meteorological and solar energy data from satellite and reanalysis
- **Spatial Resolution**: 0.5° x 0.625°
- **Temporal Range**: 1981-01-01 to present
- **Parameters**:
  - **T2M**: Temperature at 2 meters (°C)
  - **PRECTOTCORR**: Precipitation (mm)
  - **ALLSKY_SFC_SW_DWN**: Solar Radiation (W/m²)
  - **WS2M**: Wind Speed at 2m (m/s)
  - **RH2M**: Relative Humidity at 2m (%)
  - **PS**: Surface Pressure (hPa)

### 2. **MODIS** 🛰️
- **Description**: Moderate Resolution Imaging Spectroradiometer satellite data
- **Spatial Resolution**: 250m - 1km
- **Temporal Range**: 2000-02-18 to present
- **Parameters**:
  - **NDVI**: Normalized Difference Vegetation Index
  - **EVI**: Enhanced Vegetation Index
  - **LST_Day**: Land Surface Temperature (Day) (K)
  - **LST_Night**: Land Surface Temperature (Night) (K)

### 3. **Giovanni** 🌍
- **Description**: Atmospheric and climate satellite data analysis
- **Spatial Resolution**: Various
- **Temporal Range**: 1979-01-01 to present
- **Parameters**:
  - **Temperature_A**: Atmospheric Temperature (K)
  - **Humidity_A**: Atmospheric Humidity (%)
  - **TOTEXTTAU**: Aerosol Optical Thickness

### 4. **GOES** 📡
- **Description**: Geostationary weather satellite real-time data
- **Spatial Resolution**: 0.5km - 2km
- **Temporal Range**: 2017-01-01 to present
- **Parameters**:
  - **C01**: Visible Blue Channel (reflectance)
  - **C02**: Visible Red Channel (reflectance)
  - **C07**: Shortwave IR Channel (brightness temperature)
  - **C13**: Clean Longwave IR Channel (brightness temperature)

### 5. **Earthdata** 🌎
- **Description**: NASA Earth science data from multiple missions via Earthdata Login
- **Authentication**: Requires NASA Earthdata Login credentials
- **Spatial Resolution**: Various (250m - 25km)
- **Temporal Range**: 1979-01-01 to present
- **Parameters**:
  - **temperature**: Land Surface Temperature (°C)
  - **precipitation**: Precipitation estimates (mm)
  - **vegetation**: MODIS/VIIRS vegetation indices
  - **aerosols**: Atmospheric aerosol properties
  - **snow**: Snow cover and depth
  - **fires**: Active fire detection

## How to Use

### 1. **Location Selection**
- **Map Selection**: Click on the interactive map to select your location
- **Search by Place**: Type a city name, address, or landmark in the search box
- **Voice Input**: Use the microphone button for voice location search
- **Manual Coordinates**: Enter latitude and longitude directly

### 2. **Date Selection**
- **Single Date**: Select "Single date" mode for data from one specific day
- **Date Range**: Select "Range" mode to analyze data over a period
- **Date Format**: Use the date picker or enter dates in YYYY-MM-DD format

### 3. **NASA Parameter Selection**

#### Enable NASA Data
1. Check "Enable NASA Data Sources" in the control panel
2. Click "Configure NASA Sources" to open the source selector

#### Select Data Sources
1. **Choose Sources**: Check the NASA data sources you want (POWER, MODIS, etc.)
2. **View Details**: Click on each source to see available parameters
3. **Select Parameters**: Choose specific parameters within each source
4. **Quick Actions**: Use "Select All" or "Select None" for convenience

#### Parameter Examples by Use Case

**🌾 Agriculture & Vegetation**
- POWER: T2M, PRECTOTCORR
- MODIS: NDVI, EVI, LST_Day

**⚡ Energy & Solar**
- POWER: ALLSKY_SFC_SW_DWN, T2M, WS2M
- GOES: C02, C07

**🌦️ Weather & Climate**
- POWER: T2M, PRECTOTCORR, WS2M, RH2M
- Giovanni: Temperature_A, Humidity_A
- GOES: C13

**🌱 Environmental Monitoring**
- MODIS: NDVI, LST_Day, LST_Night
- Giovanni: TOTEXTTAU (aerosols)
- Earthdata: vegetation, aerosols

### 4. **Data Visualization**

#### NASA Data Charts
- **Separate Section**: NASA data appears in a dedicated "🛰️ NASA Earth Observation Data" section
- **Source Identification**: Each chart clearly shows the NASA source (POWER, MODIS, etc.)
- **Interactive Charts**: Hover for detailed values and timestamps
- **Multiple Parameters**: Each parameter gets its own chart for clarity

#### Chart Features
- **Time Series**: All data plotted over your selected date range
- **Color Coding**: Different colors for each NASA data source
- **Units Display**: Proper units shown for each parameter (°C, mm, W/m², etc.)
- **Quality Indicators**: Data point counts and quality flags when available

### 5. **Advanced Features**

#### Combined Analysis
- **Multi-Source**: Compare data from different NASA sources for the same location
- **Temporal Analysis**: Analyze trends over different time periods
- **Cross-Validation**: Use multiple sources to validate measurements

#### Export Options
- **Data Export**: Export NASA data in CSV format
- **Chart Images**: Save charts as PNG images
- **Metadata**: Access technical details about each dataset

## Data Accuracy and Limitations

### Real-time vs. Historical
- **GOES**: Near real-time (< 1 hour delay)
- **MODIS**: 1-2 day delay for processed products
- **POWER**: Updated monthly for recent data
- **Giovanni**: Varies by dataset (1 day to 1 month)

### Spatial Resolution
- **Global Coverage**: All sources provide global data
- **Resolution Varies**: From 250m (MODIS) to 0.5° (POWER)
- **Point vs. Area**: Data represents averages over the pixel area

### Data Quality
- **Quality Flags**: Available for most satellite data
- **Cloud Coverage**: May affect optical satellite measurements
- **Validation**: Cross-reference multiple sources when possible

## Troubleshooting

### Common Issues
1. **No NASA Data**: Check internet connection and try different parameters
2. **Date Range Too Large**: Some sources have limits on temporal range
3. **Location Issues**: Ensure coordinates are valid (-90 to 90 for lat, -180 to 180 for lon)
4. **Parameter Conflicts**: Some parameter combinations may not be available

### Error Messages
- **"NASA Data Error"**: Check the error details in the red error box
- **"Parameters omitted"**: Some parameters may not be available for your location/time
- **"Fetch failed"**: Network or API issue, try refreshing or selecting fewer parameters

## Authentication Setup

### NASA Earthdata Login
Some NASA datasets require authentication through NASA's Earthdata Login system. The following credentials are configured for your account:

- **Username**: `ibtissamlajrh34`
- **System**: NASA Earthdata Login (URS)
- **Access**: MODIS, Giovanni, GOES, and other Earth observation datasets
- **Status**: ✅ Configured and ready to use

### Testing Authentication
To verify your NASA authentication is working:

1. Open the browser developer console (F12)
2. Run the test command:
   ```javascript
   // Import and run NASA API tests
   import('./src/utils/nasa_api_test.js').then(module => {
     module.testNasaAPIs()
   })
   ```
3. Check the results for authentication status

### API Coverage
- **No Authentication**: NASA POWER (public access)
- **Earthdata Login**: MODIS, Giovanni, GOES, Earthdata CMR
- **Meteomatics**: Separate commercial API with your credentials

## Technical Details

### API Integration
- **Multiple Sources**: Unified interface to access different NASA APIs
- **Authentication**: Automatic NASA Earthdata Login integration
- **Fallback Handling**: Graceful degradation when sources are unavailable
- **CMR Integration**: Uses NASA's Common Metadata Repository for dataset discovery
- **Caching**: Intelligent caching to improve performance
- **Rate Limiting**: Respects API rate limits for all sources

### Data Processing
- **Normalization**: All data normalized to consistent formats
- **Time Zones**: All times in UTC
- **Quality Control**: Basic quality flags and validation
- **Interpolation**: Gap filling where appropriate

---

## Example Workflows

### 🌾 **Agricultural Assessment**
1. Select farm location on map
2. Choose date range (e.g., growing season)
3. Enable NASA sources: POWER + MODIS
4. Select parameters: T2M, PRECTOTCORR, NDVI
5. Analyze temperature, rainfall, and vegetation health

### ⚡ **Solar Energy Planning**
1. Select potential solar farm site
2. Choose 1-year date range
3. Enable POWER source
4. Select: ALLSKY_SFC_SW_DWN, T2M
5. Assess solar potential and temperature effects

### 🌦️ **Weather Research**
1. Select study area coordinates
2. Choose storm/event date range
3. Enable multiple sources: POWER + GOES + Giovanni
4. Select atmospheric and surface parameters
5. Compare multi-source weather data

Enjoy exploring Earth's climate and weather data with NASA's comprehensive satellite and reanalysis datasets!