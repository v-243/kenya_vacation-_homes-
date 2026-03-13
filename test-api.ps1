# First, check if there's an admin in the database
Write-Host "Checking admins in database..." -ForegroundColor Yellow

cd 'c:\Users\domin\housekenya-app\backend'
$admins = node -e "const db = require('./db'); db.connectDB().then(async () => { const [rows] = await db.query('SELECT id, full_name, id_number, password FROM admins LIMIT 1'); console.log(JSON.stringify(rows)); process.exit(0); }).catch(e => { console.error('Error:', e.message); process.exit(1); })" 2>&1

Write-Host "Admins: $admins" -ForegroundColor Cyan
Write-Host ""

# Let's try to login with a test admin first
Write-Host "Attempting to log in..." -ForegroundColor Yellow
$loginUrl = "http://localhost:5000/api/admin/login"
$loginData = @{
    idNumber = "99999999"
    password = "testpass123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $loginUrl -Method Post -Headers @{"Content-Type" = "application/json" } -Body $loginData
    Write-Host "Login response:" -ForegroundColor Green
    $token = $response.token
    Write-Host "Token: $token" -ForegroundColor Cyan
    Write-Host ""
    
    # Now test house creation
    Write-Host "Testing house creation..." -ForegroundColor Yellow
    
    # Create a test image
    $pngBytes = [byte[]]@(
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
        0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xF8, 0xCF, 0xC0, 0x00,
        0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB4, 0x00, 0x00, 0x00,
        0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    )
    
    $testImagePath = "C:\temp\test-house.png"
    [System.IO.File]::WriteAllBytes($testImagePath, $pngBytes)
    
    # Use curl to send the request
    Write-Host "Sending multipart request to API..." -ForegroundColor Cyan
    $curlCmd = "curl -v -X POST http://localhost:5000/api/houses " +
    "-H `"Authorization: Bearer $token`" " +
    "-F `"image=@$testImagePath`" " +
    "-F `"name=Test House`" " +
    "-F `"location=Nairobi`" " +
    "-F `"price=5000`" " +
    "-F `"beds=3`" " +
    "-F `"baths=2`" " +
    "-F `"description=A beautiful test house`""
    
    Write-Host "Command: $curlCmd" -ForegroundColor DarkGray
    Write-Host ""
    
    & cmd /c $curlCmd
    
    Remove-Item $testImagePath -Force
    
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
}
