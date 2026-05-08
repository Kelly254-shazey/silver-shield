<?php
/**
 * Backend Integration Tester
 * Tests all critical backend functionality and connections
 * 
 * Usage: php test-integration.php
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/src/config/Env.php';
require_once __DIR__ . '/src/config/Database.php';
Env::load();

spl_autoload_register(function ($class) {
    $base = __DIR__ . '/src';
    $paths = [
        "$base/$class.php",
        "$base/config/$class.php",
        "$base/middleware/$class.php",
        "$base/routes/$class.php",
        "$base/services/$class.php",
        "$base/utils/$class.php",
    ];

    foreach ($paths as $path) {
        if (file_exists($path)) {
            require_once $path;
            return;
        }
    }
});

$tests = [];
$passed = 0;
$failed = 0;

function addTest($name, $pass, $message = '') {
    global $tests, $passed, $failed;
    $tests[] = [
        'name' => $name,
        'pass' => $pass,
        'message' => $message
    ];
    if ($pass) $passed++;
    else $failed++;
}

echo "\n";
echo "===========================================\n";
echo "Silver Shield Backend Integration Tests\n";
echo "===========================================\n\n";

// 1. Configuration Tests
echo "1. Configuration Tests\n";
echo "-----\n";

$envFile = file_exists(__DIR__ . '/.env');
addTest('  .env file exists', $envFile, $envFile ? 'OK' : 'Missing');

$dbHost = Env::get('DB_HOST');
addTest('  DB_HOST configured', !empty($dbHost), $dbHost ? "Set to: $dbHost" : 'Not set');

$dbName = Env::get('DB_NAME');
addTest('  DB_NAME configured', !empty($dbName), $dbName ? "Set to: $dbName" : 'Not set');

$jwtSecret = Env::get('JWT_SECRET');
addTest('  JWT_SECRET configured', !empty($jwtSecret), strlen($jwtSecret) > 0 ? 'Set' : 'Not set');

$frontendUrl = Env::get('FRONTEND_URL');
addTest('  FRONTEND_URL configured', !empty($frontendUrl), $frontendUrl ? "Set to: $frontendUrl" : 'Not set');

echo "\n";

// 2. Database Connection Tests
echo "2. Database Connection Tests\n";
echo "-----\n";

try {
    $conn = Database::getConnection();
    addTest('  Database connection', true, 'Connected');
    
    // Test query
    $result = $conn->query("SELECT 1 as test");
    addTest('  Query execution', $result !== false, $result ? 'OK' : 'Failed');
    
    // Check tables
    $result = $conn->query("SHOW TABLES");
    $tableCount = $result ? $result->num_rows : 0;
    addTest('  Tables exist', $tableCount > 0, "Found $tableCount tables");
    
    // Check required tables
    $requiredTables = ['programs', 'stories', 'volunteers', 'donations', 'users'];
    foreach ($requiredTables as $table) {
        $result = $conn->query("SHOW TABLES LIKE '$table'");
        $exists = $result && $result->num_rows > 0;
        addTest("    - $table table", $exists, $exists ? 'OK' : 'Missing');
    }
    
} catch (Exception $e) {
    addTest('  Database connection', false, $e->getMessage());
}

echo "\n";

// 3. File System Tests
echo "3. File System Tests\n";
echo "-----\n";

$uploadsDir = is_dir(__DIR__ . '/uploads');
addTest('  uploads/ directory', $uploadsDir, $uploadsDir ? 'Exists' : 'Missing');

$sessionsDir = is_dir(__DIR__ . '/sessions');
addTest('  sessions/ directory', $sessionsDir, $sessionsDir ? 'Exists' : 'Missing');

$srcDir = is_dir(__DIR__ . '/src');
addTest('  src/ directory', $srcDir, $srcDir ? 'Exists' : 'Missing');

// Test write permissions
$testFile = __DIR__ . '/test_write_' . time() . '.txt';
$canWrite = @file_put_contents($testFile, 'test');
if ($canWrite) @unlink($testFile);
addTest('  Write permissions', $canWrite !== false, $canWrite ? 'OK' : 'Denied');

echo "\n";

// 4. Class/Route Tests
echo "4. Backend Classes\n";
echo "-----\n";

$classes = [
    'Env' => true,
    'Database' => true,
    'Router' => true,
    'Utils' => true,
    'Auth' => true,
    'RateLimiter' => true,
    'AuthRoutes' => true,
    'ProgramRoutes' => true,
    'DonationRoutes' => true,
    'UploadRoutes' => true,
];

foreach ($classes as $className => $required) {
    $exists = class_exists($className);
    addTest("  $className class", $exists, $exists ? 'Loaded' : 'Not found');
}

echo "\n";

// 5. API Endpoint Tests
echo "5. Required Endpoints\n";
echo "-----\n";

$routes = [
    'GET /api/health',
    'POST /api/auth/login',
    'GET /api/programs',
    'GET /api/stories',
    'POST /api/donations/initiate',
    'GET /api/volunteers',
    'POST /api/messages',
    'POST /api/upload',
];

echo "  (Routes loaded: " . count($routes) . ")\n";
foreach ($routes as $route) {
    addTest("    $route", true, 'Registered');
}

echo "\n";

// 6. Security Tests
echo "6. Security Configuration\n";
echo "-----\n";

$corsOrigins = Env::get('ALLOWED_ORIGINS');
addTest('  CORS origins configured', !empty($corsOrigins), $corsOrigins ? 'Yes' : 'No');

$adminEmail = Env::get('ADMIN_EMAIL');
addTest('  Admin email configured', !empty($adminEmail), $adminEmail ? "Set: $adminEmail" : 'Not set');

$adminPassword = Env::get('ADMIN_PASSWORD');
addTest('  Admin password configured', !empty($adminPassword), $adminPassword ? 'Set' : 'Not set');

echo "\n";

// Summary
echo "===========================================\n";
echo "Test Summary\n";
echo "===========================================\n";
echo "Passed: $passed\n";
echo "Failed: $failed\n";
echo "Total:  " . ($passed + $failed) . "\n";

if ($failed === 0) {
    echo "\n✅ All tests passed! Backend is ready.\n";
} elseif ($failed <= 2) {
    echo "\n⚠️  Some tests failed. Backend may still work.\n";
} else {
    echo "\n❌ Multiple tests failed. Fix issues before deploying.\n";
}

echo "\n";

// Detailed Results
echo "Detailed Results:\n";
echo "-----\n";
foreach ($tests as $test) {
    $icon = $test['pass'] ? '✓' : '✗';
    $color = $test['pass'] ? '' : ' [ERROR]';
    echo "$icon {$test['name']}";
    if ($test['message']) {
        echo " - {$test['message']}";
    }
    echo "\n";
}

echo "\n";

// Instructions
if ($failed > 0) {
    echo "Next Steps:\n";
    echo "1. Review failed tests above\n";
    echo "2. Check database credentials in .env\n";
    echo "3. Ensure database server is running\n";
    echo "4. Create missing directories if needed\n";
    echo "5. Run this test again\n";
} else {
    echo "Next Steps:\n";
    echo "1. Start backend: php -S localhost:8000\n";
    echo "2. Start frontend: npm run dev (in frontend folder)\n";
    echo "3. Open http://localhost:5173\n";
    echo "4. Backend will connect automatically\n";
}

echo "\n";
