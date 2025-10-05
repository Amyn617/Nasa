"""
Weather query processor for handling user requests and coordinating analysis.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
import json
import os
import sys

# Add parent directory to path for config import
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.meteomatics_client import MeteomaticsClient
from src.climatological_analyzer import ClimatologicalAnalyzer

try:
    from config import PARAMETER_THRESHOLDS, DEFAULT_LOCATIONS, get_meteomatics_credentials
except ImportError:
    # Fallback if config not available
    PARAMETER_THRESHOLDS = {}
    DEFAULT_LOCATIONS = []
    def get_meteomatics_credentials():
        return "demo", "demo"


class WeatherQueryProcessor:
    """Processor for handling weather queries and coordinating analysis."""
    
    def __init__(self, meteomatics_username: str = None, meteomatics_password: str = None):
        """
        Initialize the query processor.
        
        Args:
            meteomatics_username: Meteomatics API username (optional, will use config if not provided)
            meteomatics_password: Meteomatics API password (optional, will use config if not provided)
        """
        if meteomatics_username is None and meteomatics_password is None:
            # Use credentials from config
            self.data_client = MeteomaticsClient()
            print("🔧 Initialized with configured API credentials")
        else:
            # Use provided credentials
            self.data_client = MeteomaticsClient(meteomatics_username, meteomatics_password)
        
        self.parameter_thresholds = PARAMETER_THRESHOLDS
    
    def process_query(self, location: Dict[str, float], date: str, 
                     parameters: List[str], analysis_years: int = 30) -> Dict[str, Any]:
        """
        Process user query and return analysis.
        
        Args:
            location: Dict with 'lat' and 'lon'
            date: Date string in format 'YYYY-MM-DD'
            parameters: List of weather parameters to analyze
            analysis_years: Number of years of historical data to analyze
        
        Returns:
            Complete analysis results
        """
        results = {
            'location': location,
            'query_date': date,
            'analysis_years': analysis_years,
            'parameters': {}
        }
        
        # Convert date to day of year
        try:
            query_date = datetime.strptime(date, '%Y-%m-%d')
            day_of_year = query_date.timetuple().tm_yday
        except ValueError:
            raise ValueError("Date must be in format YYYY-MM-DD")
        
        # Process each parameter
        for param in parameters:
            try:
                # Fetch historical data
                historical_data = self.data_client.get_historical_data(
                    location['lat'],
                    location['lon'],
                    param,
                    day_of_year,
                    analysis_years
                )
                
                # Perform analysis
                if len(historical_data) > 0:
                    analyzer = ClimatologicalAnalyzer(historical_data)
                    
                    # Get thresholds for this parameter
                    thresholds = self._get_thresholds(param)
                    
                    # Generate assessment
                    assessment = analyzer.generate_risk_assessment(thresholds)
                    
                    # Add parameter-specific information
                    assessment['parameter_info'] = {
                        'code': param,
                        'description': self._get_parameter_description(param),
                        'units': self._get_parameter_units(param),
                        'thresholds_used': thresholds
                    }
                    
                    # Add interpretation
                    assessment['interpretation'] = self._interpret_results(param, assessment)
                    
                    results['parameters'][param] = assessment
                else:
                    results['parameters'][param] = {
                        'error': 'No historical data available'
                    }
                    
            except Exception as e:
                results['parameters'][param] = {
                    'error': str(e)
                }
        
        # Add overall summary
        results['summary'] = self._generate_summary(results)
        
        return results
    
    def _get_thresholds(self, parameter: str) -> Dict[str, Any]:
        """
        Get standard thresholds for different parameters.
        
        Args:
            parameter: Weather parameter code
        
        Returns:
            Dictionary with threshold values
        """
        # Normalize parameter name for lookup
        param_key = parameter.split(':')[0].lower()
        
        return self.parameter_thresholds.get(param_key, {})
    
    def _get_parameter_description(self, parameter: str) -> str:
        """Get human-readable description of parameter."""
        descriptions = {
            't_2m:C': 'Temperature at 2 meters above ground',
            't_max_2m_24h:C': 'Maximum temperature in 24 hours',
            't_min_2m_24h:C': 'Minimum temperature in 24 hours',
            'precip_24h:mm': 'Precipitation in 24 hours',
            'wind_speed_10m:ms': 'Wind speed at 10 meters height',
            'wind_gusts_10m_24h:ms': 'Maximum wind gusts in 24 hours',
            'relative_humidity_2m:p': 'Relative humidity at 2 meters',
            'msl_pressure:hPa': 'Mean sea level pressure',
            'sunshine_duration_24h:h': 'Sunshine duration in 24 hours'
        }
        return descriptions.get(parameter, parameter)
    
    def _get_parameter_units(self, parameter: str) -> str:
        """Extract units from parameter code."""
        if ':' in parameter:
            return parameter.split(':')[1]
        return ''
    
    def _interpret_results(self, parameter: str, assessment: Dict[str, Any]) -> Dict[str, str]:
        """
        Generate human-readable interpretation of results.
        
        Args:
            parameter: Weather parameter
            assessment: Analysis results
        
        Returns:
            Dictionary with interpretations
        """
        interpretation = {}
        
        try:
            mean_val = assessment['basic_stats']['mean']
            std_val = assessment['basic_stats']['std_dev']
            param_key = parameter.split(':')[0].lower()
            
            # Interpret variability
            cv = std_val / abs(mean_val) if mean_val != 0 else 0
            if cv < 0.1:
                interpretation['variability'] = 'Very consistent conditions'
            elif cv < 0.2:
                interpretation['variability'] = 'Fairly consistent conditions'
            elif cv < 0.3:
                interpretation['variability'] = 'Moderate variability'
            else:
                interpretation['variability'] = 'High variability'
            
            # Interpret trend
            trend = assessment.get('trend_analysis', {})
            if trend.get('significant', False):
                direction = trend.get('direction', 'unknown')
                interpretation['trend'] = f'Significant {direction} trend detected'
            else:
                interpretation['trend'] = 'No significant trend detected'
            
            # Parameter-specific interpretations
            if 't_2m' in param_key:
                if mean_val < 10:
                    interpretation['typical_conditions'] = 'Typically cold conditions'
                elif mean_val > 25:
                    interpretation['typical_conditions'] = 'Typically warm conditions'
                else:
                    interpretation['typical_conditions'] = 'Typically mild conditions'
            
            elif 'precip' in param_key:
                if mean_val < 1:
                    interpretation['typical_conditions'] = 'Typically dry conditions'
                elif mean_val > 10:
                    interpretation['typical_conditions'] = 'Typically wet conditions'
                else:
                    interpretation['typical_conditions'] = 'Typically moderate precipitation'
            
            elif 'wind' in param_key:
                if mean_val < 15:
                    interpretation['typical_conditions'] = 'Typically calm conditions'
                elif mean_val > 30:
                    interpretation['typical_conditions'] = 'Typically windy conditions'
                else:
                    interpretation['typical_conditions'] = 'Typically moderate wind'
            
            # Risk level interpretation
            risk_category = assessment.get('risk_category', 'Unknown')
            interpretation['risk_level'] = f'Risk level: {risk_category}'
            
        except Exception as e:
            interpretation['error'] = f'Could not generate interpretation: {e}'
        
        return interpretation
    
    def _generate_summary(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate overall summary of analysis.
        
        Args:
            results: Complete analysis results
        
        Returns:
            Summary information
        """
        summary = {
            'total_parameters': len(results['parameters']),
            'successful_analyses': 0,
            'failed_analyses': 0,
            'overall_risk_levels': [],
            'key_findings': []
        }
        
        for param, analysis in results['parameters'].items():
            if 'error' in analysis:
                summary['failed_analyses'] += 1
            else:
                summary['successful_analyses'] += 1
                
                # Collect risk levels
                risk_level = analysis.get('risk_category', 'Unknown')
                summary['overall_risk_levels'].append(risk_level)
                
                # Collect key findings
                interpretation = analysis.get('interpretation', {})
                if 'trend' in interpretation and 'significant' in interpretation['trend'].lower():
                    summary['key_findings'].append(
                        f"{param}: {interpretation['trend']}"
                    )
        
        # Determine overall risk
        if summary['overall_risk_levels']:
            risk_counts = {}
            for risk in summary['overall_risk_levels']:
                risk_counts[risk] = risk_counts.get(risk, 0) + 1
            
            most_common_risk = max(risk_counts, key=risk_counts.get)
            summary['dominant_risk_level'] = most_common_risk
        
        return summary
    
    def get_location_suggestions(self, query: str) -> List[Dict[str, Any]]:
        """
        Get location suggestions based on query string.
        
        Args:
            query: Location search query
        
        Returns:
            List of location suggestions
        """
        # Use locations from config
        common_locations = DEFAULT_LOCATIONS
        
        if query:
            # Simple filtering based on query
            query_lower = query.lower()
            suggestions = [
                loc for loc in common_locations 
                if query_lower in loc['name'].lower() or query_lower in loc['country'].lower()
            ]
            return suggestions[:5]  # Return top 5 matches
        
        return common_locations[:5]  # Return top 5 if no query
    
    def validate_inputs(self, location: Dict[str, float], date: str, 
                       parameters: List[str]) -> List[str]:
        """
        Validate user inputs and return list of errors.
        
        Args:
            location: Location dictionary
            date: Date string
            parameters: List of parameters
        
        Returns:
            List of validation errors
        """
        errors = []
        
        # Validate location
        if not isinstance(location, dict):
            errors.append("Location must be a dictionary")
        else:
            if 'lat' not in location or 'lon' not in location:
                errors.append("Location must contain 'lat' and 'lon' keys")
            else:
                try:
                    lat = float(location['lat'])
                    lon = float(location['lon'])
                    if not (-90 <= lat <= 90):
                        errors.append("Latitude must be between -90 and 90")
                    if not (-180 <= lon <= 180):
                        errors.append("Longitude must be between -180 and 180")
                except (ValueError, TypeError):
                    errors.append("Latitude and longitude must be numeric")
        
        # Validate date
        try:
            datetime.strptime(date, '%Y-%m-%d')
        except ValueError:
            errors.append("Date must be in format YYYY-MM-DD")
        
        # Validate parameters
        if not parameters:
            errors.append("At least one parameter must be selected")
        
        available_params = self.data_client.get_available_parameters().keys()
        for param in parameters:
            if param not in available_params:
                errors.append(f"Unknown parameter: {param}")
        
        return errors