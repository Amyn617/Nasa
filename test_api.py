"""
Test script to validate Meteomatics API credentials.
"""

import sys
import os
from datetime import datetime

# Add src directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

try:
    from config import get_meteomatics_credentials, get_api_status, is_api_valid
    from src.meteomatics_client import MeteomaticsClient
    from src.weather_query_processor import WeatherQueryProcessor
except ImportError as e:
    print(f"Import error: {e}")
    print("Make sure all required packages are installed: pip install -r requirements.txt")
    sys.exit(1)

def test_api_credentials():
    """Test the API credentials and connection."""
    
    print("🧪 Testing Meteomatics API Connection")
    print("=" * 50)
    
    # Check API status from config
    api_status = get_api_status()
    print(f"📋 API Status Information:")
    print(f"   Username: {api_status['username']}")
    print(f"   Valid until: {api_status['valid_until']}")
    print(f"   Is valid: {api_status['is_valid']}")
    
    if 'days_remaining' in api_status:
        days_remaining = api_status['days_remaining']
        print(f"   Days remaining: {days_remaining}")
        
        if days_remaining < 7:
            print("   ⚠️  WARNING: API credentials expire soon!")
        elif days_remaining < 0:
            print("   ❌ ERROR: API credentials have expired!")
    
    print("\n🔗 Testing API Connection...")
    
    try:
        # Initialize client with configured credentials
        client = MeteomaticsClient()
        print("✅ Meteomatics client initialized successfully")
        
        # Test a simple query
        print("\n🌡️ Testing weather data query...")
        
        # Simple test: get current temperature for New York
        test_location = {'lat': 40.7128, 'lon': -74.0060}  # New York
        test_date = datetime.now().strftime('%Y-%m-%d')
        
        processor = WeatherQueryProcessor()
        
        # Test with a single parameter
        results = processor.process_query(
            location=test_location,
            date=test_date,
            parameters=['t_2m:C'],  # Just temperature
            analysis_years=10  # Smaller dataset for testing
        )
        
        if 'parameters' in results and 't_2m:C' in results['parameters']:
            param_result = results['parameters']['t_2m:C']
            if 'error' not in param_result:
                stats = param_result.get('basic_stats', {})
                print(f"✅ API test successful!")
                print(f"   Sample data: Mean temperature = {stats.get('mean', 'N/A'):.1f}°C")
                print(f"   Data years: {stats.get('data_years', 'N/A')}")
                return True
            else:
                print(f"❌ API returned error: {param_result['error']}")
                return False
        else:
            print("❌ Unexpected response format from API")
            return False
            
    except Exception as e:
        print(f"❌ API test failed: {e}")
        print("\n💡 Troubleshooting tips:")
        print("   1. Check your internet connection")
        print("   2. Verify your API credentials in config.py")
        print("   3. Ensure your API subscription is active")
        print("   4. Check if your IP is whitelisted (if required)")
        return False

def test_demo_mode():
    """Test the application in demo mode with mock data."""
    
    print("\n🎭 Testing Demo Mode (Mock Data)")
    print("=" * 50)
    
    try:
        # Create client with dummy credentials to test mock data
        client = MeteomaticsClient("demo", "demo")
        processor = WeatherQueryProcessor("demo", "demo")
        
        # Test with mock data
        test_location = {'lat': 40.7128, 'lon': -74.0060}
        test_date = "2024-07-15"
        
        results = processor.process_query(
            location=test_location,
            date=test_date,
            parameters=['t_2m:C', 'precip_24h:mm'],
            analysis_years=30
        )
        
        print("✅ Demo mode test successful!")
        print("   The application can run with mock data when API is unavailable")
        
        # Show sample results
        for param, result in results.get('parameters', {}).items():
            if 'error' not in result:
                stats = result.get('basic_stats', {})
                print(f"   {param}: Mean = {stats.get('mean', 'N/A'):.1f}")
        
        return True
        
    except Exception as e:
        print(f"❌ Demo mode test failed: {e}")
        return False

def main():
    """Run all tests."""
    
    print("🔍 Meteomatics API Test Suite")
    print("=" * 50)
    
    # Test 1: API credentials and connection
    api_success = test_api_credentials()
    
    # Test 2: Demo mode
    demo_success = test_demo_mode()
    
    # Summary
    print("\n📊 Test Summary")
    print("=" * 30)
    print(f"API Test: {'✅ PASS' if api_success else '❌ FAIL'}")
    print(f"Demo Mode: {'✅ PASS' if demo_success else '❌ FAIL'}")
    
    if api_success:
        print("\n🎉 Great! Your API credentials are working.")
        print("   You can run the full application with real weather data.")
    elif demo_success:
        print("\n⚠️  API connection failed, but demo mode works.")
        print("   You can still use the application with mock data for testing.")
    else:
        print("\n❌ Both tests failed. Please check your setup.")
    
    print("\n🚀 To start the application, run:")
    print("   streamlit run app.py")

if __name__ == "__main__":
    main()
