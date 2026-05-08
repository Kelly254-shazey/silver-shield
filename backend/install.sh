#!/bin/bash
# Installation script for PHP backend

echo "Installing Silver Shield PHP Backend..."

# Check if PHP is installed
if ! command -v php &> /dev/null; then
    echo "Error: PHP is not installed"
    exit 1
fi

echo "✓ PHP is installed"

# Create necessary directories
mkdir -p backend/uploads backend/sessions
chmod 755 backend/uploads backend/sessions

echo "✓ Directories created"

# Copy .env.example to .env if it doesn't exist
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✓ .env file created (update with your database credentials)"
else
    echo "✓ .env file already exists"
fi

echo ""
echo "Installation complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your database credentials"
echo "2. Run the database schema to create tables"
echo "3. Start the PHP dev server:"
echo "   php -S localhost:8000 -t backend"
echo ""
