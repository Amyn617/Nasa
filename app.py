"""
Streamlit web application for Climatological Probability Analysis.
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
from datetime import datetime, timedelta
import json
import sys
import os

# Add src directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

try:
    from src.weather_query_processor import WeatherQueryProcessor
    from src.meteomatics_client import MeteomaticsClient
    from src.climatological_analyzer import ClimatologicalAnalyzer
except ImportError:
    # Fallback imports for when running directly
    from weather_query_processor import WeatherQueryProcessor
    from meteomatics_client import MeteomaticsClient
    from climatological_analyzer import ClimatologicalAnalyzer

# Import configuration
try:
    from config import (APP_CONFIG, UI_CONFIG, get_meteomatics_credentials, 
                       get_api_status, is_api_valid)
except ImportError:
    # Fallback configuration
    APP_CONFIG = {'title': 'Climatological Probability Analysis', 'version': '1.0.0'}
    UI_CONFIG = {'page_config': {'page_title': 'Analysis', 'page_icon': '🌤️', 'layout': 'wide'}}
    def get_meteomatics_credentials():
        return "demo", "demo"
    def get_api_status():
        return {"username": "demo", "valid_until": "N/A", "is_valid": False}
    def is_api_valid():
        return False


# Page configuration
st.set_page_config(
    page_title=APP_CONFIG.get('title', 'Climatological Analysis'),
    page_icon=UI_CONFIG['page_config']['page_icon'],
    layout=UI_CONFIG['page_config']['layout'],
    initial_sidebar_state=UI_CONFIG['page_config']['initial_sidebar_state']
)

# Custom CSS for better styling
st.markdown("""
    <style>
    .main-header {
        font-size: 3rem;
        font-weight: bold;
        text-align: center;
        margin-bottom: 2rem;
        color: #1f77b4;
    }
    .metric-card {
        background-color: #f0f2f6;
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 0.5rem 0;
    }
    .risk-high {
        background-color: #ffebee;
        border-left: 4px solid #f44336;
    }
    .risk-moderate {
        background-color: #fff3e0;
        border-left: 4px solid #ff9800;
    }
    .risk-low {
        background-color: #e8f5e8;
        border-left: 4px solid #4caf50;
    }
    .stAlert > div {
        padding: 1rem;
    }
    </style>
""", unsafe_allow_html=True)


def main():
    """Main application function."""
    
    # Title and description
    st.markdown(f'<h1 class="main-header">🌤️ {APP_CONFIG["title"]}</h1>', 
                unsafe_allow_html=True)
    
    st.markdown(f"""
    **{APP_CONFIG.get('description', 'Analyze historical weather patterns and probabilities for any location and date.')}**
    
    Version: {APP_CONFIG.get('version', '1.0.0')}
    
    This tool provides comprehensive statistical analysis of weather conditions including:
    - Probability calculations for extreme events
    - Long-term trend analysis
    - Risk assessments
    - Return period calculations
    """)
    
    # Initialize session state
    if 'analysis_results' not in st.session_state:
        st.session_state.analysis_results = None
    if 'processor' not in st.session_state:
        st.session_state.processor = None
    
    # Sidebar for inputs
    with st.sidebar:
        st.header("📍 Analysis Parameters")
        
        # API Configuration
        with st.expander("🔧 API Configuration", expanded=False):
            # Show current API status
            api_status = get_api_status()
            
            if api_status['is_valid']:
                st.success(f"✅ API Active: {api_status['username']} (Valid until: {api_status['valid_until']})")
                st.info(f"📅 Days remaining: {api_status.get('days_remaining', 'N/A')}")
            else:
                st.warning(f"⚠️ API Status: {api_status['username']} (Expired or Invalid)")
            
            st.info("Your API credentials are configured in config.py")
            
            # Option to override credentials
            st.markdown("**Override credentials (optional):**")
            username = st.text_input("Username", value="", 
                                    help="Leave empty to use configured credentials")
            password = st.text_input("Password", value="", type="password",
                                   help="Leave empty to use configured credentials")
            
            if st.button("🔗 Test Connection"):
                try:
                    if username and password:
                        test_processor = WeatherQueryProcessor(username, password)
                        st.success("✅ Connection test successful!")
                    else:
                        test_processor = WeatherQueryProcessor()
                        st.success("✅ Using configured credentials - Connection OK!")
                except Exception as e:
                    st.error(f"❌ Connection failed: {e}")
        
        # Initialize processor if not done
        if st.session_state.processor is None:
            # Use configured credentials by default
            st.session_state.processor = WeatherQueryProcessor()
        
        # Location input
        st.subheader("🗺️ Location")
        
        # Location search
        location_query = st.text_input("🔍 Search location", 
                                     placeholder="e.g., New York, London, Tokyo")
        
        if location_query:
            suggestions = st.session_state.processor.get_location_suggestions(location_query)
            if suggestions:
                selected_location = st.selectbox(
                    "Select from suggestions:",
                    options=suggestions,
                    format_func=lambda x: f"{x['name']} ({x['lat']:.2f}, {x['lon']:.2f})"
                )
                latitude = selected_location['lat']
                longitude = selected_location['lon']
            else:
                st.warning("No suggestions found. Enter coordinates manually.")
                latitude = st.number_input("Latitude", value=40.7128, min_value=-90.0, max_value=90.0)
                longitude = st.number_input("Longitude", value=-74.0060, min_value=-180.0, max_value=180.0)
        else:
            latitude = st.number_input("Latitude", value=40.7128, min_value=-90.0, max_value=90.0)
            longitude = st.number_input("Longitude", value=-74.0060, min_value=-180.0, max_value=180.0)
        
        # Date input
        st.subheader("📅 Analysis Date")
        analysis_date = st.date_input(
            "Select date for analysis",
            value=datetime.now().date(),
            help="The system will analyze historical data for this day of year"
        )
        
        # Parameters selection
        st.subheader("🌡️ Weather Parameters")
        available_params = st.session_state.processor.data_client.get_available_parameters()
        
        selected_params = st.multiselect(
            "Select parameters to analyze:",
            options=list(available_params.keys()),
            default=['t_2m:C', 'precip_24h:mm'],
            format_func=lambda x: available_params[x]
        )
        
        # Analysis settings
        st.subheader("⚙️ Analysis Settings")
        years_back = st.slider("Years of historical data", 10, 50, 30)
        confidence_level = st.slider("Confidence level (%)", 80, 99, 95) / 100
        
        # Run analysis button
        if st.button("🚀 Run Analysis", type="primary", use_container_width=True):
            if not selected_params:
                st.error("Please select at least one parameter")
            else:
                with st.spinner("Analyzing climatological data..."):
                    try:
                        location_dict = {'lat': latitude, 'lon': longitude}
                        date_str = analysis_date.strftime('%Y-%m-%d')
                        
                        # Validate inputs
                        errors = st.session_state.processor.validate_inputs(
                            location_dict, date_str, selected_params
                        )
                        
                        if errors:
                            for error in errors:
                                st.error(error)
                        else:
                            # Run analysis with configured or provided credentials
                            if username and password:
                                processor = WeatherQueryProcessor(username, password)
                            else:
                                processor = st.session_state.processor
                                
                            results = processor.process_query(
                                location_dict, date_str, selected_params, years_back
                            )
                            st.session_state.analysis_results = results
                            st.success("Analysis completed successfully!")
                            
                    except Exception as e:
                        st.error(f"Analysis failed: {e}")
    
    # Main content area
    if st.session_state.analysis_results:
        display_results(st.session_state.analysis_results)
    else:
        display_welcome_screen()


def display_welcome_screen():
    """Display welcome screen with instructions."""
    
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col2:
        st.markdown("""
        ### 🚀 Getting Started
        
        1. **Configure Location**: Enter coordinates or search for a location
        2. **Select Date**: Choose the date you want to analyze
        3. **Choose Parameters**: Select weather parameters for analysis
        4. **Run Analysis**: Click the analyze button to get results
        
        ### 📊 What You'll Get
        
        - **Probability Analysis**: Chances of extreme weather events
        - **Historical Trends**: Long-term patterns and changes
        - **Risk Assessment**: Comprehensive risk evaluation
        - **Statistical Insights**: Percentiles, return periods, and more
        
        ### 🌍 Example Locations to Try
        
        - **New York**: 40.71, -74.01
        - **London**: 51.51, -0.13
        - **Tokyo**: 35.68, 139.65
        - **Sydney**: -33.87, 151.21
        """)
        
        # Sample data visualization
        st.subheader("📈 Sample Analysis Preview")
        
        # Create sample data
        dates = pd.date_range(start='1990-01-01', end='2023-12-31', freq='YS')
        sample_temps = 20 + 3 * np.sin(2 * np.pi * np.arange(len(dates)) / 10) + np.random.normal(0, 2, len(dates))
        
        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=dates,
            y=sample_temps,
            mode='lines+markers',
            name='Annual Temperature',
            line=dict(color='#1f77b4', width=2)
        ))
        
        fig.update_layout(
            title="Sample: Historical Temperature Trend",
            xaxis_title="Year",
            yaxis_title="Temperature (°C)",
            height=400
        )
        
        st.plotly_chart(fig, use_container_width=True)


def display_results(results):
    """Display analysis results."""
    
    # Header with location and date info
    location = results['location']
    st.subheader(f"📍 Analysis for Location: {location['lat']:.2f}°, {location['lon']:.2f}°")
    st.info(f"📅 Analysis Date: {results['query_date']} | 📊 Years Analyzed: {results['analysis_years']}")
    
    # Summary section
    summary = results.get('summary', {})
    
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Parameters Analyzed", summary.get('successful_analyses', 0))
    with col2:
        st.metric("Failed Analyses", summary.get('failed_analyses', 0))
    with col3:
        dominant_risk = summary.get('dominant_risk_level', 'Unknown')
        st.metric("Dominant Risk Level", dominant_risk)
    with col4:
        st.metric("Total Parameters", summary.get('total_parameters', 0))
    
    # Key findings
    if summary.get('key_findings'):
        st.subheader("🔍 Key Findings")
        for finding in summary['key_findings']:
            st.info(f"• {finding}")
    
    # Parameter analysis tabs
    param_results = results.get('parameters', {})
    if param_results:
        tabs = st.tabs([f"📊 {param}" for param in param_results.keys()])
        
        for tab, (param, analysis) in zip(tabs, param_results.items()):
            with tab:
                display_parameter_analysis(param, analysis)


def display_parameter_analysis(parameter, analysis):
    """Display analysis for a single parameter."""
    
    if 'error' in analysis:
        st.error(f"Analysis failed: {analysis['error']}")
        return
    
    # Parameter info
    param_info = analysis.get('parameter_info', {})
    st.subheader(f"{param_info.get('description', parameter)}")
    st.caption(f"Units: {param_info.get('units', 'N/A')}")
    
    # Basic statistics
    basic_stats = analysis.get('basic_stats', {})
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("### 📈 Basic Statistics")
        
        metrics_col1, metrics_col2 = st.columns(2)
        with metrics_col1:
            st.metric("Mean", f"{basic_stats.get('mean', 0):.2f}")
            st.metric("Std Dev", f"{basic_stats.get('std_dev', 0):.2f}")
            st.metric("Data Years", basic_stats.get('data_years', 0))
        
        with metrics_col2:
            st.metric("Minimum", f"{basic_stats.get('min_recorded', 0):.2f}")
            st.metric("Maximum", f"{basic_stats.get('max_recorded', 0):.2f}")
            st.metric("Median", f"{basic_stats.get('median', 0):.2f}")
    
    with col2:
        st.markdown("### 🎯 Risk Assessment")
        
        risk_category = analysis.get('risk_category', 'Unknown')
        risk_color = {
            'Low': '🟢', 'Moderate': '🟡', 
            'High': '🟠', 'Very High': '🔴'
        }.get(risk_category, '⚪')
        
        st.markdown(f"**Overall Risk: {risk_color} {risk_category}**")
        
        # Probability metrics
        if 'very_hot_probability' in analysis:
            hot_prob = analysis['very_hot_probability'] * 100
            st.metric("Extreme Heat Probability", f"{hot_prob:.1f}%")
        
        if 'very_cold_probability' in analysis:
            cold_prob = analysis['very_cold_probability'] * 100
            st.metric("Extreme Cold Probability", f"{cold_prob:.1f}%")
        
        if 'comfortable_probability' in analysis:
            comfort_prob = analysis['comfortable_probability'] * 100
            st.metric("Comfortable Conditions", f"{comfort_prob:.1f}%")
    
    # Percentiles chart
    percentiles = analysis.get('percentiles', {})
    if percentiles:
        st.markdown("### 📊 Percentile Analysis")
        
        fig = create_percentile_chart(percentiles, param_info.get('units', ''))
        st.plotly_chart(fig, use_container_width=True)
    
    # Trend analysis
    trend = analysis.get('trend_analysis', {})
    if trend and not trend.get('error'):
        st.markdown("### 📈 Trend Analysis")
        
        trend_col1, trend_col2 = st.columns(2)
        
        with trend_col1:
            if trend.get('significant', False):
                direction = trend.get('direction', 'unknown')
                slope = trend.get('slope', 0)
                st.success(f"**Significant {direction} trend detected**")
                st.write(f"Slope: {slope:.4f} per year")
                st.write(f"P-value: {trend.get('p_value', 1):.4f}")
            else:
                st.info("**No significant trend detected**")
                st.write(f"P-value: {trend.get('p_value', 1):.4f}")
        
        with trend_col2:
            strength = trend.get('trend_strength', 0)
            st.metric("Trend Strength (R)", f"{strength:.3f}")
    
    # Extreme value analysis
    extreme_vals = analysis.get('extreme_values', {})
    if extreme_vals and 'return_values' in extreme_vals:
        st.markdown("### ⚡ Return Period Analysis")
        
        return_values = extreme_vals['return_values']
        
        # Create return period chart
        fig = create_return_period_chart(return_values, param_info.get('units', ''))
        st.plotly_chart(fig, use_container_width=True)
        
        # Return period table
        st.markdown("**Return Period Values:**")
        return_df = pd.DataFrame([
            {"Return Period": period.replace('_year', ' years'), 
             "Expected Value": f"{value:.2f}"}
            for period, value in return_values.items()
        ])
        st.dataframe(return_df, use_container_width=True)
    
    # Interpretation
    interpretation = analysis.get('interpretation', {})
    if interpretation:
        st.markdown("### 💡 Interpretation")
        
        for key, value in interpretation.items():
            if key != 'error':
                formatted_key = key.replace('_', ' ').title()
                st.write(f"**{formatted_key}:** {value}")


def create_percentile_chart(percentiles, units):
    """Create percentile visualization chart."""
    
    percentile_values = list(percentiles.keys())
    percentile_data = list(percentiles.values())
    
    fig = go.Figure()
    
    # Add percentile bars
    fig.add_trace(go.Bar(
        x=percentile_values,
        y=percentile_data,
        marker_color=['#d62728' if 'p9' in p else '#ff7f0e' if 'p7' in p or 'p8' in p 
                     else '#2ca02c' if 'p5' in p else '#1f77b4' for p in percentile_values],
        text=[f"{val:.1f}" for val in percentile_data],
        textposition='auto',
        name='Percentiles'
    ))
    
    fig.update_layout(
        title="Historical Percentile Distribution",
        xaxis_title="Percentile",
        yaxis_title=f"Value ({units})",
        showlegend=False,
        height=400
    )
    
    return fig


def create_return_period_chart(return_values, units):
    """Create return period visualization."""
    
    periods = [int(k.replace('_year', '')) for k in return_values.keys()]
    values = list(return_values.values())
    
    fig = go.Figure()
    
    fig.add_trace(go.Scatter(
        x=periods,
        y=values,
        mode='lines+markers',
        marker=dict(size=8, color='#e74c3c'),
        line=dict(width=3, color='#e74c3c'),
        name='Return Values'
    ))
    
    fig.update_layout(
        title="Return Period Analysis",
        xaxis_title="Return Period (Years)",
        yaxis_title=f"Expected Value ({units})",
        xaxis_type="log",
        height=400,
        showlegend=False
    )
    
    return fig


def create_historical_trend_chart(data, dates, parameter):
    """Create historical trend visualization."""
    
    fig = go.Figure()
    
    fig.add_trace(go.Scatter(
        x=dates,
        y=data,
        mode='lines+markers',
        name='Historical Data',
        line=dict(width=2),
        marker=dict(size=6)
    ))
    
    # Add trend line
    if len(data) > 1:
        z = np.polyfit(range(len(data)), data, 1)
        trend_line = np.poly1d(z)(range(len(data)))
        
        fig.add_trace(go.Scatter(
            x=dates,
            y=trend_line,
            mode='lines',
            name='Trend',
            line=dict(dash='dash', color='red', width=2)
        ))
    
    fig.update_layout(
        title=f"Historical Trend: {parameter}",
        xaxis_title="Year",
        yaxis_title="Value",
        height=400
    )
    
    return fig


if __name__ == "__main__":
    main()