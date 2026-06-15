<?php
/**
 * Quick Setup & Testing Script
 * Run this to verify your PHP backend is working
 */

echo "Silver Shield PHP Backend - Setup Verification\n";
echo "==============================================\n\n";

// Check PHP version
$phpVersion = phpversion();
echo "✓ PHP Version: $phpVersion\n";

// Check required extensions
$extensions = ['mysqli', 'json', 'curl', 'hash', 'openssl'];
foreach ($extensions as $ext) {
    if (extension_loaded($ext)) {
        echo "✓ Extension '$ext' loaded\n";
    } else {
        echo "✗ Extension '$ext' NOT loaded\n";
    }
}

echo "\n";

// Check file structure
$requiredDirs = [
    'src/config',
    'src/middleware',
    'src/services',
    'src/routes',
    'src/utils',
    'db',
    'uploads',
    'sessions'
];

foreach ($requiredDirs as $dir) {
    if (is_dir($dir)) {
        echo "✓ Directory: $dir\n";
    } else {
        echo "✗ Directory: $dir MISSING\n";
    }
}

echo "\n";

// Check critical files
$requiredFiles = [
    'index.php',
    '.htaccess',
    '.env',
    'src/config/Database.php',
    'src/config/Env.php',
    'src/middleware/Auth.php',
    'src/Router.php'
];

foreach ($requiredFiles as $file) {
    if (file_exists($file)) {
        echo "✓ File: $file\n";
    } else {
        echo "✗ File: $file MISSING\n";
    }
}

echo "\n";
echo "Setup Verification Complete!\n\n";
echo "To start the dev server, run:\n";
echo "  php -S localhost:8000 router.php\n\n";
echo "Then access: http://localhost:8000/api/health\n";
