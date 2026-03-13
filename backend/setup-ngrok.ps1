#!/usr/bin/env pwsh

# Setup ngrok for M-Pesa testing on Windows (PowerShell)

Write-Host "================================" -ForegroundColor Cyan
Write-Host "M-Pesa Development Setup (ngrok)" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if ngrok is installed
try {
    ngrok --version > $null 2>&1
    $ngrokInstalled = $true
}
catch {
    $ngrokInstalled = $false
}

if (-not $ngrokInstalled) {
    Write-Host "Installing ngrok globally..." -ForegroundColor Yellow
    npm install -g ngrok
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "Error: Could not install ngrok via npm. Please install manually:" -ForegroundColor Red
        Write-Host "Visit: https://ngrok.com/download" -ForegroundColor Yellow
        Write-Host ""
        pause
        exit 1
    }
}

Write-Host "ngrok is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Starting ngrok tunnel on port 5000..." -ForegroundColor Cyan
Write-Host ""
Write-Host "====================================" -ForegroundColor Yellow
Write-Host "IMPORTANT STEPS:" -ForegroundColor Red
Write-Host "====================================" -ForegroundColor Yellow
Write-Host "1. Wait for ngrok to display your HTTPS URL (looks like: https://xxx-xxx-xxx.ngrok.io)" -ForegroundColor White
Write-Host "2. Copy that URL" -ForegroundColor White
Write-Host ""
Write-Host "3. Create/Update .env file in the backend directory with:" -ForegroundColor White
Write-Host "   MPESA_CALLBACK_URL=https://your-ngrok-url.ngrok.io/api/mpesa/callback" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Keep this terminal open while testing (ngrok must stay running)" -ForegroundColor White
Write-Host ""
Write-Host "5. Restart your backend server to load the new environment variable" -ForegroundColor White
Write-Host ""
Write-Host "====================================" -ForegroundColor Yellow
Write-Host ""

# Start ngrok on port 5000
ngrok http 5000

pause
