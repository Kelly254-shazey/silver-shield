@echo off
REM Silver Shield Backend - Complete Diagnostic & Startup
REM This script verifies the backend is ready to run

cd /d "%~dp0"

echo.
echo ========================================
echo Silver Shield Backend Verification
echo ========================================
echo.

REM Check PHP
echo [1/5] Checking PHP installation...
set PHP_CMD=php
%PHP_CMD% -v >nul 2>&1
if errorlevel 1 (
    if exist "C:\Users\w\Downloads\php-8.5.6-Win32-vs17-x64\php.exe" (
        set PHP_CMD="C:\Users\w\Downloads\php-8.5.6-Win32-vs17-x64\php.exe"
        echo OK: Found PHP in Downloads
    ) else if exist "C:\xampp\php\php.exe" (
        set PHP_CMD=C:\xampp\php\php.exe
        echo OK: Found PHP in XAMPP
    ) else (
        echo ERROR: PHP is not installed or not in PATH
        echo Please install PHP and add it to your system PATH
        pause
        exit /b 1
    )
) else (
    echo OK: PHP found in system PATH
)
echo.

REM Check for required extensions
%PHP_CMD% -m | findstr "mysqli" >nul 2>&1
if errorlevel 1 echo ERROR: PHP extension 'mysqli' is not enabled. & set EXT_ERR=1
%PHP_CMD% -m | findstr "curl" >nul 2>&1
if errorlevel 1 echo ERROR: PHP extension 'curl' is not enabled. & set EXT_ERR=1
%PHP_CMD% -m | findstr "openssl" >nul 2>&1
if errorlevel 1 echo ERROR: PHP extension 'openssl' is not enabled. & set EXT_ERR=1

if defined EXT_ERR (
    echo.
    echo Please enable the missing extensions in your php.ini file.
    pause
    exit /b 1
)

REM Check required files
echo [2/5] Checking required files...
if not exist "index.php" (
    echo ERROR: index.php not found
    pause
    exit /b 1
)
if not exist "src\config\Database.php" (
    echo ERROR: Database.php not found
    pause
    exit /b 1
)
if not exist ".env" (
    echo WARNING: .env file not found. Using defaults.
)
echo OK: Required files present
echo.

REM Run diagnostic
echo [3/5] Running backend diagnostic...
%PHP_CMD% diagnose.php > temp_diag.json 2>&1
if exist temp_diag.json (
    echo OK: Diagnostic completed (see diagnose.php)
    del temp_diag.json
) else (
    echo WARNING: Diagnostic failed
)
echo.

REM Test database connection
echo [4/5] Testing database connection...
%PHP_CMD% test-db.php >nul 2>&1
if errorlevel 1 (
    echo WARNING: Database connection test failed
    echo Check your .env database credentials
) else (
    echo OK: Database connection successful
)
echo.

REM Kill existing servers
echo [5/5] Preparing to start server...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F 2>nul
)

echo.
echo ========================================
echo Starting Silver Shield Backend
echo ========================================
echo.
echo Server URL: http://localhost:8000
echo API Base:   http://localhost:8000/api
echo Health:     http://localhost:8000/api/health
echo Diagnose:   http://localhost:8000/diagnose.php
echo.
echo Frontend should connect to: http://localhost:8000/api
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start PHP server with proper logging
%PHP_CMD% -S localhost:8000 index.php 2>&1

echo.
echo Server stopped.
pause
