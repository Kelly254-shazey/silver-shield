<?php
/**
 * About Routes
 */
class AboutRoutes {
    private static function aboutColumns() {
        $columns = Database::query("SHOW COLUMNS FROM `about_content`");
        return array_map(function ($column) {
            return $column['Field'];
        }, $columns);
    }

    private static function quoteIdentifier($identifier) {
        return '`' . str_replace('`', '``', $identifier) . '`';
    }

    private static function ensureAboutColumns() {
        $existing = self::aboutColumns();
        $required = [
            'title' => "VARCHAR(255) NULL",
            'storyContent' => "LONGTEXT NULL",
            'mission' => "LONGTEXT NULL",
            'vision' => "LONGTEXT NULL",
            'values' => "LONGTEXT NULL",
            'heroImage' => "VARCHAR(512) NULL",
            'videoUrl' => "VARCHAR(512) NULL"
        ];

        foreach ($required as $column => $definition) {
            if (!in_array($column, $existing, true)) {
                Database::query("ALTER TABLE `about_content` ADD COLUMN " . self::quoteIdentifier($column) . " $definition");
            }
        }
    }

    private static function normalizeAboutRow($row) {
        return array_merge(self::fallbackAbout(), $row ?: []);
    }

    private static function fallbackAbout() {
        return [
            'title' => 'About Silver Shield',
            'storyContent' => '',
            'mission' => 'Shaping lives through mentorship, outreach, and practical opportunity.',
            'vision' => 'A world where every individual has access to transformative mentorship and support.',
            'values' => 'Integrity, Compassion, Excellence',
            'heroImage' => '',
            'videoUrl' => ''
        ];
    }

    public static function handleGet() {
        if (Utils::getRequestMethod() !== 'GET') {
            Utils::errorResponse('Method not allowed', 405);
        }

        try {
            $rows = Database::query("SELECT * FROM `about_content` LIMIT 1");
            $about = !empty($rows) ? self::normalizeAboutRow($rows[0]) : self::fallbackAbout();
            Utils::jsonResponse($about);
        } catch (Exception $e) {
            error_log('About get error: ' . $e->getMessage());
            Utils::jsonResponse(self::fallbackAbout());
        }
    }

    public static function handleUpdate() {
        if (Utils::getRequestMethod() !== 'PUT') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAdmin();
        $input = Utils::getJsonInput();

        try {
            $existing = Database::query("SELECT id FROM `about_content` WHERE id = 1 LIMIT 1");
            if (empty($existing)) {
                Database::query("INSERT INTO `about_content` (id) VALUES (1)");
            }

            $columns = self::aboutColumns();
            $allowedFields = [
                'title' => $input['title'] ?? 'About Silver Shield',
                'storyContent' => $input['storyContent'] ?? '',
                'mission' => $input['mission'] ?? '',
                'vision' => $input['vision'] ?? '',
                'values' => $input['values'] ?? '',
                'heroImage' => $input['heroImage'] ?? '',
                'videoUrl' => $input['videoUrl'] ?? ''
            ];
            $sets = [];
            $params = [];
            foreach ($allowedFields as $field => $value) {
                if (in_array($field, $columns, true)) {
                    $sets[] = self::quoteIdentifier($field) . ' = ?';
                    $params[] = $value;
                }
            }

            if (empty($sets)) {
                Utils::errorResponse('About table has no editable columns.', 500);
            }

            $params[] = 1;
            $sql = "UPDATE `about_content` SET " . implode(', ', $sets) . " WHERE id = ?";
            Database::query($sql, $params);

            $rows = Database::query("SELECT * FROM `about_content` WHERE id = 1 LIMIT 1");
            Utils::jsonResponse(!empty($rows) ? self::normalizeAboutRow($rows[0]) : self::fallbackAbout(), 200, 'About updated successfully');
        } catch (Exception $e) {
            error_log('About update error: ' . $e->getMessage() . ' SQL: ' . ($sql ?? 'none'));
            Utils::errorResponse('Failed to update about: ' . $e->getMessage(), 500);
        }
    }
}
