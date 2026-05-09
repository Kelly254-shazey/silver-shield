<?php
/**
 * About Routes
 */
class AboutRoutes {
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
            $rows = Database::query("SELECT * FROM about LIMIT 1");
            $about = !empty($rows) ? array_merge(self::fallbackAbout(), $rows[0]) : self::fallbackAbout();
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
            $sql = "UPDATE about SET mission = ?, vision = ?, values = ? WHERE id = 1";
            Database::query($sql, [
                $input['mission'] ?? '',
                $input['vision'] ?? '',
                $input['values'] ?? ''
            ]);

            Utils::jsonResponse(['message' => 'About updated successfully']);
        } catch (Exception $e) {
            error_log('About update error: ' . $e->getMessage());
            Utils::errorResponse('Failed to update about', 500);
        }
    }
}
