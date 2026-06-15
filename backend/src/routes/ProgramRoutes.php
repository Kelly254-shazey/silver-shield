<?php
/**
 * Programs Routes
 */
class ProgramRoutes {
    private static function programColumns() {
        $columns = Database::query("SHOW COLUMNS FROM programs");
        return array_map(function ($column) { return $column['Field']; }, $columns);
    }

    private static function ensureColumns() {
        try {
            $columns = self::programColumns();
            if (!in_array('parentId', $columns, true)) {
                Database::query("ALTER TABLE programs ADD COLUMN parentId INT NULL AFTER id");
            }
        } catch (Exception $e) { /* Table may not exist yet */ }
    }

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

    public static function handleSubList() {
        if (Utils::getRequestMethod() !== 'GET') {
            Utils::errorResponse('Method not allowed', 405);
        }

        try {
            self::ensureColumns();
            $where = empty($_GET['admin'])
                ? "WHERE parentId IS NOT NULL AND status <> 'archived'"
                : "WHERE parentId IS NOT NULL";
            $rows = Database::query("SELECT * FROM programs $where ORDER BY createdAt DESC");
            foreach ($rows as &$row) {
                $row['galleryImages'] = json_decode($row['galleryImages'] ?? '[]', true) ?: [];
                $row['program_id'] = $row['parentId'] ?? null;
                $row['coverImage'] = $row['heroImage'] ?? '';
            }
            Utils::jsonResponse($rows);
        } catch (Exception $e) {
            error_log('Sub-programs list error: ' . $e->getMessage());
            Utils::errorResponse('Failed to fetch sub-programs', 500);
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
        $parentId = !empty($input['parentId']) ? (int)$input['parentId'] : null;

        if (empty($title) || empty($description)) {
            Utils::errorResponse('Title and description are required.', 400);
        }

        try {
            self::ensureColumns();
            $sql = "INSERT INTO programs (parentId, title, slug, summary, description, category, heroImage, galleryImages, goalAmount, raisedAmount, location, status, createdAt)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
                    
            Database::query($sql, [
                $parentId,
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

    public static function handleSubCreate() {
        $_POST['_subProgramRoute'] = true;
        self::handleCreate();
    }

    public static function handleGet($id) {
        if (Utils::getRequestMethod() !== 'GET') {
            Utils::errorResponse('Method not allowed', 405);
        }

        try {
            self::ensureColumns();
            // More robust lookup: check ID, check exact slug, and check case-insensitive slug
            $rows = Database::query(
                "SELECT * FROM programs WHERE id = ? OR slug = ? OR LOWER(slug) = LOWER(?) LIMIT 1",
                [$id, $id, $id]
            );

            if (empty($rows)) {
                Utils::errorResponse('Program not found', 404);
            }

            $program = $rows[0];
            $program['galleryImages'] = json_decode($program['galleryImages'] ?? '[]', true) ?: [];

            // Fetch "Sub-programs" (Explicit children OR same-category fallback if no explicit children exist)
            $category = $program['category'] ?? '';
            $program['sub_programs'] = Database::query(
                "SELECT id, title, slug, summary, heroImage, category, description, goalAmount, raisedAmount, location, status FROM programs 
                 WHERE parentId = ? AND status <> 'archived' ORDER BY createdAt ASC LIMIT 6",
                [$program['id']]
            );

            Utils::jsonResponse($program);
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
            self::ensureColumns();
            // First, find the current state to preserve the slug if not provided
            $existing = Database::query("SELECT slug FROM programs WHERE id = ? OR slug = ? LIMIT 1", [$id, $id]);
            $currentSlug = !empty($existing) ? $existing[0]['slug'] : $id;

            $title = $input['title'] ?? '';
            // Prioritize input slug > generated slug from title > current slug
            $newSlug = Utils::createSlug($input['slug'] ?? ($title ?: $currentSlug));
            $parentId = !empty($input['parentId']) ? (int)$input['parentId'] : null;

            $sql = "UPDATE programs SET parentId = ?, title = ?, slug = ?, summary = ?, description = ?, category = ?, heroImage = ?, galleryImages = ?, goalAmount = ?, raisedAmount = ?, location = ?, status = ?, updatedAt = NOW() WHERE id = ? OR slug = ?";
            Database::query($sql, [
                $parentId,
                $title,
                $newSlug,
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

    public static function handleSubUpdate($id) {
        self::handleUpdate($id);
    }

    public static function handleDelete($id) {
        if (Utils::getRequestMethod() !== 'DELETE') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAdmin();

        try {
            Database::query("DELETE FROM programs WHERE id = ? OR slug = ?", [$id, $id]);
            Utils::jsonResponse(['message' => 'Program deleted successfully']);
        } catch (Exception $e) {
            error_log('Programs delete error: ' . $e->getMessage());
            Utils::errorResponse('Failed to delete program', 500);
        }
    }

    public static function handleSubDelete($id) {
        self::handleDelete($id);
    }
}
