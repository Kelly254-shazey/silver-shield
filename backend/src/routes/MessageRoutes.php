<?php
/**
 * Messages Routes
 */
class MessageRoutes {
    private static function columns($table) {
        $columns = Database::query("SHOW COLUMNS FROM $table");
        return array_map(function ($column) { return $column['Field']; }, $columns);
    }

    private static function ensureTables() {
        Database::query(
            "CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                senderName VARCHAR(255) NULL,
                senderEmail VARCHAR(255) NULL,
                phone VARCHAR(32) NULL,
                subject VARCHAR(255) NULL,
                message LONGTEXT NULL,
                type VARCHAR(64) NOT NULL DEFAULT 'inquiry',
                status VARCHAR(32) NOT NULL DEFAULT 'unread',
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_messages_status (status),
                INDEX idx_messages_type (type)
            )"
        );

        $columns = self::columns('messages');
        if (!in_array('phone', $columns, true)) {
            Database::query("ALTER TABLE messages ADD COLUMN phone VARCHAR(32) NULL AFTER senderEmail");
        }

        Database::query(
            "CREATE TABLE IF NOT EXISTS message_replies (
                id INT AUTO_INCREMENT PRIMARY KEY,
                messageId INT NOT NULL,
                replyText LONGTEXT NOT NULL,
                adminName VARCHAR(255) NULL,
                sentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_message_replies_message (messageId)
            )"
        );
    }

    public static function handleList() {
        if (Utils::getRequestMethod() !== 'GET') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAuth();

        try {
            self::ensureTables();
            $where = '';
            $params = [];
            if (!empty($_GET['status'])) {
                $where = 'WHERE LOWER(status) = LOWER(?)';
                $params[] = $_GET['status'];
            }
            $rows = Database::query(
                "SELECT id, senderName as fullName, senderEmail as email, phone, subject, message, type, UPPER(status) as status, createdAt FROM messages $where ORDER BY createdAt DESC LIMIT 100",
                $params
            );
            Utils::jsonResponse($rows);
        } catch (Exception $e) {
            error_log('Messages list error: ' . $e->getMessage());
            Utils::errorResponse('Failed to fetch messages', 500);
        }
    }

    public static function handleCreate() {
        if (Utils::getRequestMethod() !== 'POST') {
            Utils::errorResponse('Method not allowed', 405);
        }

        $input = Utils::getJsonInput();

        try {
            self::ensureTables();
            $sql = "
                INSERT INTO messages (senderName, senderEmail, phone, subject, message, type, status, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            ";
            Database::query($sql, [
                $input['fullName'] ?? $input['name'] ?? $input['senderName'] ?? '',
                $input['email'] ?? '',
                $input['phone'] ?? '',
                $input['subject'] ?? '',
                $input['message'] ?? '',
                $input['inquiryType'] ?? $input['type'] ?? 'inquiry',
                'unread'
            ]);

            Utils::jsonResponse(['message' => 'Message sent successfully'], 201);
        } catch (Exception $e) {
            error_log('Messages create error: ' . $e->getMessage());
            Utils::errorResponse('Failed to send message', 500);
        }
    }

    public static function handleGet($id) {
        if (Utils::getRequestMethod() !== 'GET') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAuth();

        try {
            self::ensureTables();
            $rows = Database::query("SELECT id, senderName as fullName, senderEmail as email, phone, subject, message, type, UPPER(status) as status, createdAt FROM messages WHERE id = ? LIMIT 1", [$id]);
            if (empty($rows)) {
                Utils::errorResponse('Message not found', 404);
            }
            
            $selected = $rows[0];
            $selected['replies'] = Database::query("SELECT * FROM message_replies WHERE messageId = ? ORDER BY sentAt ASC", [$id]) ?: [];

            Database::query("UPDATE messages SET status = 'read' WHERE id = ? AND status = 'unread'", [$id]);
            Utils::jsonResponse($selected);
        } catch (Exception $e) {
            error_log('Messages get error: ' . $e->getMessage());
            Utils::errorResponse('Failed to fetch message', 500);
        }
    }

    public static function handleUpdate($id) {
        if (Utils::getRequestMethod() !== 'PUT') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAuth();
        $input = Utils::getJsonInput();

        try {
            self::ensureTables();
            Database::query("UPDATE messages SET status = LOWER(?) WHERE id = ?", [$input['status'] ?? 'read', $id]);
            Utils::jsonResponse(['message' => 'Message updated successfully']);
        } catch (Exception $e) {
            error_log('Messages update error: ' . $e->getMessage());
            Utils::errorResponse('Failed to update message', 500);
        }
    }

    public static function handleReply($id) {
        if (Utils::getRequestMethod() !== 'POST') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAuth();
        self::ensureTables();
        $input = Utils::getJsonInput();
        $user = Auth::getUser();
        $replyText = trim($input['replyText'] ?? $input['message'] ?? '');
        if ($replyText !== '') {
            Database::query(
                "INSERT INTO message_replies (messageId, replyText, adminName, sentAt) VALUES (?, ?, ?, NOW())",
                [$id, $replyText, $user['name'] ?? 'System Administrator']
            );
        }
        Database::query("UPDATE messages SET status = 'resolved' WHERE id = ?", [$id]);
        Utils::jsonResponse(['message' => 'Reply recorded successfully']);
    }

    public static function handleArchive($id) {
        if (Utils::getRequestMethod() !== 'POST') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAuth();
        self::ensureTables();
        Database::query("UPDATE messages SET status = 'archived' WHERE id = ?", [$id]);
        Utils::jsonResponse(['message' => 'Message archived successfully']);
    }

    public static function handleDelete($id) {
        if (Utils::getRequestMethod() !== 'DELETE') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAuth();
        self::ensureTables();
        Database::query("DELETE FROM messages WHERE id = ?", [$id]);
        Utils::jsonResponse(['message' => 'Message deleted successfully']);
    }
}
