#!/bin/bash

# Silver Shield PHP Backend Startup Script
# Starts the PHP development server on port 8000

cd "$(dirname "$0")"

# Check if PHP is installed
if ! command -v php &> /dev/null; then
    echo "ERROR: PHP is not installed"
    echo "Please install PHP to run the backend"
    exit 1
fi

echo "========================================"
echo "Silver Shield Backend - PHP Server"
echo "========================================"
echo "Starting PHP Development Server..."
echo "Server URL: http://localhost:8000"
echo "Press Ctrl+C to stop the server"
echo "========================================"
echo ""

# Kill any existing PHP servers on port 8000
lsof -ti:8000 | xargs kill -9 2>/dev/null

# Start PHP built-in server
php -S localhost:8000 index.php

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: PHP server failed to start"
fi
