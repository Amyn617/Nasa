@echo off
REM Setup script for Climatological Probability Analysis
REM Run this script to set up the environment and start the application

echo ======================================================
echo   Climatological Probability Analysis Setup
echo ======================================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher from https://python.org
    pause
    exit /b 1
)

echo Python found: 
python --version

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment
        pause
        exit /b 1
    )
    echo Virtual environment created successfully!
) else (
    echo Virtual environment already exists.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install requirements
echo Installing required packages...
pip install --upgrade pip
pip install -r requirements.txt

if errorlevel 1 (
    echo ERROR: Failed to install requirements
    echo Please check your internet connection and try again
    pause
    exit /b 1
)

echo ======================================================
echo   Setup completed successfully!
echo ======================================================
echo.
echo To start the application:
echo   1. Run: streamlit run app.py
echo   2. Open your browser to http://localhost:8501
echo.
echo To run example analysis:
echo   python example.py
echo.
echo ======================================================

REM Ask if user wants to start the application
set /p "choice=Would you like to start the application now? (y/n): "
if /i "%choice%"=="y" (
    echo Starting Streamlit application...
    streamlit run app.py
)

pause