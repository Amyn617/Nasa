"""
Quick launcher for the Climatological Probability Analysis application.
"""

import os
import sys
import subprocess

def main():
    """Launch the application with configured credentials."""
    
    print("🌤️ Climatological Probability Analysis Launcher")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("config.py"):
        print("❌ Error: config.py not found")
        print("Please run this script from the application directory")
        return
    
    # Check if app.py exists
    if not os.path.exists("app.py"):
        print("❌ Error: app.py not found")
        print("Please run this script from the application directory")
        return
    
    try:
        # Import config to check credentials
        from config import get_api_status
        
        api_status = get_api_status()
        print(f"📋 API Status: {api_status['username']}")
        print(f"📅 Valid until: {api_status['valid_until']}")
        
        if api_status['is_valid']:
            print("✅ API credentials are valid")
        else:
            print("⚠️  API credentials may be expired")
        
    except Exception as e:
        print(f"⚠️  Could not check API status: {e}")
    
    print("\n🚀 Starting Streamlit application...")
    print("📱 Your browser should open automatically")
    print("🌐 If not, navigate to: http://localhost:8501")
    print("\n" + "=" * 50)
    
    try:
        # Launch Streamlit
        subprocess.run([sys.executable, "-m", "streamlit", "run", "app.py"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start application: {e}")
        print("\n💡 Try running manually:")
        print("   streamlit run app.py")
    except KeyboardInterrupt:
        print("\n👋 Application stopped by user")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    main()
