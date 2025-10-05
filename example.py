"""
Example usage script for the Climatological Probability Analysis system.
"""

import sys
import os
from datetime import datetime

# Add src directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from src.weather_query_processor import WeatherQueryProcessor
from src.meteomatics_client import MeteomaticsClient
from src.climatological_analyzer import ClimatologicalAnalyzer


def example_analysis():
    """Run an example analysis to demonstrate the system capabilities."""
    
    print("🌤️ Climatological Probability Analysis - Example")
    print("=" * 50)
    
    # Initialize processor (demo mode)
    processor = WeatherQueryProcessor()
    
    # Example location: New York City
    location = {'lat': 40.7128, 'lon': -74.0060}
    
    # Analysis date: July 15th (summer analysis)
    analysis_date = "2024-07-15"
    
    # Parameters to analyze
    parameters = ['t_2m:C', 'precip_24h:mm', 'wind_speed_10m:ms']
    
    print(f"📍 Location: {location['lat']:.2f}°, {location['lon']:.2f}°")
    print(f"📅 Analysis Date: {analysis_date}")
    print(f"🌡️ Parameters: {', '.join(parameters)}")
    print(f"📊 Historical Period: 30 years")
    print("\n🔄 Running analysis...")
    
    try:
        # Run the analysis
        results = processor.process_query(
            location=location,
            date=analysis_date,
            parameters=parameters,
            analysis_years=30
        )
        
        print("✅ Analysis completed successfully!\n")
        
        # Display summary
        summary = results.get('summary', {})
        print("📋 SUMMARY")
        print("-" * 20)
        print(f"Parameters analyzed: {summary.get('successful_analyses', 0)}")
        print(f"Failed analyses: {summary.get('failed_analyses', 0)}")
        print(f"Dominant risk level: {summary.get('dominant_risk_level', 'Unknown')}")
        
        if summary.get('key_findings'):
            print("\n🔍 Key Findings:")
            for finding in summary['key_findings']:
                print(f"  • {finding}")
        
        # Display parameter results
        param_results = results.get('parameters', {})
        
        for param, analysis in param_results.items():
            print(f"\n📊 {param.upper()} ANALYSIS")
            print("=" * 30)
            
            if 'error' in analysis:
                print(f"❌ Error: {analysis['error']}")
                continue
            
            # Basic statistics
            basic_stats = analysis.get('basic_stats', {})
            print(f"Mean: {basic_stats.get('mean', 0):.2f}")
            print(f"Std Dev: {basic_stats.get('std_dev', 0):.2f}")
            print(f"Min: {basic_stats.get('min_recorded', 0):.2f}")
            print(f"Max: {basic_stats.get('max_recorded', 0):.2f}")
            print(f"Data years: {basic_stats.get('data_years', 0)}")
            
            # Risk assessment
            risk_category = analysis.get('risk_category', 'Unknown')
            print(f"Risk category: {risk_category}")
            
            # Probabilities
            if 'very_hot_probability' in analysis:
                hot_prob = analysis['very_hot_probability'] * 100
                print(f"Extreme heat probability: {hot_prob:.1f}%")
            
            if 'very_cold_probability' in analysis:
                cold_prob = analysis['very_cold_probability'] * 100
                print(f"Extreme cold probability: {cold_prob:.1f}%")
            
            if 'comfortable_probability' in analysis:
                comfort_prob = analysis['comfortable_probability'] * 100
                print(f"Comfortable conditions: {comfort_prob:.1f}%")
            
            # Trend analysis
            trend = analysis.get('trend_analysis', {})
            if trend and not trend.get('error'):
                if trend.get('significant', False):
                    direction = trend.get('direction', 'unknown')
                    print(f"Trend: Significant {direction} trend detected")
                else:
                    print("Trend: No significant trend")
            
            # Percentiles
            percentiles = analysis.get('percentiles', {})
            if percentiles:
                print("Percentiles:")
                for p, value in percentiles.items():
                    print(f"  {p}: {value:.2f}")
            
            # Interpretation
            interpretation = analysis.get('interpretation', {})
            if interpretation:
                print("Interpretation:")
                for key, value in interpretation.items():
                    if key != 'error':
                        formatted_key = key.replace('_', ' ').title()
                        print(f"  {formatted_key}: {value}")
        
        print("\n" + "=" * 50)
        print("🎉 Example analysis completed!")
        print("📚 Check the README.md for more usage instructions.")
        print("🚀 Run 'streamlit run app.py' to start the web interface.")
        
    except Exception as e:
        print(f"❌ Analysis failed: {e}")
        print("💡 Try running with demo data or check your API credentials.")


def simple_temperature_analysis():
    """Simple example focusing on temperature analysis."""
    
    print("\n🌡️ Simple Temperature Analysis Example")
    print("=" * 40)
    
    # Create a simple analyzer with mock temperature data
    # Simulate 30 years of temperature data for a summer day
    import numpy as np
    np.random.seed(42)  # For reproducible results
    
    # Generate realistic temperature data (July in temperate climate)
    base_temp = 28  # 28°C average for July
    temperature_data = base_temp + np.random.normal(0, 4, 30)  # 30 years of data
    
    print(f"📊 Analyzing 30 years of temperature data")
    print(f"🗓️ Representative day: July 15th")
    print(f"🌡️ Base temperature: {base_temp}°C")
    
    # Create analyzer
    analyzer = ClimatologicalAnalyzer(temperature_data)
    
    # Define temperature thresholds
    thresholds = {
        'hot': 32,  # Above 32°C considered hot
        'cold': 15,  # Below 15°C considered cold
        'comfortable': {'min': 20, 'max': 28}  # 20-28°C comfortable
    }
    
    # Run analysis
    assessment = analyzer.generate_risk_assessment(thresholds)
    
    # Display results
    print(f"\n📈 Results:")
    print(f"Mean temperature: {assessment['basic_stats']['mean']:.1f}°C")
    print(f"Standard deviation: {assessment['basic_stats']['std_dev']:.1f}°C")
    print(f"Temperature range: {assessment['basic_stats']['min_recorded']:.1f}°C to {assessment['basic_stats']['max_recorded']:.1f}°C")
    
    if 'very_hot_probability' in assessment:
        hot_prob = assessment['very_hot_probability'] * 100
        print(f"Probability of hot day (>32°C): {hot_prob:.1f}%")
    
    if 'comfortable_probability' in assessment:
        comfort_prob = assessment['comfortable_probability'] * 100
        print(f"Probability of comfortable day (20-28°C): {comfort_prob:.1f}%")
    
    print(f"Risk category: {assessment['risk_category']}")
    
    # Show percentiles
    percentiles = assessment['percentiles']
    print(f"\nPercentiles:")
    print(f"  10th percentile: {percentiles['p10']:.1f}°C")
    print(f"  50th percentile (median): {percentiles['p50']:.1f}°C")
    print(f"  90th percentile: {percentiles['p90']:.1f}°C")


if __name__ == "__main__":
    # Run example analysis
    example_analysis()
    
    # Run simple temperature analysis
    simple_temperature_analysis()
    
    print("\n" + "=" * 50)
    print("🌟 Ready to explore more?")
    print("Run: streamlit run app.py")
    print("=" * 50)