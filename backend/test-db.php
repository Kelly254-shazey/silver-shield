<?php
/**
 * Database Connection Test
 * Use this to diagnose database connectivity issues
 */

echo "<h2>Silver Shield - Database Connection Test</h2>\n";
echo "<hr>\n";

// Load environment
require_once __DIR__ . '/src/config/Env.php';
Env::load();

echo "<h3>Configuration Status</h3>\n";
$dbHost = Env::get('DB_HOST', 'localhost');
$dbUser = Env::get('DB_USER', 'root');
$dbName = Env::get('DB_NAME', 'silver_shield');
$dbPort = Env::get('DB_PORT', 3306);

echo "<pre>";
echo "Database Host: $dbHost\n";
echo "Database Name: $dbName\n";
echo "Database Port: $dbPort\n";
echo "Database User: $dbUser\n";
echo "</pre>";

echo "<h3>Connection Test</h3>\n";

if (!extension_loaded('mysqli') || !extension_loaded('curl') || !extension_loaded('openssl')) {
    $missing = [];
    if (!extension_loaded('mysqli')) $missing[] = 'mysqli';
    if (!extension_loaded('curl')) $missing[] = 'curl';
    if (!extension_loaded('openssl')) $missing[] = 'openssl';

    echo "<p style='color: red;'><strong>✗ Error: Required PHP extensions are missing: " . implode(', ', $missing) . "</strong></p>";
    echo "<p>Your PHP installation is working, but some required modules are disabled.</p>";
    echo "<h4>To fix this:</h4>";
    echo "<ol>";
    echo "<li>Open your PHP folder: <code>C:\Users\w\Downloads\php-8.5.6-Win32-vs17-x64\</code></li>";
    echo "<li>Ensure you have a <code>php.ini</code> file (rename <code>php.ini-development</code> to <code>php.ini</code> if needed).</li>";
    echo "<li>Find <code>;extension_dir = \"ext\"</code> and remove the semicolon.</li>";
    echo "<li>Enable extensions by removing the semicolon (<code>;</code>) from: <code>extension=mysqli</code>, <code>extension=curl</code>, and <code>extension=openssl</code>.</li>";
    echo "<li>Restart the server.</li>";
    echo "</ol>";
    die();
}

try {
    $connection = new mysqli($dbHost, $dbUser, Env::get('DB_PASSWORD'), $dbName, $dbPort);
    
    if ($connection->connect_error) {
        echo "<p style='color: red;'><strong>✗ Connection Failed:</strong> " . htmlspecialchars($connection->connect_error) . "</p>\n";
        die();
    }
    
    echo "<p style='color: green;'><strong>✓ Connection Successful!</strong></p>\n";
    
    // Test charset
    $connection->set_charset('utf8mb4');
    echo "<p style='color: green;'><strong>✓ Charset set to utf8mb4</strong></p>\n";
    
    // Check tables
    echo "<h3>Database Tables</h3>\n";
    $result = $connection->query("SHOW TABLES");
    
    if (!$result) {
        echo "<p style='color: red;'><strong>✗ Failed to query tables:</strong> " . htmlspecialchars($connection->error) . "</p>\n";
    } else {
        $tables = [];
        while ($row = $result->fetch_row()) {
            $tables[] = $row[0];
        }
        
        if (empty($tables)) {
            echo "<p style='color: orange;'><strong>⚠ No tables found!</strong> Run schema initialization.</p>\n";
        } else {
            echo "<p style='color: green;'><strong>✓ Found " . count($tables) . " tables:</strong></p>\n";
            echo "<ul>\n";
            foreach ($tables as $table) {
                echo "<li>$table</li>\n";
            }
            echo "</ul>\n";
            
            // Test simple query
            echo "<h3>Query Test</h3>\n";
            $testResult = $connection->query("SELECT 1 as test");
            if ($testResult) {
                $testRow = $testResult->fetch_assoc();
                echo "<p style='color: green;'><strong>✓ Test query successful:</strong> Result = " . $testRow['test'] . "</p>\n";
            } else {
                echo "<p style='color: red;'><strong>✗ Test query failed:</strong> " . htmlspecialchars($connection->error) . "</p>\n";
            }
        }
    }
    
    // Check stored procedures or functions
    echo "<h3>Database Info</h3>\n";
    $infoResult = $connection->query("SELECT VERSION() as version");
    if ($infoResult) {
        $info = $infoResult->fetch_assoc();
        echo "<p>MySQL Version: " . htmlspecialchars($info['version']) . "</p>\n";
    }
    
    $connection->close();
    echo "<p style='color: green;'><strong>✓ Connection closed successfully</strong></p>\n";
    
} catch (Exception $e) {
    echo "<p style='color: red;'><strong>✗ Exception:</strong> " . htmlspecialchars($e->getMessage()) . "</p>\n";
}

echo "<h3>Recommendations</h3>\n";
echo "<ul>\n";
echo "<li>If connection fails, verify DB_HOST, DB_USER, and DB_PASSWORD in .env file</li>\n";
echo "<li>If no tables found, run the database schema initialization</li>\n";
echo "<li>Ensure MySQL/MariaDB server is running</li>\n";
echo "<li>Check firewall rules for port $dbPort</li>\n";
echo "</ul>\n";
