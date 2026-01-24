@echo off
echo Converting products.json to products-data.js...
node convert.js
if %errorlevel% neq 0 (
    echo.
    echo Error: Make sure Node.js is installed
    pause
    exit /b 1
)
echo.
echo Success! You can now open HTML files directly.
echo Note: On GitHub Pages, the original JSON fetch will work fine.
pause
