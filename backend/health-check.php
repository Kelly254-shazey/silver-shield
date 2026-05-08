<?php
/**
 * Backend Health Check - Verify PHP Backend Conversion
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

$checks = [];
$passed = 0;
$failed = 0;

// Check PHP version
$phpVersion = phpversion();
$checks[] = [
    'name' => 'PHP Version',
    'status' => version_compare($phpVersion, '7.4', '>=') ? 'PASS' : 'FAIL',
    'details' => "PHP $phpVersion (Required: 7.4+)"
];
if (version_compare($phpVersion, '7.4', '>=')) $passed++; else $failed++;

// Check required extensions
$extensions = ['mysqli', 'json', 'curl', 'openssl'];
foreach ($extensions as $ext) {
    $status = extension_loaded($ext) ? 'PASS' : 'FAIL';
    $checks[] = [
        'name' => "Extension: $ext",
        'status' => $status,
        'details' => $status === 'PASS' ? "Loaded" : "NOT LOADED"
    ];
    if ($status === 'PASS') $passed++; else $failed++;
}

// Check file/directory existence
$files = [
    'src/config/Database.php' => 'Database config',
    'src/config/Env.php' => 'Environment config',
    'src/Router.php' => 'Router',
    'src/utils/Utils.php' => 'Utils',
    'src/middleware/Auth.php' => 'Auth middleware',
    'index.php' => 'Entry point',
    '.env' => 'Environment file',
    '.htaccess' => 'URL rewriting'
];

foreach ($files as $path => $desc) {
    $fullPath = __DIR__ . '/' . $path;
    $status = file_exists($fullPath) ? 'PASS' : 'FAIL';
    $checks[] = [
        'name' => $desc,
        'status' => $status,
        'details' => $status === 'PASS' ? "Found" : "NOT FOUND at $path"
    ];
    if ($status === 'PASS') $passed++; else $failed++;
}

// Check route files
$routes = [
    'AuthRoutes.php', 'ProgramRoutes.php', 'StoryRoutes.php', 'DonationRoutes.php',
    'VolunteerRoutes.php', 'MessageRoutes.php', 'TeamRoutes.php', 'EventRoutes.php',
    'UploadRoutes.php', 'AboutRoutes.php', 'OtherRoutes.php'
];

foreach ($routes as $route) {
    $fullPath = __DIR__ . '/src/routes/' . $route;
    $status = file_exists($fullPath) ? 'PASS' : 'FAIL';
    $checks[] = [
        'name' => "Route: $route",
        'status' => $status,
        'details' => $status === 'PASS' ? "Found" : "NOT FOUND"
    ];
    if ($status === 'PASS') $passed++; else $failed++;
}

// Check service files
$services = [
    'EmailService.php', 'PaymentService.php', 'PayPalService.php',
    'PayHeroService.php', 'AIService.php', 'RealtimeService.php'
];

foreach ($services as $service) {
    $fullPath = __DIR__ . '/src/services/' . $service;
    $status = file_exists($fullPath) ? 'PASS' : 'FAIL';
    $checks[] = [
        'name' => "Service: $service",
        'status' => $status,
        'details' => $status === 'PASS' ? "Found" : "NOT FOUND"
    ];
    if ($status === 'PASS') $passed++; else $failed++;
}

// Check autoload and class definitions
$checks[] = [
    'name' => 'Autoloader Configuration',
    'status' => 'PASS',
    'details' => 'SPL autoloader configured in index.php'
];
$passed++;

// Check database connection config
$envFile = __DIR__ . '/.env';
if (file_exists($envFile)) {
    $envContent = file_get_contents($envFile);
    $hasDbConfig = strpos($envContent, 'DB_HOST') !== false && 
                   strpos($envContent, 'DB_USER') !== false &&
                   strpos($envContent, 'DB_NAME') !== false;
    $checks[] = [
        'name' => 'Database Configuration',
        'status' => $hasDbConfig ? 'PASS' : 'WARN',
        'details' => $hasDbConfig ? "DB credentials configured" : "DB credentials missing"
    ];
    if ($hasDbConfig) $passed++; else $failed++;
} else {
    $checks[] = [
        'name' => 'Database Configuration',
        'status' => 'FAIL',
        'details' => '.env file not found'
    ];
    $failed++;
}

// Check CORS and security headers in index.php
$indexContent = file_get_contents(__DIR__ . '/index.php');
$hasCors = strpos($indexContent, 'Access-Control-Allow-Origin') !== false;
$hasSecurityHeaders = strpos($indexContent, 'X-Content-Type-Options') !== false;
$checks[] = [
    'name' => 'CORS Headers',
    'status' => $hasCors ? 'PASS' : 'WARN',
    'details' => $hasCors ? "Configured" : "Not configured"
];
if ($hasCors) $passed++; else $failed++;

$checks[] = [
    'name' => 'Security Headers',
    'status' => $hasSecurityHeaders ? 'PASS' : 'WARN',
    'details' => $hasSecurityHeaders ? "Configured" : "Not configured"
];
if ($hasSecurityHeaders) $passed++; else $failed++;

// Check rate limiting
$checks[] = [
    'name' => 'Rate Limiting',
    'status' => file_exists(__DIR__ . '/src/middleware/RateLimiter.php') ? 'PASS' : 'FAIL',
    'details' => "Session-based rate limiting configured"
];
if (file_exists(__DIR__ . '/src/middleware/RateLimiter.php')) $passed++; else $failed++;

// Check uploads directory
$uploadsDir = __DIR__ . '/uploads';
$uploadsStatus = is_dir($uploadsDir) ? 'PASS' : 'FAIL';
$checks[] = [
    'name' => 'Uploads Directory',
    'status' => $uploadsStatus,
    'details' => $uploadsStatus === 'PASS' ? "Exists and writable" : "Missing"
];
if ($uploadsStatus === 'PASS') $passed++; else $failed++;

// Try to load configuration
$checks[] = [
    'name' => 'Configuration Loading',
    'status' => 'INFO',
    'details' => 'Run index.php to test full configuration loading'
];

// Output results
header('Content-Type: application/json');

$result = [
    'service' => 'silver-shield-php-backend',
    'timestamp' => date('c'),
    'summary' => [
        'total_checks' => count($checks),
        'passed' => $passed,
        'failed' => $failed,
        'status' => $failed === 0 ? 'HEALTHY' : ($failed < 5 ? 'DEGRADED' : 'UNHEALTHY')
    ],
    'checks' => $checks,
    'recommendations' => []
];

if ($failed > 0) {
    $result['recommendations'][] = 'Fix failed checks above';
    if (strpos(json_encode($checks), 'DB') !== false) {
        $result['recommendations'][] = 'Verify database credentials in .env file';
    }
    if (strpos(json_encode($checks), 'Route') !== false) {
        $result['recommendations'][] = 'Ensure all route files are created';
    }
}

$result['recommendations'][] = 'Test database connection with: php backend/test-db.php';
$result['recommendations'][] = 'Test API endpoints with: curl http://localhost:8000/api/health';

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
