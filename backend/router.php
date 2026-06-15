<?php
/**
 * PHP Built-In Server Router
 *
 * Use with: php -S localhost:8000 router.php
 * It serves static files when they exist and forwards other requests to index.php.
 */

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$file = __DIR__ . $uri;

if ($uri !== '/' && file_exists($file) && is_file($file)) {
    return false;
}

require_once __DIR__ . '/index.php';
