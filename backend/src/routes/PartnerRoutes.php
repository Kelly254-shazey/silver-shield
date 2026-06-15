<?php
/**
 * Partner Routes
 */
class PartnerRoutes {
    public static function handleList() {
        if (Utils::getRequestMethod() !== 'GET') {
            Utils::errorResponse('Method not allowed', 405);
        }

        try {
            $rows = Database::query("SELECT * FROM partners ORDER BY orderIndex ASC, id ASC");
            Utils::jsonResponse($rows);
        } catch (Exception $e) {
            error_log('Partners list error: ' . $e->getMessage());
            Utils::errorResponse('Failed to fetch partners', 500);
        }
    }

    public static function handleCreate() {
        if (Utils::getRequestMethod() !== 'POST') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAdmin();
        $input = Utils::getJsonInput();

        if (empty($input['name']) || empty($input['logoUrl'])) {
            Utils::errorResponse('Name and logoUrl are required', 400);
        }

        try {
            Database::query(
                "INSERT INTO partners (name, logoUrl, websiteUrl, orderIndex) VALUES (?, ?, ?, ?)",
                [
                    trim($input['name']),
                    trim($input['logoUrl']),
                    trim($input['websiteUrl'] ?? ''),
                    (int)($input['orderIndex'] ?? 0)
                ]
            );

            $insertId = Database::getConnection()->insert_id;
            $rows = Database::query("SELECT * FROM partners WHERE id = ?", [$insertId]);
            Utils::jsonResponse($rows[0] ?? ['message' => 'Partner created successfully'], 201);
        } catch (Exception $e) {
            error_log('Partners create error: ' . $e->getMessage());
            Utils::errorResponse('Failed to create partner', 500);
        }
    }

    public static function handleUpdate($id) {
        if (Utils::getRequestMethod() !== 'PUT') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAdmin();
        $input = Utils::getJsonInput();

        try {
            Database::query(
                "UPDATE partners SET name = ?, logoUrl = ?, websiteUrl = ?, orderIndex = ?, updatedAt = NOW() WHERE id = ?",
                [
                    trim($input['name'] ?? ''),
                    trim($input['logoUrl'] ?? ''),
                    trim($input['websiteUrl'] ?? ''),
                    (int)($input['orderIndex'] ?? 0),
                    $id
                ]
            );

            $rows = Database::query("SELECT * FROM partners WHERE id = ?", [$id]);
            if (empty($rows)) {
                Utils::errorResponse('Partner not found', 404);
            }

            Utils::jsonResponse($rows[0]);
        } catch (Exception $e) {
            error_log('Partners update error: ' . $e->getMessage());
            Utils::errorResponse('Failed to update partner', 500);
        }
    }

    public static function handleDelete($id) {
        if (Utils::getRequestMethod() !== 'DELETE') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAdmin();

        try {
            Database::query("DELETE FROM partners WHERE id = ?", [$id]);
            Utils::jsonResponse(['message' => 'Partner deleted successfully']);
        } catch (Exception $e) {
            error_log('Partners delete error: ' . $e->getMessage());
            Utils::errorResponse('Failed to delete partner', 500);
        }
    }
}
