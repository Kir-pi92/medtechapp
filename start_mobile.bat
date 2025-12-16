@echo off
echo MedTech Mobile Test Ortami Baslatiliyor...
echo ------------------------------------------

:: 1. Backend Sunucusunu Baslat (Yeniden)
echo [1/3] Backend Sunucusu baslatiliyor...
start "MedTech Backend" cmd /c "npm run start"

:: 2. Web Uygulamasini Baslat (Opsiyonel, backend'in calistigini gormek icin)
echo [2/3] Web Uygulamasi baslatiliyor...
start "MedTech Web" cmd /c "npm run dev"

:: 3. Mobile Uygulamayi Baslat
echo [3/3] Mobil Uygulama baslatiliyor...
cd MedtechMobile
call npm install
call npm start

pause
