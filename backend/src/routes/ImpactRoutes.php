<?php
/**
 * Impact Routes - Impact metrics and statistics
 */
class ImpactRoutes {
    private static function ensureTable() {
        Database::query(
            "CREATE TABLE IF NOT EXISTS impact_stats (
                id INT AUTO_INCREMENT PRIMARY KEY,
                metricKey VARCHAR(120) NULL,
                label VARCHAR(255) NOT NULL,
                value INT NOT NULL DEFAULT 0,
                unit VARCHAR(64) NULL,
                trend INT NOT NULL DEFAULT 0,
                orderIndex INT NOT NULL DEFAULT 0,
                icon VARCHAR(120) NULL,
                reportUrl VARCHAR(512) NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_impact_metric (metricKey)
            )"
        );

        $columns = Database::query("SHOW COLUMNS FROM impact_stats");
        $names = array_map(function ($column) { return $column['Field']; }, $columns);
        $missing = [
            'orderIndex' => "ALTER TABLE impact_stats ADD COLUMN orderIndex INT NOT NULL DEFAULT 0 AFTER trend",
            'icon' => "ALTER TABLE impact_stats ADD COLUMN icon VARCHAR(120) NULL AFTER orderIndex",
            'reportUrl' => "ALTER TABLE impact_stats ADD COLUMN reportUrl VARCHAR(512) NULL AFTER icon",
        ];
        foreach ($missing as $column => $sql) {
            if (!in_array($column, $names, true)) {
                Database::query($sql);
            }
        }
    }

    public static function handleStats() {
        if (Utils::getRequestMethod() !== 'GET') {
            Utils::errorResponse('Method not allowed', 405);
        }

        try {
            self::ensureTable();
            $rows = Database::query(
                "SELECT * FROM impact_stats ORDER BY orderIndex ASC, updatedAt DESC, id DESC"
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
            self::ensureTable();
            Database::query(
                "INSERT INTO impact_stats (metricKey, label, value, unit, trend, orderIndex, icon, reportUrl) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    $input['metricKey'] ?? '',
                    $input['label'] ?? '',
                    (int)($input['value'] ?? 0),
                    $input['unit'] ?? '',
                    (int)($input['trend'] ?? 0),
                    (int)($input['orderIndex'] ?? 0),
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
            self::ensureTable();
            Database::query(
                "UPDATE impact_stats 
                 SET metricKey = ?, label = ?, value = ?, unit = ?, trend = ?, orderIndex = ?, icon = ?, reportUrl = ?, updatedAt = NOW()
                 WHERE id = ?",
                [
                    $input['metricKey'] ?? '',
                    $input['label'] ?? '',
                    (int)($input['value'] ?? 0),
                    $input['unit'] ?? '',
                    (int)($input['trend'] ?? 0),
                    (int)($input['orderIndex'] ?? 0),
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
            self::ensureTable();
            Database::query("DELETE FROM impact_stats WHERE id = ?", [$id]);
            Utils::jsonResponse(['message' => 'Impact stat deleted successfully']);
        } catch (Exception $e) {
            error_log('Impact delete error: ' . $e->getMessage());
            Utils::errorResponse('Failed to delete impact stat', 500);
        }
    }
}
