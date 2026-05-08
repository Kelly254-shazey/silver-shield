<?php
/**
 * Programs Routes
 */
class ProgramRoutes {
    private static $initiatives = [
        [
            'title' => 'Women empowerment program (wezesha dada initiative)',
            'slug' => 'women-empowerment-program-wezesha-dada-initiative',
            'summary' => 'Empowering women through mentorship, enterprise support, and leadership pathways.',
            'description' => 'The Wezesha Dada initiative strengthens women-led households through training and support.',
            'category' => 'Women Empowerment',
            'location' => 'Nairobi and surrounding counties'
        ],
        [
            'title' => 'Youth empowerment program',
            'slug' => 'youth-empowerment-program',
            'summary' => 'Preparing youth with skills, confidence, and opportunities for sustainable futures.',
            'description' => 'Our youth program provides mentorship and entrepreneurship support.',
            'category' => 'Youth Empowerment',
            'location' => 'Nairobi, Kisumu, and Mombasa'
        ]
    ];

    public static function handleList() {
        if (Utils::getRequestMethod() !== 'GET') {
            Utils::errorResponse('Method not allowed', 405);
        }

        try {
            $where = empty($_GET['admin']) ? "WHERE status <> 'archived'" : "";
            $rows = Database::query("SELECT * FROM programs $where ORDER BY createdAt DESC");
            foreach ($rows as &$row) {
                $row['galleryImages'] = json_decode($row['galleryImages'] ?? '[]', true) ?: [];
            }
            Utils::jsonResponse($rows);
        } catch (Exception $e) {
            error_log('Programs list error: ' . $e->getMessage());
            Utils::errorResponse('Failed to fetch programs', 500);
        }
    }

    public static function handleCreate() {
        if (Utils::getRequestMethod() !== 'POST') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAdmin();
        $input = Utils::getJsonInput();

        $title = $input['title'] ?? '';
        $slug = Utils::createSlug($input['slug'] ?? $title);
            $summary = $input['summary'] ?? '';
            $description = $input['description'] ?? '';
            $category = $input['category'] ?? '';

        if (empty($title) || empty($description)) {
            Utils::errorResponse('Title and description are required.', 400);
        }

        try {
            $sql = "
                INSERT INTO programs (title, slug, summary, description, category, heroImage, galleryImages, goalAmount, raisedAmount, location, status, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ";
            Database::execute($sql, [
                $title,
                $slug,
                $summary,
                $description,
                $category,
                $input['heroImage'] ?? '',
                json_encode($input['galleryImages'] ?? []),
                (float)($input['goalAmount'] ?? 0),
                (float)($input['raisedAmount'] ?? 0),
                $input['location'] ?? '',
                $input['status'] ?? 'active'
            ]);
            Utils::jsonResponse(['message' => 'Program created successfully'], 201);
        } catch (Exception $e) {
            error_log('Programs create error: ' . $e->getMessage());
            Utils::errorResponse('Failed to create program', 500);
        }
    }

    public static function handleGet($id) {
        if (Utils::getRequestMethod() !== 'GET') {
            Utils::errorResponse('Method not allowed', 405);
        }

        try {
            $rows = Database::query(
                "SELECT * FROM programs WHERE id = ? OR slug = ? LIMIT 1",
                [$id, $id]
            );

            if (empty($rows)) {
                Utils::errorResponse('Program not found', 404);
            }

            $rows[0]['galleryImages'] = json_decode($rows[0]['galleryImages'] ?? '[]', true) ?: [];
            Utils::jsonResponse($rows[0]);
        } catch (Exception $e) {
            error_log('Programs get error: ' . $e->getMessage());
            Utils::errorResponse('Failed to fetch program', 500);
        }
    }

    public static function handleUpdate($id) {
        if (Utils::getRequestMethod() !== 'PUT') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAdmin();
        $input = Utils::getJsonInput();

        try {
            $sql = "UPDATE programs SET title = ?, slug = ?, summary = ?, description = ?, category = ?, heroImage = ?, galleryImages = ?, goalAmount = ?, raisedAmount = ?, location = ?, status = ?, updatedAt = NOW() WHERE id = ? OR slug = ?";
            Database::execute($sql, [
                $input['title'] ?? '',
                Utils::createSlug($input['slug'] ?? $input['title'] ?? $id),
                $input['summary'] ?? '',
                $input['description'] ?? '',
                $input['category'] ?? '',
                $input['heroImage'] ?? '',
                json_encode($input['galleryImages'] ?? []),
                (float)($input['goalAmount'] ?? 0),
                (float)($input['raisedAmount'] ?? 0),
                $input['location'] ?? '',
                $input['status'] ?? 'active',
                $id,
                $id
            ]);

            Utils::jsonResponse(['message' => 'Program updated successfully']);
        } catch (Exception $e) {
            error_log('Programs update error: ' . $e->getMessage());
            Utils::errorResponse('Failed to update program', 500);
        }
    }

    public static function handleDelete($id) {
        if (Utils::getRequestMethod() !== 'DELETE') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAdmin();

        try {
            Database::execute("DELETE FROM programs WHERE id = ? OR slug = ?", [$id, $id]);
            Utils::jsonResponse(['message' => 'Program deleted successfully']);
        } catch (Exception $e) {
            error_log('Programs delete error: ' . $e->getMessage());
            Utils::errorResponse('Failed to delete program', 500);
        }
    }
}
