<?php
/**
 * Authentication Routes
 */
class AuthRoutes {
    public static function handleLogin() {
        if (Utils::getRequestMethod() !== 'POST') {
            Utils::errorResponse('Method not allowed', 405);
        }

        if (!RateLimiter::checkAuthLimit()) {
            Utils::errorResponse('Too many login attempts. Please try again later.', 429);
        }

        $input = Utils::getJsonInput();
        $email = $input['email'] ?? '';
        $password = $input['password'] ?? '';

        if (empty($email) || empty($password)) {
            Utils::errorResponse('Email and password are required.', 400);
        }

        try {
            $rows = Database::query(
                "SELECT id, name, email, passwordHash, role FROM users WHERE email = ? LIMIT 1",
                [strtolower(trim($email))]
            );

            if (empty($rows)) {
                self::tryEnvAdminLogin($email, $password);
            }

            $user = $rows[0];
            if (!Utils::verifyPassword($password, $user['passwordHash'])) {
                self::tryEnvAdminLogin($email, $password);
                Utils::errorResponse('Invalid credentials.', 401);
            }

            $token = Auth::generateToken($user);
            Utils::rawJsonResponse([
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'role' => $user['role']
                ]
            ]);
        } catch (Exception $e) {
            error_log('Auth login error: ' . $e->getMessage());
            Utils::errorResponse('Login failed', 500);
        }
    }

    private static function tryEnvAdminLogin($email, $password) {
        $adminEmail = strtolower(trim(Env::get('ADMIN_EMAIL', 'admin@silvershield.org')));
        $adminPassword = Env::get('ADMIN_PASSWORD', '');

        if (strtolower(trim($email)) !== $adminEmail || $password !== $adminPassword) {
            Utils::errorResponse('Invalid credentials.', 401);
        }

        $user = [
            'id' => 1,
            'name' => 'Admin',
            'email' => $adminEmail,
            'role' => 'admin'
        ];

        Utils::rawJsonResponse([
            'token' => Auth::generateToken($user),
            'user' => $user
        ]);
    }

    public static function handleMe() {
        if (Utils::getRequestMethod() !== 'GET') {
            Utils::errorResponse('Method not allowed', 405);
        }

        $user = Auth::requireAuth();
        
        try {
            $rows = Database::query(
                "SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1",
                [$user['id']]
            );

            if (empty($rows)) {
                Utils::errorResponse('User not found.', 404);
            }

            Utils::jsonResponse(['user' => $rows[0]]);
        } catch (Exception $e) {
            error_log('Auth me error: ' . $e->getMessage());
            Utils::errorResponse('Failed to fetch user', 500);
        }
    }
}
