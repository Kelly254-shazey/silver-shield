<?php
/**
 * Stories Routes
 */
class StoryRoutes {
    public static function handleList() {
        if (Utils::getRequestMethod() !== 'GET') {
            Utils::errorResponse('Method not allowed', 405);
        }

        try {
            $where = empty($_GET['admin']) ? "WHERE status = 'published'" : "";
            $rows = Database::query("SELECT * FROM stories $where ORDER BY createdAt DESC");
            foreach ($rows as &$row) {
                $row['tags'] = json_decode($row['tags'] ?? '[]', true) ?: [];
                if (empty($row['coverImage']) && !empty($row['heroImage'])) $row['coverImage'] = $row['heroImage'];
            }
            Utils::jsonResponse($rows);
        } catch (Exception $e) {
            error_log('Stories list error: ' . $e->getMessage());
            Utils::errorResponse('Failed to fetch stories', 500);
        }
    }

    public static function handleCreate() {
        if (Utils::getRequestMethod() !== 'POST') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAdmin();
        $input = Utils::getJsonInput();

        try {
            $sql = "
                INSERT INTO stories (title, slug, content, excerpt, author, heroImage, status, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            ";
            Database::execute($sql, [
                $input['title'] ?? '',
                Utils::createSlug($input['slug'] ?? $input['title'] ?? ''),
                $input['content'] ?? '',
                $input['excerpt'] ?? '',
                $input['author'] ?? '',
                $input['coverImage'] ?? $input['heroImage'] ?? '',
                $input['status'] ?? 'published'
            ]);

            $storyId = Database::getConnection()->insert_id;
            Database::execute(
                "UPDATE stories SET coverImage = ?, category = ?, programSlug = ?, tags = ? WHERE id = ?",
                [
                    $input['coverImage'] ?? $input['heroImage'] ?? '',
                    $input['category'] ?? '',
                    $input['programSlug'] ?? '',
                    json_encode($input['tags'] ?? []),
                    $storyId
                ]
            );

            Utils::jsonResponse(['message' => 'Story created successfully'], 201);
        } catch (Exception $e) {
            error_log('Stories create error: ' . $e->getMessage());
            Utils::errorResponse('Failed to create story', 500);
        }
    }

    public static function handleGet($id) {
        if (Utils::getRequestMethod() !== 'GET') {
            Utils::errorResponse('Method not allowed', 405);
        }

        try {
            $rows = Database::query(
                "SELECT * FROM stories WHERE id = ? OR slug = ? LIMIT 1",
                [$id, $id]
            );

            if (empty($rows)) {
                Utils::errorResponse('Story not found', 404);
            }

            $rows[0]['tags'] = json_decode($rows[0]['tags'] ?? '[]', true) ?: [];
            if (empty($rows[0]['coverImage']) && !empty($rows[0]['heroImage'])) $rows[0]['coverImage'] = $rows[0]['heroImage'];
            Utils::jsonResponse($rows[0]);
        } catch (Exception $e) {
            error_log('Stories get error: ' . $e->getMessage());
            Utils::errorResponse('Failed to fetch story', 500);
        }
    }

    public static function handleUpdate($id) {
        if (Utils::getRequestMethod() !== 'PUT') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAdmin();
        $input = Utils::getJsonInput();

        try {
            Database::execute(
                "UPDATE stories SET title = ?, slug = ?, excerpt = ?, content = ?, coverImage = ?, heroImage = ?, category = ?, programSlug = ?, author = ?, tags = ?, status = ?, updatedAt = NOW() WHERE id = ? OR slug = ?",
                [
                    $input['title'] ?? '',
                    Utils::createSlug($input['slug'] ?? $input['title'] ?? $id),
                    $input['excerpt'] ?? '',
                    $input['content'] ?? '',
                    $input['coverImage'] ?? '',
                    $input['coverImage'] ?? '',
                    $input['category'] ?? '',
                    $input['programSlug'] ?? '',
                    $input['author'] ?? '',
                    json_encode($input['tags'] ?? []),
                    $input['status'] ?? 'published',
                    $id,
                    $id
                ]
            );
            Utils::jsonResponse(['message' => 'Story updated successfully']);
        } catch (Exception $e) {
            error_log('Stories update error: ' . $e->getMessage());
            Utils::errorResponse('Failed to update story', 500);
        }
    }

    public static function handleDelete($id) {
        if (Utils::getRequestMethod() !== 'DELETE') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAdmin();

        try {
            Database::execute("DELETE FROM stories WHERE id = ? OR slug = ?", [$id, $id]);
            Utils::jsonResponse(['message' => 'Story deleted successfully']);
        } catch (Exception $e) {
            error_log('Stories delete error: ' . $e->getMessage());
            Utils::errorResponse('Failed to delete story', 500);
        }
    }
}
