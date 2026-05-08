<?php
/**
 * Volunteers Routes
 */
class VolunteerRoutes {
    public static function handleList() {
        if (Utils::getRequestMethod() !== 'GET') {
            Utils::errorResponse('Method not allowed', 405);
        }

        try {
            $rows = Database::query(
                "SELECT id, firstName, lastName, email, phone, skills, status, joinedAt FROM volunteers ORDER BY joinedAt DESC"
            );
            Utils::jsonResponse($rows);
        } catch (Exception $e) {
            error_log('Volunteers list error: ' . $e->getMessage());
            Utils::errorResponse('Failed to fetch volunteers', 500);
        }
    }

    public static function handleRegister() {
        if (Utils::getRequestMethod() !== 'POST') {
            Utils::errorResponse('Method not allowed', 405);
        }

        $input = Utils::getJsonInput();

        if (empty($input['email']) || empty($input['firstName'])) {
            Utils::errorResponse('Email and first name are required', 400);
        }

        try {
            $sql = "
                INSERT INTO volunteers (firstName, lastName, email, phone, skills, interests, availability, status, joinedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ";
            Database::query($sql, [
                $input['firstName'] ?? '',
                $input['lastName'] ?? '',
                $input['email'] ?? '',
                $input['phone'] ?? '',
                $input['skills'] ?? '',
                $input['interests'] ?? '',
                $input['availability'] ?? '',
                'active'
            ]);

            EmailService::sendWelcome($input['email'], $input['firstName']);
            Utils::jsonResponse(['message' => 'Registration successful'], 201);
        } catch (Exception $e) {
            error_log('Volunteers register error: ' . $e->getMessage());
            Utils::errorResponse('Failed to register volunteer', 500);
        }
    }
}
