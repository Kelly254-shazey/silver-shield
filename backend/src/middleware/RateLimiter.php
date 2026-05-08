<?php
/**
 * Rate Limiting Middleware
 */
class RateLimiter {
    private static $limits = [];
    private static $sessionPath = __DIR__ . '/../../sessions';

    public static function init() {
        if (!file_exists(self::$sessionPath)) {
            mkdir(self::$sessionPath, 0755, true);
        }
    }

    public static function checkGlobalLimit($maxRequests = 1000, $window = 3600) {
        self::init();
        $ip = $_SERVER['REMOTE_ADDR'];
        $key = "global_$ip";
        return self::checkLimit($key, $maxRequests, $window);
    }

    public static function checkAuthLimit($maxRequests = 5, $window = 900) {
        self::init();
        $ip = $_SERVER['REMOTE_ADDR'];
        $key = "auth_$ip";
        return self::checkLimit($key, $maxRequests, $window);
    }

    public static function checkAILimit($maxRequests = 10, $window = 3600) {
        self::init();
        $ip = $_SERVER['REMOTE_ADDR'];
        $key = "ai_$ip";
        return self::checkLimit($key, $maxRequests, $window);
    }

    private static function checkLimit($key, $maxRequests, $window) {
        $file = self::$sessionPath . '/' . hash('sha256', $key) . '.json';
        $now = time();
        
        $data = [];
        if (file_exists($file)) {
            $content = file_get_contents($file);
            $data = json_decode($content, true) ?? [];
        }

        // Clean old entries
        $data['requests'] = array_filter($data['requests'] ?? [], function($time) use ($now, $window) {
            return $time > ($now - $window);
        });

        if (count($data['requests']) >= $maxRequests) {
            return false;
        }

        $data['requests'][] = $now;
        file_put_contents($file, json_encode($data));
        return true;
    }
}

RateLimiter::init();
