<?php
/**
 * Impact Routes - Impact metrics and statistics
 */
class ImpactRoutes {
    public static function handleStats() {
        if (Utils::getRequestMethod() !== 'GET') {
            Utils::errorResponse('Method not allowed', 405);
        }

        try {
            $rows = Database::query(
                "SELECT * FROM impact_stats ORDER BY updatedAt DESC, id DESC"
            );
            Utils::jsonResponse($rows);
        } catch (Exception $e) {
            error_log('Impact stats error: ' . $e->getMessage());
            Utils::errorResponse('Failed to fetch impact statistics', 500);
        }
    }

    public static function handleCreateStat() {
        if (Utils::getRequestMethod() !== 'POST') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAdmin();
        $input = Utils::getJsonInput();

        if (empty($input['label'])) {
            Utils::errorResponse('Label is required', 400);
        }

        try {
            Database::query(
                "INSERT INTO impact_stats (metricKey, label, value, unit, trend, icon, reportUrl) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)",
                [
                    $input['metricKey'] ?? '',
                    $input['label'] ?? '',
                    (int)($input['value'] ?? 0),
                    $input['unit'] ?? '',
                    (int)($input['trend'] ?? 0),
                    $input['icon'] ?? '',
                    $input['reportUrl'] ?? ''
                ]
            );

            Utils::jsonResponse(['message' => 'Impact stat created successfully'], 201);
        } catch (Exception $e) {
            error_log('Impact create error: ' . $e->getMessage());
            Utils::errorResponse('Failed to create impact stat', 500);
        }
    }

    public static function handleUpdateStat($id) {
        if (Utils::getRequestMethod() !== 'PUT') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAdmin();
        $input = Utils::getJsonInput();

        try {
            Database::query(
                "UPDATE impact_stats 
                 SET metricKey = ?, label = ?, value = ?, unit = ?, trend = ?, icon = ?, reportUrl = ?, updatedAt = NOW()
                 WHERE id = ?",
                [
                    $input['metricKey'] ?? '',
                    $input['label'] ?? '',
                    (int)($input['value'] ?? 0),
                    $input['unit'] ?? '',
                    (int)($input['trend'] ?? 0),
                    $input['icon'] ?? '',
                    $input['reportUrl'] ?? '',
                    $id
                ]
            );

            $rows = Database::query("SELECT * FROM impact_stats WHERE id = ?", [$id]);
            if (empty($rows)) {
                Utils::errorResponse('Impact stat not found', 404);
            }

            Utils::jsonResponse($rows[0]);
        } catch (Exception $e) {
            error_log('Impact update error: ' . $e->getMessage());
            Utils::errorResponse('Failed to update impact stat', 500);
        }
    }

    public static function handleDeleteStat($id) {
        if (Utils::getRequestMethod() !== 'DELETE') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAdmin();

        try {
            Database::query("DELETE FROM impact_stats WHERE id = ?", [$id]);
            Utils::jsonResponse(['message' => 'Impact stat deleted successfully']);
        } catch (Exception $e) {
            error_log('Impact delete error: ' . $e->getMessage());
            Utils::errorResponse('Failed to delete impact stat', 500);
        }
    }
}
