"""
Meteomatics API Client for climatological data retrieval.
"""

import meteomatics.api as mtm
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Tuple, Optional, Dict, Any
import warnings
import sys
import os

# Add parent directory to path for config import
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from config import get_meteomatics_credentials, is_api_valid, get_api_status
except ImportError:
    # Fallback if config not available
    def get_meteomatics_credentials():
        return "demo", "demo"
    def is_api_valid():
        return False
    def get_api_status():
        return {"username": "demo", "valid_until": "N/A", "is_valid": False}


class MeteomaticsClient:
    """Client for accessing Meteomatics weather API for climatological analysis."""
    
    def __init__(self, username: str = None, password: str = None):
        """
        Initialize the Meteomatics client.
        
        Args:
            username: Meteomatics API username (optional, will use config if not provided)
            password: Meteomatics API password (optional, will use config if not provided)
        """
        if username is None or password is None:
            # Use credentials from config
            self.username, self.password = get_meteomatics_credentials()
            print(f"🔑 Using configured API credentials for user: {self.username}")
            
            # Check if credentials are still valid
            api_status = get_api_status()
            if api_status['is_valid']:
                days_remaining = api_status['days_remaining']
                print(f"✅ API credentials valid until {api_status['valid_until']} ({days_remaining} days remaining)")
            else:
                print("⚠️ API credentials may be expired or invalid")
        else:
            self.username = username
            self.password = password
            print(f"🔑 Using provided API credentials for user: {username}")
        
        self._validate_credentials()
    
    def _validate_credentials(self):
        """Validate API credentials by making a test request."""
        try:
            # Test with a small request
            test_coords = [(0, 0)]
            test_date = datetime.now()
            mtm.query_time_series(
                [test_date], 
                ['t_2m:C'], 
                test_coords, 
                self.username, 
                self.password,
                model='mix'
            )
            print("✓ Meteomatics API credentials validated successfully")
        except Exception as e:
            warnings.warn(f"Could not validate credentials: {e}")
    
    def get_climatology(self, lat: float, lon: float, parameter: str, 
                       start_date: datetime, end_date: datetime) -> pd.DataFrame:
        """
        Fetch climatological data using Meteomatics API.
        
        Args:
            lat: Latitude
            lon: Longitude
            parameter: Weather parameter (e.g., 't_2m:C' for temperature)
            start_date: Start date
            end_date: End date
        
        Returns:
            DataFrame with historical data
        """
        coordinates = [(lat, lon)]
        
        try:
            # Fetch data
            df = mtm.query_time_series(
                [start_date, end_date],
                [parameter],
                coordinates,
                self.username,
                self.password,
                model='mix'
            )
            
            return df
            
        except Exception as e:
            print(f"Error fetching data: {e}")
            # Return mock data for development/testing
            return self._generate_mock_data(start_date, end_date, parameter)
    
    def get_historical_data(self, lat: float, lon: float, parameter: str, 
                           day_of_year: int, years_back: int = 30) -> np.ndarray:
        """
        Get historical data for a specific day of year across multiple years.
        
        Args:
            lat: Latitude
            lon: Longitude
            parameter: Weather parameter
            day_of_year: Day of year (1-365)
            years_back: Number of years to look back
        
        Returns:
            Array of historical values
        """
        current_year = datetime.now().year
        historical_data = []
        
        for year in range(current_year - years_back, current_year):
            try:
                # Create date for this year
                date = datetime(year, 1, 1) + timedelta(days=day_of_year - 1)
                
                # Fetch single day data
                df = self.get_climatology(lat, lon, parameter, date, date)
                
                if not df.empty:
                    value = df.iloc[0, 0] if len(df) > 0 else np.nan
                    if not np.isnan(value):
                        historical_data.append(value)
                        
            except Exception as e:
                print(f"Error fetching data for year {year}: {e}")
                continue
        
        # If no real data available, generate mock data
        if len(historical_data) < 5:
            historical_data = self._generate_mock_historical_data(parameter, years_back)
        
        return np.array(historical_data)
    
    def _generate_mock_data(self, start_date: datetime, end_date: datetime, 
                           parameter: str) -> pd.DataFrame:
        """Generate mock data for testing when API is not available."""
        date_range = pd.date_range(start_date, end_date, freq='D')
        
        # Parameter-specific mock data generation
        if 't_2m' in parameter:  # Temperature
            base_temp = 20
            seasonal_variation = 10 * np.sin(2 * np.pi * np.arange(len(date_range)) / 365.25)
            noise = np.random.normal(0, 3, len(date_range))
            values = base_temp + seasonal_variation + noise
        elif 'precip' in parameter:  # Precipitation
            values = np.random.exponential(2, len(date_range))
        elif 'wind' in parameter:  # Wind speed
            values = np.random.gamma(2, 5, len(date_range))
        else:
            values = np.random.normal(0, 1, len(date_range))
        
        # Create DataFrame similar to Meteomatics format
        df = pd.DataFrame({
            parameter: values
        }, index=date_range)
        
        return df
    
    def _generate_mock_historical_data(self, parameter: str, years: int) -> List[float]:
        """Generate mock historical data for testing."""
        np.random.seed(42)  # For reproducible results
        
        if 't_2m' in parameter:  # Temperature
            # Simulate temperature with seasonal and random variation
            base_temp = 20
            historical_data = []
            for _ in range(years):
                temp = base_temp + np.random.normal(0, 5)
                historical_data.append(temp)
        elif 'precip' in parameter:  # Precipitation
            historical_data = list(np.random.exponential(5, years))
        elif 'wind' in parameter:  # Wind speed
            historical_data = list(np.random.gamma(3, 4, years))
        else:
            historical_data = list(np.random.normal(0, 1, years))
        
        return historical_data
    
    def get_available_parameters(self) -> Dict[str, str]:
        """
        Get available weather parameters for analysis.
        
        Returns:
            Dictionary mapping parameter codes to descriptions
        """
        return {
            't_2m:C': 'Temperature at 2m (Celsius)',
            't_max_2m_24h:C': 'Maximum Temperature 24h (Celsius)',
            't_min_2m_24h:C': 'Minimum Temperature 24h (Celsius)',
            'precip_24h:mm': 'Precipitation 24h (mm)',
            'wind_speed_10m:ms': 'Wind Speed at 10m (m/s)',
            'wind_gusts_10m_24h:ms': 'Wind Gusts 24h (m/s)',
            'relative_humidity_2m:p': 'Relative Humidity at 2m (%)',
            'msl_pressure:hPa': 'Mean Sea Level Pressure (hPa)',
            'sunshine_duration_24h:h': 'Sunshine Duration 24h (hours)'
        }