# Climatological Probability Analysis

A comprehensive web application for analyzing climatological data and calculating weather event probabilities using historical data and statistical methods.

## 🌟 Features

- **Interactive Web Interface**: Easy-to-use Streamlit-based UI
- **Meteomatics API Integration**: Access to comprehensive weather data
- **Statistical Analysis**: Probability calculations, trend analysis, and risk assessment
- **Visual Analytics**: Interactive charts and graphs using Plotly
- **Multiple Parameters**: Support for temperature, precipitation, wind speed, humidity, and more
- **Return Period Analysis**: Calculate expected return periods for extreme events
- **Risk Assessment**: Comprehensive risk categorization and interpretation

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- Meteomatics API account (configured in `config.py`)

### Installation

1. **Clone or download this repository**
   ```powershell
   cd "c:\Users\Alienware\Documents\Hackathon\Nasa Space Challenge\Model\Climatological Probability Analysis"
   ```

2. **Create a virtual environment (recommended)**
   ```powershell
   python -m venv venv
   venv\Scripts\activate
   ```

3. **Install required packages**
   ```powershell
   pip install -r requirements.txt
   ```

4. **Configure API credentials (already done!)**
   Your Meteomatics API credentials are pre-configured in `config.py`:
   - Username: `namez_yasser`
   - Valid until: `2025-10-12`

### Running the Application

#### Quick Start
```powershell
python start_app.py
```

#### Manual Start
```powershell
streamlit run app.py
```

#### Test API Connection
```powershell
python test_api.py
```

## 📖 How to Use

### 1. Configure API
- Your Meteomatics API credentials are pre-configured in `config.py`
- The app will automatically use these credentials
- You can override them in the sidebar if needed

### 2. Select Location
- Search for a location by name (e.g., "New York", "London")
- Or enter latitude and longitude coordinates manually

### 3. Choose Analysis Parameters
- **Date**: Select the date you want to analyze
- **Parameters**: Choose weather parameters (temperature, precipitation, etc.)
- **Years**: Set how many years of historical data to analyze (10-50 years)

### 4. Run Analysis
- Click "Run Analysis" button
- Wait for the analysis to complete
- Review results in the main area

## 📊 Understanding the Results

### Basic Statistics
- **Mean**: Average value over the analysis period
- **Standard Deviation**: Measure of variability
- **Min/Max**: Extreme values recorded
- **Data Years**: Number of years analyzed

### Probability Analysis
- **Extreme Event Probabilities**: Chance of exceeding thresholds
- **Comfortable Conditions**: Probability of ideal conditions
- **Return Periods**: Expected frequency of extreme events

### Trend Analysis
- **Trend Detection**: Statistical significance of long-term changes
- **Direction**: Increasing, decreasing, or stable trends
- **Strength**: Correlation coefficient indicating trend reliability

### Risk Assessment
- **Risk Categories**: Low, Moderate, High, Very High
- **Percentile Analysis**: Distribution of historical values
- **Extreme Value Analysis**: Gumbel distribution fitting for return periods

## 🛠️ Technical Details

### Architecture
```
Climatological Probability Analysis/
├── app.py                          # Main Streamlit application
├── config.py                       # Configuration with API credentials
├── start_app.py                     # Quick launcher script
├── test_api.py                     # API connection test script
├── src/
│   ├── meteomatics_client.py      # API client for weather data
│   ├── climatological_analyzer.py  # Statistical analysis engine
│   └── weather_query_processor.py  # Query processing and coordination
├── data/                           # Data storage (generated)
├── requirements.txt                # Python dependencies
└── README.md                      # This file
```

### Key Components

1. **MeteomaticsClient**: Handles API communication and data retrieval
2. **ClimatologicalAnalyzer**: Performs statistical calculations and probability analysis
3. **WeatherQueryProcessor**: Coordinates analysis workflow and handles user queries
4. **Streamlit App**: Provides interactive web interface

### Supported Weather Parameters

- Temperature (2m, max, min)
- Precipitation (24h)
- Wind speed and gusts
- Relative humidity
- Mean sea level pressure
- Sunshine duration

## 🔧 Configuration

### API Setup
Your Meteomatics API credentials are already configured in `config.py`:
- Username: `namez_yasser`
- Password: `3O82Fi0nIZ9iSKF6J768`
- Valid until: `2025-10-12`

The application will automatically use these credentials. You can test the connection by running:
```powershell
python test_api.py
```

### Demo Mode
- The application includes mock data generation for testing
- No API credentials required for demo functionality
- Sample data simulates realistic weather patterns

## 📈 Example Use Cases

### 1. Agricultural Planning
- Analyze frost probability for crop protection
- Assess precipitation patterns for irrigation planning
- Evaluate growing season temperature trends

### 2. Event Planning
- Determine weather probability for outdoor events
- Assess seasonal patterns for optimal scheduling
- Risk analysis for weather-dependent activities

### 3. Climate Research
- Study long-term temperature trends
- Analyze extreme weather event frequency
- Assess climate change impacts on local weather

### 4. Infrastructure Planning
- Design requirements for extreme weather events
- Risk assessment for weather-sensitive infrastructure
- Return period analysis for engineering design

## 🚨 Troubleshooting

### Common Issues

1. **Import Errors**
   ```powershell
   # Reinstall packages
   pip install --upgrade -r requirements.txt
   ```

2. **API Connection Issues**
   - Check internet connection
   - Verify API credentials
   - Use demo mode for testing

3. **Streamlit Not Starting**
   ```powershell
   # Check if streamlit is installed
   streamlit --version
   
   # Reinstall if needed
   pip install streamlit --upgrade
   ```

4. **Port Already in Use**
   ```powershell
   # Use different port
   streamlit run app.py --server.port 8502
   ```

### Performance Tips

- Use shorter time periods (10-20 years) for faster analysis
- Limit the number of parameters analyzed simultaneously
- Use demo mode for development and testing

## 🔮 Future Enhancements

- [ ] Integration with additional weather data sources
- [ ] Machine learning-based pattern recognition
- [ ] Automated report generation (PDF/Word)
- [ ] Multi-location comparison analysis
- [ ] Advanced visualization options
- [ ] Mobile-responsive design improvements
- [ ] Data export functionality (CSV, JSON)
- [ ] Custom threshold configuration
- [ ] Seasonal analysis breakdown
- [ ] Integration with GIS mapping services

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## 📞 Support

For technical support or questions:
1. Check the troubleshooting section above
2. Review the Meteomatics API documentation
3. Open an issue in this repository

---

**Happy Analyzing! 🌤️**