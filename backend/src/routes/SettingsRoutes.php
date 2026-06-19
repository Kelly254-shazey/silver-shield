<?php
/**
 * Settings Routes - Global site configuration
 */
class SettingsRoutes {
    private static function ensureTable() {
        Database::query(
            "CREATE TABLE IF NOT EXISTS site_settings (
                id INT PRIMARY KEY,
                contactEmail VARCHAR(255) NULL,
                contactPhone VARCHAR(255) NULL,
                officeLocation TEXT NULL,
                mpesaPaybill VARCHAR(50) NULL,
                mpesaAccount VARCHAR(100) NULL,
                paypalEmail VARCHAR(255) NULL,
                facebookUrl VARCHAR(512) NULL,
                twitterUrl VARCHAR(512) NULL,
                linkedinUrl VARCHAR(512) NULL,
                websiteUrl VARCHAR(512) NULL,
                contactHeroImage VARCHAR(512) NULL,
                tagline TEXT NULL,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )"
        );

        $columns = Database::query("SHOW COLUMNS FROM site_settings");
        $names = array_map(function ($column) { return $column['Field']; }, $columns);
        $missing = [
            'websiteUrl' => "ALTER TABLE site_settings ADD COLUMN websiteUrl VARCHAR(512) NULL AFTER linkedinUrl",
            'contactHeroImage' => "ALTER TABLE site_settings ADD COLUMN contactHeroImage VARCHAR(512) NULL AFTER websiteUrl",
        ];
        foreach ($missing as $column => $sql) {
            if (!in_array($column, $names, true)) {
                Database::query($sql);
            }
        }
        
        $existing = Database::query("SELECT id FROM site_settings WHERE id = 1");
        if (empty($existing)) {
            Database::query("INSERT INTO site_settings (id) VALUES (1)");
        }
    }

    public static function handleGet() {
        Auth::requireAdmin();
        self::ensureTable();
        $rows = Database::query("SELECT * FROM site_settings WHERE id = 1");
        Utils::jsonResponse($rows[0] ?? []);
    }

    public static function handleGetPublic() {
        self::ensureTable();
        $rows = Database::query("SELECT * FROM site_settings WHERE id = 1");
        Utils::jsonResponse($rows[0] ?? []);
    }

    public static function handleUpdate() {
        Auth::requireAdmin();
        self::ensureTable();
        $input = Utils::getJsonInput();
        
        $fields = [
            'contactEmail', 'contactPhone', 'officeLocation', 
            'mpesaPaybill', 'mpesaAccount', 'paypalEmail', 
            'facebookUrl', 'twitterUrl', 'linkedinUrl', 'websiteUrl',
            'contactHeroImage', 'tagline'
        ];
        
        $sets = [];
        $params = [];
        foreach ($fields as $field) {
            if (isset($input[$field])) {
                $sets[] = "$field = ?";
                $params[] = $input[$field];
            }
        }
        
        if (empty($sets)) {
            Utils::errorResponse('No settings to update', 400);
        }
        
        $params[] = 1;
        Database::query(
            "UPDATE site_settings SET " . implode(', ', $sets) . " WHERE id = ?",
            $params
        );
        
        Utils::jsonResponse(['message' => 'Settings updated successfully']);
    }
}
