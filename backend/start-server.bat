@echo off
REM Silver Shield PHP Backend Startup Script
REM Starts the PHP development server on port 8000

cd /d "%~dp0"

REM Check if PHP is installed
set PHP_CMD=php
%PHP_CMD% -v >nul 2>&1
if errorlevel 1 (
    if exist "C:\Users\w\Downloads\php-8.5.6-Win32-vs17-x64\php.exe" (
        set PHP_CMD="C:\Users\w\Downloads\php-8.5.6-Win32-vs17-x64\php.exe"
    ) else if exist "C:\xampp\php\php.exe" (
        set PHP_CMD=C:\xampp\php\php.exe
    ) else (
        echo ERROR: PHP is not installed or not in PATH
        echo Please install PHP and add it to your system PATH
        pause
        exit /b 1
    )
)

REM Kill any existing PHP servers on port 8000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000"') do (
    taskkill /PID %%a /F 2>nul
)

echo ========================================
echo Silver Shield Backend - PHP Server
echo ========================================
echo Starting PHP Development Server...
echo Server URL: http://localhost:8000
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start PHP built-in server
%PHP_CMD% -S localhost:8000 index.php

REM If the server exits, show a message
if errorlevel 1 (
    echo.
    echo ERROR: PHP server failed to start
    pause
)
