@echo off
REM Setup ngrok for M-Pesa testing on Windows

echo ================================
echo M-Pesa Development Setup (ngrok)
echo ================================
echo.

REM Check if ngrok is installed
where ngrok >nul 2>nul
if errorlevel 1 (
    echo Installing ngrok...
    REM Using npm to install ngrok globally
    npm install -g ngrok
    if errorlevel 1 (
        echo.
        echo Error: Could not install ngrok. Please install manually:
        echo Visit: https://ngrok.com/download
        echo.
        pause
        exit /b 1
    )
)

echo ngrok is ready!
echo.
echo Starting ngrok tunnel on port 5000...
echo.
echo ====================================
echo IMPORTANT:
echo 1. Copy the HTTPS URL shown below
echo 2. Set environment variable:
echo    MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/mpesa/callback
echo 3. Keep this terminal open while testing
echo ====================================
echo.

REM Start ngrok on port 5000
ngrok http 5000

pause
