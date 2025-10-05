"""
Statistical analysis module for climatological probability calculations.
"""

import numpy as np
import pandas as pd
from scipy import stats
from typing import Dict, Any, Tuple, List
import warnings


class ClimatologicalAnalyzer:
    """Analyzer for calculating climatological probabilities and risk assessments."""
    
    def __init__(self, historical_data: np.ndarray):
        """
        Initialize with historical data array.
        
        Args:
            historical_data: numpy array of values across years
        """
        self.data = np.array(historical_data)
        self.data = self.data[~np.isnan(self.data)]  # Remove NaN values
        self.n_years = len(self.data)
        
        if self.n_years == 0:
            raise ValueError("No valid data points provided")
        
        if self.n_years < 10:
            warnings.warn(f"Only {self.n_years} years of data available. Results may be less reliable.")
    
    def calculate_probability(self, threshold: float, condition: str = 'exceeds') -> float:
        """
        Calculate probability of exceeding/falling below threshold.
        
        Args:
            threshold: Value to compare against
            condition: 'exceeds' or 'below'
        
        Returns:
            Probability (0-1)
        """
        if condition == 'exceeds':
            count = np.sum(self.data > threshold)
        elif condition == 'below':
            count = np.sum(self.data < threshold)
        else:
            raise ValueError("Condition must be 'exceeds' or 'below'")
        
        probability = count / self.n_years
        return probability
    
    def get_percentiles(self) -> Dict[str, float]:
        """
        Calculate key percentiles.
        
        Returns:
            Dictionary of percentile values
        """
        return {
            'p10': np.percentile(self.data, 10),
            'p25': np.percentile(self.data, 25),
            'p50': np.percentile(self.data, 50),  # Median
            'p75': np.percentile(self.data, 75),
            'p90': np.percentile(self.data, 90),
            'p95': np.percentile(self.data, 95),
            'p99': np.percentile(self.data, 99)
        }
    
    def detect_trend(self) -> Dict[str, Any]:
        """
        Detect if there's a significant trend over time.
        
        Returns:
            Trend slope and p-value
        """
        years = np.arange(self.n_years)
        
        try:
            slope, intercept, r_value, p_value, std_err = stats.linregress(years, self.data)
            
            return {
                'slope': slope,
                'intercept': intercept,
                'r_value': r_value,
                'p_value': p_value,
                'std_err': std_err,
                'significant': p_value < 0.05,
                'direction': 'increasing' if slope > 0 else 'decreasing',
                'trend_strength': abs(r_value)
            }
        except Exception as e:
            return {
                'slope': 0,
                'p_value': 1,
                'significant': False,
                'direction': 'no trend',
                'error': str(e)
            }
    
    def get_comfortable_probability(self, min_comfortable: float, max_comfortable: float) -> float:
        """
        Calculate probability of comfortable conditions.
        
        Args:
            min_comfortable: Minimum comfortable value
            max_comfortable: Maximum comfortable value
        
        Returns:
            Probability of comfortable conditions
        """
        comfortable_count = np.sum((self.data >= min_comfortable) & 
                                   (self.data <= max_comfortable))
        return comfortable_count / self.n_years
    
    def calculate_return_period(self, threshold: float, condition: str = 'exceeds') -> float:
        """
        Calculate return period for extreme values.
        
        Args:
            threshold: Threshold value
            condition: 'exceeds' or 'below'
        
        Returns:
            Return period in years
        """
        probability = self.calculate_probability(threshold, condition)
        if probability == 0:
            return float('inf')
        return 1 / probability
    
    def get_extreme_value_analysis(self) -> Dict[str, Any]:
        """
        Perform extreme value analysis using Gumbel distribution.
        
        Returns:
            Extreme value statistics
        """
        try:
            # Fit Gumbel distribution to annual maxima
            params = stats.gumbel_r.fit(self.data)
            
            # Calculate return values for different periods
            return_periods = [2, 5, 10, 20, 50, 100]
            return_values = {}
            
            for period in return_periods:
                probability = 1 - (1 / period)
                return_value = stats.gumbel_r.ppf(probability, *params)
                return_values[f'{period}_year'] = return_value
            
            return {
                'distribution_params': params,
                'return_values': return_values,
                'goodness_of_fit': self._gumbel_goodness_of_fit(params)
            }
        except Exception as e:
            return {'error': str(e)}
    
    def _gumbel_goodness_of_fit(self, params: Tuple) -> Dict[str, float]:
        """Calculate goodness of fit for Gumbel distribution."""
        try:
            # Kolmogorov-Smirnov test
            ks_stat, ks_p_value = stats.kstest(self.data, 
                                             lambda x: stats.gumbel_r.cdf(x, *params))
            
            return {
                'ks_statistic': ks_stat,
                'ks_p_value': ks_p_value,
                'fit_quality': 'good' if ks_p_value > 0.05 else 'poor'
            }
        except:
            return {'fit_quality': 'unknown'}
    
    def generate_risk_assessment(self, thresholds: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate comprehensive risk assessment.
        
        Args:
            thresholds: Dictionary with 'hot', 'cold', 'comfortable' thresholds
        
        Returns:
            Risk assessment dictionary
        """
        assessment = {
            'basic_stats': {
                'mean': np.mean(self.data),
                'median': np.median(self.data),
                'std_dev': np.std(self.data),
                'min_recorded': np.min(self.data),
                'max_recorded': np.max(self.data),
                'data_years': self.n_years
            },
            'percentiles': self.get_percentiles(),
            'trend_analysis': self.detect_trend()
        }
        
        # Add threshold-based probabilities if thresholds provided
        if thresholds:
            if 'hot' in thresholds:
                assessment['very_hot_probability'] = self.calculate_probability(
                    thresholds['hot'], 'exceeds')
                assessment['hot_return_period'] = self.calculate_return_period(
                    thresholds['hot'], 'exceeds')
            
            if 'cold' in thresholds:
                assessment['very_cold_probability'] = self.calculate_probability(
                    thresholds['cold'], 'below')
                assessment['cold_return_period'] = self.calculate_return_period(
                    thresholds['cold'], 'below')
            
            if 'comfortable' in thresholds:
                comfort = thresholds['comfortable']
                assessment['comfortable_probability'] = self.get_comfortable_probability(
                    comfort['min'], comfort['max'])
        
        # Add extreme value analysis
        assessment['extreme_values'] = self.get_extreme_value_analysis()
        
        # Risk categorization
        assessment['risk_category'] = self._categorize_risk(assessment)
        
        return assessment
    
    def _categorize_risk(self, assessment: Dict[str, Any]) -> str:
        """Categorize overall risk level based on assessment."""
        try:
            std_dev = assessment['basic_stats']['std_dev']
            mean = assessment['basic_stats']['mean']
            
            # Calculate coefficient of variation
            cv = std_dev / abs(mean) if mean != 0 else float('inf')
            
            # Simple risk categorization based on variability
            if cv < 0.1:
                return 'Low'
            elif cv < 0.3:
                return 'Moderate'
            elif cv < 0.5:
                return 'High'
            else:
                return 'Very High'
        except:
            return 'Unknown'
    
    def get_monthly_statistics(self, dates: List[str] = None) -> Dict[int, Dict[str, float]]:
        """
        Calculate monthly statistics if date information is available.
        
        Args:
            dates: List of date strings corresponding to data points
        
        Returns:
            Dictionary with monthly statistics
        """
        if dates is None or len(dates) != len(self.data):
            return {}
        
        try:
            df = pd.DataFrame({
                'value': self.data,
                'date': pd.to_datetime(dates)
            })
            
            df['month'] = df['date'].dt.month
            monthly_stats = {}
            
            for month in range(1, 13):
                month_data = df[df['month'] == month]['value']
                if len(month_data) > 0:
                    monthly_stats[month] = {
                        'mean': month_data.mean(),
                        'std': month_data.std(),
                        'min': month_data.min(),
                        'max': month_data.max(),
                        'count': len(month_data)
                    }
            
            return monthly_stats
        except Exception as e:
            print(f"Error calculating monthly statistics: {e}")
            return {}
    
    def confidence_interval(self, confidence_level: float = 0.95) -> Tuple[float, float]:
        """
        Calculate confidence interval for the mean.
        
        Args:
            confidence_level: Confidence level (e.g., 0.95 for 95%)
        
        Returns:
            Tuple of (lower_bound, upper_bound)
        """
        alpha = 1 - confidence_level
        mean = np.mean(self.data)
        std_err = stats.sem(self.data)  # Standard error of mean
        
        # Use t-distribution for small samples
        if self.n_years < 30:
            t_val = stats.t.ppf(1 - alpha/2, self.n_years - 1)
            margin_error = t_val * std_err
        else:
            z_val = stats.norm.ppf(1 - alpha/2)
            margin_error = z_val * std_err
        
        return (mean - margin_error, mean + margin_error)