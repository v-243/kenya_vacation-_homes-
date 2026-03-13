#!/usr/bin/env pwsh

# Setup Script for House Kenya Admin System (Windows PowerShell)
# This script sets up the database and creates the original admin account

Write-Host "================================" -ForegroundColor Cyan
Write-Host "House Kenya Admin Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check and install nodemailer if needed
Write-Host "✓ Checking dependencies..." -ForegroundColor Green
Push-Location backend
npm list nodemailer > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installing nodemailer..." -ForegroundColor Yellow
    npm install nodemailer
}
Pop-Location

# Step 2: Run the original admin creation script
Write-Host "✓ Setting up admin system..." -ForegroundColor Green
Push-Location backend
node scripts/create_original_admin.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Admin system setup complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Default Admin Credentials:" -ForegroundColor Yellow
    Write-Host "  Email: admin@housekenya.com"
    Write-Host "  Password: Admin@123"
    Write-Host ""
    Write-Host "⚠️  IMPORTANT:" -ForegroundColor Red
    Write-Host "  1. Change the default password immediately after first login"
    Write-Host "  2. Configure email settings in .env:"
    Write-Host "     - EMAIL_USER=your-email@gmail.com"
    Write-Host "     - EMAIL_PASS=your-app-password"
    Write-Host "  3. Set FRONTEND_URL in .env to your frontend URL"
    Write-Host ""
    Write-Host "To start the backend server, run:" -ForegroundColor Cyan
    Write-Host "  npm start"
}
else {
    Write-Host "✗ Error during setup. Please check the error messages above." -ForegroundColor Red
    exit 1
}

Pop-Location
