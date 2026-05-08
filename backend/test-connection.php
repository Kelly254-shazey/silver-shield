<?php
/**
 * Connection Test - Verifies Frontend/Backend/Database Integration
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

$results = [
    'timestamp' => date('Y-m-d H:i:s'),
    'tests' => []
];

// Test 1: Configuration Load
try {
    require_once __DIR__ . '/src/config/Env.php';
    Env::load();
    $results['tests']['configuration'] = [
        'status' => 'PASS',
        'message' => 'Environment configuration loaded successfully'
    ];
} catch (Exception $e) {
    $results['tests']['configuration'] = [
        'status' => 'FAIL',
        'message' => $e->getMessage()
    ];
}

// Test 2: Database Connection
try {
    require_once __DIR__ . '/src/config/Database.php';
    Database::query("SELECT 1");
    $results['tests']['database'] = [
        'status' => 'PASS',
        'message' => 'Database connection successful',
        'database' => Env::get('DB_NAME'),
        'host' => Env::get('DB_HOST')
    ];
} catch (Exception $e) {
    $results['tests']['database'] = [
        'status' => 'FAIL',
        'message' => $e->getMessage()
    ];
}

// Test 3: JWT Configuration
try {
    $secret = Env::get('JWT_SECRET');
    if (strlen($secret) > 20) {
        $results['tests']['jwt'] = [
            'status' => 'PASS',
            'message' => 'JWT secret configured',
            'expires_in' => Env::get('JWT_EXPIRES_IN', '12h')
        ];
    } else {
        throw new Exception('JWT secret too short');
    }
} catch (Exception $e) {
    $results['tests']['jwt'] = [
        'status' => 'FAIL',
        'message' => $e->getMessage()
    ];
}

// Test 4: CORS Configuration
try {
    $allowed = Env::get('ALLOWED_ORIGINS');
    $origins = array_map('trim', explode(',', $allowed));
    $results['tests']['cors'] = [
        'status' => 'PASS',
        'message' => 'CORS origins configured',
        'allowed_origins' => $origins,
        'frontend_url' => Env::get('FRONTEND_URL')
    ];
} catch (Exception $e) {
    $results['tests']['cors'] = [
        'status' => 'FAIL',
        'message' => $e->getMessage()
    ];
}

// Test 5: Database Tables
try {
    require_once __DIR__ . '/src/config/Database.php';
       $tables = Database::query("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?", [Env::get('DB_NAME')]);

    $expectedTables = ['users', 'programs', 'stories', 'donations'];
    $found = [];
    
    if ($tables) {
        foreach ($tables as $table) {
            $found[] = $table['TABLE_NAME'];
        }
    }
    
    $missingTables = array_diff($expectedTables, $found);
    
    if (empty($missingTables)) {
        $results['tests']['database_tables'] = [
            'status' => 'PASS',
            'message' => 'All expected tables exist',
            'table_count' => count($found),
            'tables' => $found
        ];
    } else {
        $results['tests']['database_tables'] = [
            'status' => 'WARNING',
            'message' => 'Some tables missing',
            'missing' => $missingTables,
            'found' => $found
        ];
    }
} catch (Exception $e) {
    $results['tests']['database_tables'] = [
        'status' => 'FAIL',
        'message' => $e->getMessage()
    ];
}

// Test 6: Routes Registration
try {
    $routerFile = __DIR__ . '/src/Router.php';
    if (!file_exists($routerFile)) {
        throw new Exception("Router file missing at: $routerFile");
    }
    require_once $routerFile;
    
    $router = new Router();
    
    // Check if routes are registered (via reflection)
    $reflection = new ReflectionClass('Router');
    if (!$reflection->hasProperty('routes')) {
        throw new Exception('Router class does not have a "routes" property.');
    }

    $property = $reflection->getProperty('routes');
    $property->setAccessible(true);
    $routes = $property->getValue($router);
    
    if (count($routes) > 0) {
        $results['tests']['routes'] = [
            'status' => 'PASS',
            'message' => 'Routes registered successfully',
            'route_count' => count($routes),
            'sample_routes' => array_slice(array_keys($routes), 0, 5)
        ];
        
        // Check for specific critical routes
        $requiredRoutes = ['POST /api/auth/login', 'GET /api/programs'];
        $missing = array_diff($requiredRoutes, array_keys($routes));
        if (!empty($missing)) {
            $results['tests']['routes']['status'] = 'WARNING';
            $results['tests']['routes']['missing_critical'] = $missing;
        }
    } else {
        throw new Exception('No routes registered. Check if routes are defined in Router.php or an external config.');
    }
} catch (Exception $e) {
    $results['tests']['routes'] = [
        'status' => 'FAIL',
        'message' => $e->getMessage()
    ];
}

// Overall Status
$failCount = 0;
foreach ($results['tests'] as $test) {
    if ($test['status'] === 'FAIL') {
        $failCount++;
    }
}

$results['overall_status'] = $failCount === 0 ? 'READY' : 'NEEDS_ATTENTION';
$results['summary'] = [
    'total_tests' => count($results['tests']),
    'passed' => count($results['tests']) - $failCount,
    'failed' => $failCount
];

echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
?>
