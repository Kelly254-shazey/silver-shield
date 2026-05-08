<?php
/**
 * Main Entry Point - PHP Backend
 * Converts all Node.js backend functionality to pure PHP
 */

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0); // Correct for production
ini_set('log_errors', 1);

// Load configuration early for CORS
require_once __DIR__ . '/src/config/Env.php';
Env::load();

// Security headers (with CORS exceptions)
header('X-Content-Type-Options: nosniff');
header('X-XSS-Protection: 1; mode=block');

// Handle CORS - Allow development and production origins
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = explode(',', Env::get('ALLOWED_ORIGINS', 'http://localhost:5173,http://localhost:8000'));
$allowedOrigins = array_map('trim', $allowedOrigins);

$isProduction = Env::get('NODE_ENV') === 'production';

if (in_array($origin, $allowedOrigins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}

if (!$isProduction) {
    // Only allow frame options during development if absolutely necessary
    header('X-Frame-Options: SAMEORIGIN');
} else {
    header('X-Frame-Options: SAMEORIGIN');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 86400');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Autoloader
spl_autoload_register(function ($class) {
    $classPath = __DIR__ . '/src';
    
    // Map class to file
    if (strpos($class, 'Routes') !== false) {
        $file = $classPath . '/routes/' . $class . '.php';
    } elseif (strpos($class, 'Service') !== false) {
        $file = $classPath . '/services/' . $class . '.php';
    } elseif (strpos($class, 'Auth') === 0 || strpos($class, 'RateLimiter') === 0) {
        $file = $classPath . '/middleware/' . $class . '.php';
    } elseif (strpos($class, 'Utils') !== false) {
        $file = $classPath . '/utils/' . $class . '.php';
    } elseif (strpos($class, 'Database') !== false || strpos($class, 'Env') !== false) {
        $file = $classPath . '/config/' . $class . '.php';
    } elseif ($class === 'Router') {
        $file = $classPath . '/Router.php';
    } else {
        return;
    }

    if (file_exists($file)) {
        require_once $file;
    }
});

try {

    // Check global rate limit
    if (!RateLimiter::checkGlobalLimit(1000, 3600)) {
        http_response_code(429);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Rate limit exceeded'
        ]);
        exit;
    }

    // Dispatch request
    $router = new Router();
    $router->dispatch();

} catch (Exception $e) {
    error_log('Fatal error: ' . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error'
    ]);
}
