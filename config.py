"""
Configuration file for Climatological Probability Analysis
Contains API credentials and application settings
"""

import os
from datetime import datetime

# Meteomatics API Configuration
METEOMATICS_CONFIG = {
    'username': 'namez_yasser',
    'password': '3O82Fi0nIZ9iSKF6J768',
    'valid_until': '2025-10-12',
    'base_url': 'https://api.meteomatics.com'
}

# Application Settings
APP_CONFIG = {
    'title': 'Climatological Probability Analysis',
    'description': 'Advanced weather probability analysis using historical data',
    'version': '1.0.0',
    'default_years_back': 30,
    'max_years_back': 50,
    'min_years_back': 10
}

# Default Location Settings
DEFAULT_LOCATIONS = [
    {'name': 'New York, NY', 'lat': 40.7128, 'lon': -74.0060, 'country': 'USA'},
    {'name': 'London, UK', 'lat': 51.5074, 'lon': -0.1278, 'country': 'UK'},
    {'name': 'Tokyo, Japan', 'lat': 35.6762, 'lon': 139.6503, 'country': 'Japan'},
    {'name': 'Sydney, Australia', 'lat': -33.8688, 'lon': 151.2093, 'country': 'Australia'},
    {'name': 'Mumbai, India', 'lat': 19.0760, 'lon': 72.8777, 'country': 'India'},
    {'name': 'São Paulo, Brazil', 'lat': -23.5505, 'lon': -46.6333, 'country': 'Brazil'},
    {'name': 'Cairo, Egypt', 'lat': 30.0444, 'lon': 31.2357, 'country': 'Egypt'},
    {'name': 'Moscow, Russia', 'lat': 55.7558, 'lon': 37.6173, 'country': 'Russia'},
    {'name': 'Paris, France', 'lat': 48.8566, 'lon': 2.3522, 'country': 'France'},
    {'name': 'Berlin, Germany', 'lat': 52.5200, 'lon': 13.4050, 'country': 'Germany'}
]

# Weather Parameter Thresholds
PARAMETER_THRESHOLDS = {
    't_2m': {
        'hot': 32,  # 32°C (90°F)
        'cold': 0,  # 0°C (32°F)
        'comfortable': {'min': 18, 'max': 24},  # 18-24°C
        'extreme_hot': 40,  # 40°C (104°F)
        'extreme_cold': -10  # -10°C (14°F)
    },
    't_max_2m_24h': {
        'hot': 35,
        'cold': 5,
        'comfortable': {'min': 20, 'max': 28},
        'extreme_hot': 45,
        'extreme_cold': -5
    },
    't_min_2m_24h': {
        'hot': 25,
        'cold': -5,
        'comfortable': {'min': 10, 'max': 20},
        'extreme_hot': 30,
        'extreme_cold': -15
    },
    'precip_24h': {
        'wet': 25,  # mm/day - heavy rain
        'dry': 0.1,  # mm/day - essentially no rain
        'comfortable': {'min': 0, 'max': 5},  # light rain
        'extreme_wet': 50,  # mm/day - very heavy rain
        'extreme_dry': 0
    },
    'wind_speed_10m': {
        'windy': 40,  # km/h - strong wind
        'calm': 10,   # km/h - light wind
        'comfortable': {'min': 0, 'max': 25},  # moderate wind
        'extreme_windy': 70,  # km/h - very strong wind
        'extreme_calm': 5
    },
    'relative_humidity_2m': {
        'humid': 80,  # % - high humidity
        'dry': 30,    # % - low humidity
        'comfortable': {'min': 40, 'max': 60},  # ideal humidity range
        'extreme_humid': 95,
        'extreme_dry': 15
    }
}

# UI Configuration
UI_CONFIG = {
    'theme': {
        'primary_color': '#1f77b4',
        'background_color': '#ffffff',
        'secondary_background_color': '#f0f2f6',
        'text_color': '#262730'
    },
    'page_config': {
        'page_title': 'Climatological Analysis',
        'page_icon': '🌤️',
        'layout': 'wide',
        'initial_sidebar_state': 'expanded'
    }
}

# Disaster Prediction Configuration
DISASTER_CONFIG = {
    'temperature_thresholds': {
        'heatwave': 35,  # °C
        'cold_wave': -5,  # °C
        'extreme_heat': 40,  # °C
        'extreme_cold': -15  # °C
    },
    'precipitation_thresholds': {
        'heavy_rain': 50,  # mm/24h
        'extreme_rain': 100,  # mm/24h
        'drought_days': 30,  # consecutive dry days
        'flood_risk': 150  # mm/24h
    },
    'wind_thresholds': {
        'strong_wind': 50,  # km/h
        'storm': 75,  # km/h
        'hurricane': 120  # km/h
    }
}

def get_meteomatics_credentials():
    """
    Get Meteomatics API credentials.
    
    Returns:
        tuple: (username, password)
    """
    return METEOMATICS_CONFIG['username'], METEOMATICS_CONFIG['password']

def is_api_valid():
    """
    Check if the API credentials are still valid.
    
    Returns:
        bool: True if valid, False if expired
    """
    try:
        valid_until = datetime.strptime(METEOMATICS_CONFIG['valid_until'], '%Y-%m-%d')
        return datetime.now() <= valid_until
    except:
        return False

def get_api_status():
    """
    Get API status information.
    
    Returns:
        dict: API status information
    """
    return {
        'username': METEOMATICS_CONFIG['username'],
        'valid_until': METEOMATICS_CONFIG['valid_until'],
        'is_valid': is_api_valid(),
        'days_remaining': (datetime.strptime(METEOMATICS_CONFIG['valid_until'], '%Y-%m-%d') - datetime.now()).days
    }

# Environment-specific settings
def get_environment():
    """Get current environment (development, production, etc.)"""
    return os.getenv('ENVIRONMENT', 'development')

def is_development():
    """Check if running in development mode"""
    return get_environment() == 'development'

def is_production():
    """Check if running in production mode"""
    return get_environment() == 'production'

# Logging configuration
LOGGING_CONFIG = {
    'level': 'INFO' if is_production() else 'DEBUG',
    'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    'file': 'climatological_analysis.log' if is_production() else None
}

# Cache configuration
CACHE_CONFIG = {
    'enabled': True,
    'ttl_seconds': 3600,  # 1 hour
    'max_size': 100  # Maximum number of cached requests
}
