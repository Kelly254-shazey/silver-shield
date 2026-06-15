#!/usr/bin/env php
<?php
/**
 * Backend Server Start Script with PHP Path Detection
 * Works on Windows with or without PHP in PATH
 */

$backendDir = dirname(__FILE__);
chdir($backendDir);

// Try different PHP executables
$phpCommands = [
    'php',  // System PATH
    'C:\xampp\php\php.exe',
    'C:\wamp\bin\php\php.exe',
    'C:\laragon\bin\php\php.exe',
    'C:\Program Files\php\php.exe',
];

$phpFound = null;

echo "\n";
echo "===========================================\n";
echo "Silver Shield Backend Server\n";
echo "===========================================\n\n";

echo "[1/3] Detecting PHP installation...\n";

foreach ($phpCommands as $cmd) {
    $output = shell_exec("$cmd -v 2>&1");
    if ($output && strpos($output, 'PHP') !== false) {
        $phpFound = $cmd;
        echo "✓ Found PHP: $cmd\n";
        break;
    }
}

if (!$phpFound) {
    echo "✗ PHP not found!\n\n";
    echo "Please install PHP from: https://windows.php.net/download/\n";
    echo "Or ensure PHP is added to your system PATH\n\n";
    exit(1);
}

echo "\n[2/3] Starting server on port 8000...\n";
echo "URL: http://localhost:8000\n";
echo "API: http://localhost:8000/api\n";
echo "Press Ctrl+C to stop\n\n";

echo "===========================================\n\n";

echo "[3/3] Server running...\n\n";

// Start the server using the built-in router for API routing
$cmd = "$phpFound -S localhost:8000 router.php";
system($cmd);
