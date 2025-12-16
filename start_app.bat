@echo off
title MedTech Service Application
color 0A

echo.
echo ========================================
echo   MedTech Service Application
echo   Tek Tikla Baslat
echo ========================================
echo.

cd /d "%~dp0"

:: Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] Bagimliliklar yukleniyor...
    call npm install
    echo.
)

echo [INFO] Uygulama baslatiliyor...
echo.
echo ========================================
echo   Backend: http://localhost:3001
echo   Frontend: http://localhost:5173
echo ========================================
echo.
echo   Varsayilan giris: admin / admin123
echo.
echo   Durdurmak icin Ctrl+C basin
echo ========================================
echo.

:: Start both servers concurrently
call npm run dev
