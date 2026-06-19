<?php
/**
 * Volunteers Routes
 */
class VolunteerRoutes {
    private static function columns() {
        $columns = Database::query("SHOW COLUMNS FROM volunteers");
        return array_map(function ($column) { return $column['Field']; }, $columns);
    }

    private static function ensureTable() {
        Database::query(
            "CREATE TABLE IF NOT EXISTS volunteers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                firstName VARCHAR(120) NOT NULL,
                lastName VARCHAR(120) NULL,
                email VARCHAR(255) NULL UNIQUE,
                phone VARCHAR(32) NULL,
                location VARCHAR(255) NULL,
                skills TEXT NULL,
                interests TEXT NULL,
                availability VARCHAR(120) NULL,
                message TEXT NULL,
                status VARCHAR(32) NOT NULL DEFAULT 'active',
                joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_volunteers_status (status)
            )"
        );

        $columns = self::columns();
        $missing = [
            'location' => "ALTER TABLE volunteers ADD COLUMN location VARCHAR(255) NULL AFTER phone",
            'message' => "ALTER TABLE volunteers ADD COLUMN message TEXT NULL AFTER availability",
        ];
        foreach ($missing as $column => $sql) {
            if (!in_array($column, $columns, true)) {
                Database::query($sql);
            }
        }
    }

    public static function handleList() {
        if (Utils::getRequestMethod() !== 'GET') {
            Utils::errorResponse('Method not allowed', 405);
        }

        try {
            Auth::requireAuth();
            self::ensureTable();
            $rows = Database::query(
                "SELECT id, TRIM(CONCAT(firstName, ' ', COALESCE(lastName, ''))) as fullName, firstName, lastName, email, phone, location, skills, interests, availability, message, status, joinedAt FROM volunteers ORDER BY joinedAt DESC"
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

        if (empty($input['email']) || (empty($input['fullName']) && empty($input['firstName']))) {
            Utils::errorResponse('Email and name are required', 400);
        }

        $fullName = $input['fullName'] ?? '';
        $firstName = $input['firstName'] ?? '';
        $lastName = $input['lastName'] ?? '';

        if ($fullName && empty($firstName)) {
            $parts = explode(' ', trim($fullName), 2);
            $firstName = $parts[0] ?? '';
            $lastName = $parts[1] ?? '';
        }

        try {
            self::ensureTable();
            $sql = "
                INSERT INTO volunteers (firstName, lastName, email, phone, location, skills, interests, availability, message, status, joinedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ";
            Database::query($sql, [
                $firstName,
                $lastName,
                $input['email'] ?? '',
                $input['phone'] ?? '',
                $input['location'] ?? '',
                is_array($input['skills'] ?? null) ? implode(', ', $input['skills']) : ($input['skills'] ?? ''),
                is_array($input['interests'] ?? null) ? implode(', ', $input['interests']) : ($input['interests'] ?? ''),
                $input['availability'] ?? '',
                $input['message'] ?? '',
                'new'
            ]);

            EmailService::sendWelcome($input['email'], $firstName);
            Utils::jsonResponse(['message' => 'Registration successful'], 201);
        } catch (Exception $e) {
            error_log('Volunteers register error: ' . $e->getMessage());
            Utils::errorResponse('Failed to register volunteer', 500);
        }
    }

    public static function handleUpdate($id) {
        if (Utils::getRequestMethod() !== 'PUT') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAdmin();
        $input = Utils::getJsonInput();
        [$firstName, $lastName] = self::splitName($input);

        try {
            self::ensureTable();
            Database::query(
                "UPDATE volunteers
                 SET firstName = ?, lastName = ?, email = ?, phone = ?, location = ?, skills = ?, interests = ?, availability = ?, message = ?, status = ?
                 WHERE id = ?",
                [
                    $firstName,
                    $lastName,
                    $input['email'] ?? '',
                    $input['phone'] ?? '',
                    $input['location'] ?? '',
                    is_array($input['skills'] ?? null) ? implode(', ', $input['skills']) : ($input['skills'] ?? ''),
                    is_array($input['interests'] ?? null) ? implode(', ', $input['interests']) : ($input['interests'] ?? ''),
                    $input['availability'] ?? '',
                    $input['message'] ?? '',
                    $input['status'] ?? 'new',
                    $id
                ]
            );

            $rows = Database::query(
                "SELECT id, TRIM(CONCAT(firstName, ' ', COALESCE(lastName, ''))) as fullName, firstName, lastName, email, phone, location, skills, interests, availability, message, status, joinedAt FROM volunteers WHERE id = ? LIMIT 1",
                [$id]
            );
            if (empty($rows)) {
                Utils::errorResponse('Volunteer not found', 404);
            }
            Utils::jsonResponse($rows[0]);
        } catch (Exception $e) {
            error_log('Volunteers update error: ' . $e->getMessage());
            Utils::errorResponse('Failed to update volunteer', 500);
        }
    }

    public static function handleDelete($id) {
        if (Utils::getRequestMethod() !== 'DELETE') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAdmin();

        try {
            self::ensureTable();
            Database::query("DELETE FROM volunteers WHERE id = ?", [$id]);
            Utils::jsonResponse(['message' => 'Volunteer deleted successfully']);
        } catch (Exception $e) {
            error_log('Volunteers delete error: ' . $e->getMessage());
            Utils::errorResponse('Failed to delete volunteer', 500);
        }
    }

    private static function splitName($input) {
        $fullName = trim($input['fullName'] ?? '');
        $firstName = trim($input['firstName'] ?? '');
        $lastName = trim($input['lastName'] ?? '');

        if ($fullName !== '' && $firstName === '') {
            $parts = explode(' ', $fullName, 2);
            $firstName = $parts[0] ?? '';
            $lastName = $parts[1] ?? '';
        }

        return [$firstName, $lastName];
    }
}
