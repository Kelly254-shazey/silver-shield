<?php
/**
 * Team and Board Routes
 */
class TeamRoutes {
    public static function handleList() {
        self::handleMembers();
    }

    public static function handleCreate() {
        self::handleMemberCreate();
    }

    public static function handleMembers() {
        self::listFromTable('team_members', false);
    }

    public static function handleMembersAdmin() {
        Auth::requireAdmin();
        self::listFromTable('team_members', true);
    }

    public static function handleBoard() {
        self::listFromTable('board_members', false);
    }

    public static function handleBoardAdmin() {
        Auth::requireAdmin();
        self::listFromTable('board_members', true);
    }

    public static function handleMemberCreate() {
        Auth::requireAdmin();
        $input = Utils::getJsonInput();
        if (empty($input['name']) || empty($input['role']) || empty($input['email']) || empty($input['profileImage'])) {
            Utils::errorResponse('Name, role, email, and profileImage are required.', 400);
        }

        try {
            $result = Database::execute(
                "INSERT INTO team_members (name, role, email, phone, bio, profileImage, department, linkedinUrl, orderIndex, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    $input['name'],
                    $input['role'],
                    $input['email'],
                    $input['phone'] ?? '',
                    $input['bio'] ?? '',
                    $input['profileImage'],
                    $input['department'] ?? 'general',
                    $input['linkedinUrl'] ?? '',
                    (int)($input['orderIndex'] ?? 0),
                    $input['status'] ?? 'active'
                ]
            );
            self::respondById('team_members', $result['insertId'], 201);
        } catch (Exception $e) {
            error_log('Team create error: ' . $e->getMessage());
            Utils::errorResponse('Failed to add team member', 500);
        }
    }

    public static function handleMemberUpdate($id) {
        Auth::requireAdmin();
        $input = Utils::getJsonInput();

        try {
            Database::execute(
                "UPDATE team_members
                 SET name = ?, role = ?, email = ?, phone = ?, bio = ?, profileImage = ?, department = ?, linkedinUrl = ?, orderIndex = ?, status = ?, updatedAt = NOW()
                 WHERE id = ?",
                [
                    $input['name'] ?? '',
                    $input['role'] ?? '',
                    $input['email'] ?? '',
                    $input['phone'] ?? '',
                    $input['bio'] ?? '',
                    $input['profileImage'] ?? '',
                    $input['department'] ?? 'general',
                    $input['linkedinUrl'] ?? '',
                    (int)($input['orderIndex'] ?? 0),
                    $input['status'] ?? 'active',
                    $id
                ]
            );
            self::respondById('team_members', $id);
        } catch (Exception $e) {
            error_log('Team update error: ' . $e->getMessage());
            Utils::errorResponse('Failed to update team member', 500);
        }
    }

    public static function handleMemberDelete($id) {
        self::deleteFromTable('team_members', $id, 'Team member deleted successfully.');
    }

    public static function handleBoardCreate() {
        Auth::requireAdmin();
        $input = Utils::getJsonInput();
        if (empty($input['name']) || empty($input['role']) || empty($input['credentials']) || empty($input['profileImage'])) {
            Utils::errorResponse('Name, role, credentials, and profileImage are required.', 400);
        }

        try {
            $result = Database::execute(
                "INSERT INTO board_members (name, role, credentials, profileImage, linkedinUrl, orderIndex, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?)",
                [
                    $input['name'],
                    $input['role'],
                    $input['credentials'],
                    $input['profileImage'],
                    $input['linkedinUrl'] ?? '',
                    (int)($input['orderIndex'] ?? 0),
                    $input['status'] ?? 'active'
                ]
            );
            self::respondById('board_members', $result['insertId'], 201);
        } catch (Exception $e) {
            error_log('Board create error: ' . $e->getMessage());
            Utils::errorResponse('Failed to add board member', 500);
        }
    }

    public static function handleBoardUpdate($id) {
        Auth::requireAdmin();
        $input = Utils::getJsonInput();

        try {
            Database::execute(
                "UPDATE board_members
                 SET name = ?, role = ?, credentials = ?, profileImage = ?, linkedinUrl = ?, orderIndex = ?, status = ?, updatedAt = NOW()
                 WHERE id = ?",
                [
                    $input['name'] ?? '',
                    $input['role'] ?? '',
                    $input['credentials'] ?? '',
                    $input['profileImage'] ?? '',
                    $input['linkedinUrl'] ?? '',
                    (int)($input['orderIndex'] ?? 0),
                    $input['status'] ?? 'active',
                    $id
                ]
            );
            self::respondById('board_members', $id);
        } catch (Exception $e) {
            error_log('Board update error: ' . $e->getMessage());
            Utils::errorResponse('Failed to update board member', 500);
        }
    }

    public static function handleBoardDelete($id) {
        self::deleteFromTable('board_members', $id, 'Board member deleted successfully.');
    }

    private static function listFromTable($table, $admin) {
        if (Utils::getRequestMethod() !== 'GET') {
            Utils::errorResponse('Method not allowed', 405);
        }

        try {
            $where = $admin ? '' : "WHERE status = 'active'";
            $rows = Database::query("SELECT * FROM $table $where ORDER BY orderIndex ASC, createdAt ASC");
            Utils::jsonResponse($rows);
        } catch (Exception $e) {
            error_log('Team list error: ' . $e->getMessage());
            Utils::errorResponse('Failed to fetch team data', 500);
        }
    }

    private static function respondById($table, $id, $status = 200) {
        $rows = Database::query("SELECT * FROM $table WHERE id = ? LIMIT 1", [$id]);
        if (empty($rows)) {
            Utils::errorResponse('Member not found', 404);
        }
        Utils::jsonResponse($rows[0], $status);
    }

    private static function deleteFromTable($table, $id, $message) {
        if (Utils::getRequestMethod() !== 'DELETE') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAdmin();

        try {
            Database::execute("DELETE FROM $table WHERE id = ?", [$id]);
            Utils::jsonResponse(['message' => $message]);
        } catch (Exception $e) {
            error_log('Team delete error: ' . $e->getMessage());
            Utils::errorResponse('Failed to delete member', 500);
        }
    }
}
