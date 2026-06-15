@echo off
REM Find PHP Installation and Start Backend Server
REM This script searches common locations for PHP and starts the server

setlocal enabledelayedexpansion

echo.
echo ========================================
echo Silver Shield Backend Launcher
echo ========================================
echo.

REM List of common PHP locations
set "PHP_PATHS="C:\Users\w\Downloads\php-8.5.6-Win32-vs17-x64\php.exe" C:\php\php.exe C:\xampp\php\php.exe C:\wamp\bin\php\php.exe C:\laragon\bin\php\php.exe C:\Program Files\php\php.exe C:\Program Files (x86)\php\php.exe"

set "PHP_FOUND="

echo [1/2] Searching for PHP installation...
for %%P in (%PHP_PATHS%) do (
    if exist "%%P" (
        set "PHP_FOUND=%%P"
        echo Found PHP: %%P
        goto :found
    )
)

REM Try using where command
for /f "tokens=*" %%A in ('where php 2^>nul') do (
    set "PHP_FOUND=%%A"
    echo Found PHP: %%A
    goto :found
)

echo.
echo ERROR: PHP not found in standard locations!
echo.
echo Please install PHP from: https://windows.php.net/download/
echo Or add PHP to your system PATH
echo.
echo Common installations:
echo   - XAMPP: C:\xampp\php\php.exe
echo   - WAMP: C:\wamp\bin\php\php.exe
echo   - Laragon: C:\laragon\bin\php\php.exe
echo.
pause
exit /b 1

:found
echo.
echo [2/2] Starting backend server...
echo.
echo ========================================
echo Server Information
echo ========================================
echo PHP: !PHP_FOUND!
echo Port: 8000
echo URL: http://localhost:8000
echo API: http://localhost:8000/api
echo Health: http://localhost:8000/api/health
echo ========================================
echo.
echo Server starting... Press Ctrl+C to stop
echo.

cd /d "%~dp0"
"!PHP_FOUND!" -S localhost:8000 router.php

echo.
echo Server stopped.
pause
