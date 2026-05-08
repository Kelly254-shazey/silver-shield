<?php
/**
 * Environment Configuration - Loads from .env file
 */
class Env {
    private static $config = [];
    private static $loaded = false;

    public static function load() {
        if (self::$loaded) return;
        self::$loaded = true;

        $envPath = __DIR__ . '/../../.env';
        if (file_exists($envPath)) {
            $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $line = trim($line);
                if ($line === '' || $line[0] === '#') {
                    continue;
                }

                if (strpos($line, '=') !== false) {
                    [$key, $value] = explode('=', $line, 2);
                    $key = trim($key);
                    $value = trim($value);
                    $value = trim($value, "\"'");
                    self::$config[$key] = $value;
                    $_ENV[$key] = $value;
                }
            }
        }
    }

    public static function get($key, $default = null) {
        self::load();
        $value = self::$config[$key] ?? ($_ENV[$key] ?? $default);
        if (is_string($value)) {
            $value = trim($value);
        }
        return $value;
    }

    public static function isProduction() {
        return strtolower((string)self::get('NODE_ENV', 'production')) === 'production';
    }
}

Env::load();
