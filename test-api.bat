@echo off
REM Create test image (simple 1x1 PNG)
powershell -Command "[byte[]]$bytes = 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xF8, 0xCF, 0xC0, 0x00, 0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82; [System.IO.File]::WriteAllBytes('test.png', $bytes)"

REM First, log in to get a token (assuming admin ID 1 exists with password 'test')
echo Testing admin login...
for /f "delims=" %%A in ('curl -s -X POST http://localhost:5000/api/admin/login ^
  -H "Content-Type: application/json" ^
  -d "{\"idNumber\":\"99999999\",\"password\":\"testpass123\"}" ^
  ^| powershell -Command "$input | ConvertFrom-Json | Select-Object -ExpandProperty token"') do set TOKEN=%%A

echo Token: %TOKEN%

REM If no token was received, try without a token (will fail but will show error)
if "%TOKEN%"=="" (
  echo No token received. Testing without authentication...
  set TOKEN="no-token"
)

echo.
echo Testing house creation...
curl -v -X POST http://localhost:5000/api/houses ^
  -H "Authorization: Bearer %TOKEN%" ^
  -F "image=@test.png" ^
  -F "name=Test House" ^
  -F "location=Nairobi" ^
  -F "price=5000" ^
  -F "beds=3" ^
  -F "baths=2" ^
  -F "description=A test house"

REM Cleanup
del test.png
