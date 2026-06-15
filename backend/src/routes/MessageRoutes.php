<?php
/**
 * Messages Routes
 */
class MessageRoutes {
    public static function handleList() {
        if (Utils::getRequestMethod() !== 'GET') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAuth();

        try {
            $where = '';
            $params = [];
            if (!empty($_GET['status'])) {
                $where = 'WHERE status = ?';
                $params[] = $_GET['status'];
            }
            $rows = Database::query(
                "SELECT * FROM messages $where ORDER BY createdAt DESC LIMIT 100",
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
            $sql = "
                INSERT INTO messages (senderName, senderEmail, subject, message, type, status, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, NOW())
            ";
            Database::query($sql, [
                $input['name'] ?? $input['senderName'] ?? '',
                $input['email'] ?? '',
                $input['subject'] ?? '',
                $input['message'] ?? '',
                $input['type'] ?? 'inquiry',
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
            $rows = Database::query("SELECT * FROM messages WHERE id = ? LIMIT 1", [$id]);
            if (empty($rows)) {
                Utils::errorResponse('Message not found', 404);
            }
            Database::query("UPDATE messages SET status = 'read' WHERE id = ? AND status = 'unread'", [$id]);
            Utils::jsonResponse($rows[0]);
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
            Database::query("UPDATE messages SET status = ? WHERE id = ?", [$input['status'] ?? 'read', $id]);
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
        Database::query("UPDATE messages SET status = 'resolved' WHERE id = ?", [$id]);
        Utils::jsonResponse(['message' => 'Reply recorded successfully']);
    }

    public static function handleArchive($id) {
        if (Utils::getRequestMethod() !== 'POST') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAuth();
        Database::query("UPDATE messages SET status = 'archived' WHERE id = ?", [$id]);
        Utils::jsonResponse(['message' => 'Message archived successfully']);
    }

    public static function handleDelete($id) {
        if (Utils::getRequestMethod() !== 'DELETE') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAuth();
        Database::query("DELETE FROM messages WHERE id = ?", [$id]);
        Utils::jsonResponse(['message' => 'Message deleted successfully']);
    }
}
