<?php
/**
 * Utility Functions
 */
class Utils {
    public static function createSlug($text) {
        $text = strtolower(trim($text));
        $text = preg_replace('/[^a-z0-9]+/', '-', $text);
        $text = trim($text, '-');
        return $text;
    }

    public static function jsonResponse($data = null, $status = 200, $message = null) {
        http_response_code($status);
        header('Content-Type: application/json');
        
        $response = [
            'success' => $status >= 200 && $status < 300
        ];
        
        if ($data !== null) $response['data'] = $data;
        if ($message !== null) $response['message'] = $message;
        
        echo json_encode($response);
        exit;
    }

    public static function rawJsonResponse($data = [], $status = 200) {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }

    public static function errorResponse($message, $status = 400) {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => $message
        ]);
        exit;
    }

    public static function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    }

    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }

    public static function generateToken() {
        return bin2hex(random_bytes(32));
    }

    public static function sanitizeInput($input) {
        if (is_array($input)) {
            return array_map([self::class, 'sanitizeInput'], $input);
        }
        return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
    }

    public static function getJsonInput() {
        $input = file_get_contents('php://input');
        return json_decode($input, true) ?? [];
    }

    public static function getPathSegments() {
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '';

        $appBasePath = rtrim((string)Env::get('APP_BASE_PATH', ''), '/');
        if ($appBasePath !== '' && strpos($path, $appBasePath . '/') === 0) {
            $path = substr($path, strlen($appBasePath));
        } elseif ($appBasePath !== '' && $path === $appBasePath) {
            $path = '/';
        } else {
            $scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
            if (basename($scriptName) === 'index.php') {
                $basePath = dirname($scriptName);
                if ($basePath !== '/' && strpos($path, $basePath) === 0) {
                    $path = substr($path, strlen($basePath));
                }
            }
        }

        $path = trim($path, '/');
        return array_filter(explode('/', $path));
    }

    public static function getRequestMethod() {
        return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    }
}
