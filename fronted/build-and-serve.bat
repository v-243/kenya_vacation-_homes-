@echo off
echo Building React app and copying uploaded files...
cd /d "%~dp0"
npm run build
echo Build complete! Files are ready to be served.
echo.
echo To serve the app, run one of these commands:
echo - npx serve -s build -l 3000
echo - python -m http.server 3000 -d build
echo - Any other static file server pointing to the 'build' directory
echo.
echo Your uploaded images and videos are now included in the build!