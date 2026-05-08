<?php
/**
 * Backend Diagnostic Tool
 * Shows system status, database connection, and API endpoints
 */

// Don't load the main backend logic, just diagnostics
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/src/config/Env.php';
Env::load();
require_once __DIR__ . '/src/config/Database.php';

$diagnostics = [
    'timestamp' => date('c'),
    'server' => [
        'php_version' => phpversion(),
        'os' => php_uname(),
        'hostname' => gethostname(),
        'extensions' => [
            'mysqli' => extension_loaded('mysqli') ? '✓' : '✗',
            'json' => extension_loaded('json') ? '✓' : '✗',
            'curl' => extension_loaded('curl') ? '✓' : '✗',
            'bcrypt' => extension_loaded('sodium') ? '✓' : '✗',
        ]
    ],
    'configuration' => [
        'PORT' => Env::get('PORT'),
        'NODE_ENV' => Env::get('NODE_ENV'),
        'FRONTEND_URL' => Env::get('FRONTEND_URL'),
        'APP_BASE_PATH' => Env::get('APP_BASE_PATH'),
        'JWT_EXPIRES_IN' => Env::get('JWT_EXPIRES_IN'),
    ],
    'database' => [
        'host' => Env::get('DB_HOST'),
        'user' => Env::get('DB_USER'),
        'database' => Env::get('DB_NAME'),
        'port' => Env::get('DB_PORT'),
        'status' => 'checking...'
    ],
    'cors' => [
        'origins_configured' => Env::get('ALLOWED_ORIGINS'),
        'current_origin' => $_SERVER['HTTP_ORIGIN'] ?? 'none'
    ],
    'api_endpoints' => [
        'health' => '/api/health',
        'programs' => '/api/programs',
        'stories' => '/api/stories',
        'volunteers' => '/api/volunteers',
        'donations' => '/api/donations',
        'team' => '/api/team',
        'messages' => '/api/messages',
        'events' => '/api/events',
        'about' => '/api/about',
        'upload' => '/api/upload',
        'auth' => [
            'login' => '/api/auth/login',
            'me' => '/api/auth/me'
        ]
    ],
    'directories' => [
        'uploads' => is_dir(__DIR__ . '/uploads') ? '✓ exists' : '✗ missing',
        'sessions' => is_dir(__DIR__ . '/sessions') ? '✓ exists' : '✗ missing',
        'src/routes' => is_dir(__DIR__ . '/src/routes') ? '✓ exists' : '✗ missing',
        'src/services' => is_dir(__DIR__ . '/src/services') ? '✓ exists' : '✗ missing',
    ]
];

// Test database connection
try {
    $conn = Database::getConnection();
    $result = $conn->query("SELECT 1");
    if ($result) {
        $diagnostics['database']['status'] = '✓ Connected';
        $diagnostics['database']['query_test'] = '✓ Query successful';
    } else {
        $diagnostics['database']['status'] = '✗ Connection failed';
        $diagnostics['database']['error'] = $conn->error;
    }
} catch (Exception $e) {
    $diagnostics['database']['status'] = '✗ Connection failed';
    $diagnostics['database']['error'] = $e->getMessage();
}

// Test file permissions
$testFile = __DIR__ . '/test_write_' . time() . '.txt';
if (file_put_contents($testFile, 'test')) {
    unlink($testFile);
    $diagnostics['file_system'] = '✓ Write permission OK';
} else {
    $diagnostics['file_system'] = '✗ No write permission';
}

header('Content-Type: application/json');
echo json_encode($diagnostics, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
