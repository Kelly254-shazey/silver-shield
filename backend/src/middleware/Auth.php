<?php
/**
 * Authentication Middleware - JWT Token Verification
 */
class Auth {
    private static $user = null;

    public static function generateToken($user) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode([
            'id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'] ?? 'user',
            'name' => $user['name'],
            'iat' => time(),
            'exp' => time() + (12 * 3600) // 12 hours
        ]);

        $header = base64_encode($header);
        $payload = base64_encode($payload);
        $signature = hash_hmac('sha256', "$header.$payload", Env::get('JWT_SECRET'), true);
        $signature = base64_encode($signature);

        return "$header.$payload.$signature";
    }

    public static function verifyToken($token) {
        if (empty($token)) {
            return null;
        }

        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        [$header, $payload, $signature] = $parts;

        $expectedSignature = base64_encode(hash_hmac('sha256', "$header.$payload", Env::get('JWT_SECRET'), true));
        if ($signature !== $expectedSignature) {
            return null;
        }

        $decoded = json_decode(base64_decode($payload), true);
        if ($decoded['exp'] < time()) {
            return null;
        }

        return $decoded;
    }

    public static function requireAuth() {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        $token = '';

        if (preg_match('/Bearer\s+(.+)/', $authHeader, $matches)) {
            $token = $matches[1];
        }

        if (!$token) {
            Utils::errorResponse('Authentication required.', 401);
        }

        $payload = self::verifyToken($token);
        if (!$payload) {
            Utils::errorResponse('Invalid or expired token.', 401);
        }

        self::$user = $payload;
        return $payload;
    }

    public static function requireAdmin() {
        $user = self::getUser() ?: self::requireAuth();
        if (!$user || ($user['role'] ?? null) !== 'admin') {
            Utils::errorResponse('Admin access required.', 403);
        }
        return $user;
    }

    public static function getUser() {
        return self::$user;
    }

    public static function setUser($user) {
        self::$user = $user;
    }
}
