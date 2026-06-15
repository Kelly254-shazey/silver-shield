<?php
// Debug script to test STK push
require_once __DIR__ . '/src/config/Env.php';
require_once __DIR__ . '/src/config/Database.php';
require_once __DIR__ . '/src/services/PayHeroService.php';

Env::load();

echo "Testing STK Push\n";
echo "================\n\n";

// Test phone formatting
$phone = "0796104666";
$formatted = preg_replace('/[^0-9]/', '', $phone);
if (strlen($formatted) === 10 && $formatted[0] === '0') {
    $formatted = '254' . substr($formatted, 1);
}

echo "Phone: $phone\n";
echo "Formatted: $formatted\n";
echo "Amount: 500 KES\n";
echo "Provider: " . Env::get('STK_PROVIDER', 'PAYHERO') . "\n";
echo "Environment: " . Env::get('PAYHERO_ENVIRONMENT', 'sandbox') . "\n\n";

// Try calling PayHeroService
try {
    echo "Calling PayHeroService::initiateStkPush...\n";
    $result = PayHeroService::initiateStkPush(
        500,
        $formatted,
        'TEST-001',
        'silvershield organization'
    );
    
    echo "Success!\n";
    echo "Response: " . json_encode($result, JSON_PRETTY_PRINT) . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack: " . $e->getTraceAsString() . "\n";
}
?>
