<?php
/**
 * Blog Routes
 */
class BlogRoutes {
    private static function ensureTable() {
        Database::query(
            "CREATE TABLE IF NOT EXISTS blog_posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                slug VARCHAR(255) NOT NULL UNIQUE,
                excerpt TEXT NULL,
                content LONGTEXT NULL,
                coverImage VARCHAR(512) NULL,
                category VARCHAR(120) NULL,
                author VARCHAR(255) NULL,
                status VARCHAR(32) NOT NULL DEFAULT 'published',
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_blog_posts_slug (slug),
                INDEX idx_blog_posts_status (status)
            )"
        );
    }

    private static function row($id) {
        self::ensureTable();
        $rows = Database::query(
            "SELECT * FROM blog_posts WHERE id = ? OR slug = ? OR LOWER(slug) = LOWER(?) LIMIT 1",
            [$id, $id, $id]
        );
        return $rows[0] ?? null;
    }

    public static function handleList() {
        if (Utils::getRequestMethod() !== 'GET') {
            Utils::errorResponse('Method not allowed', 405);
        }

        try {
            self::ensureTable();
            $where = empty($_GET['admin']) ? "WHERE status = 'published'" : "";
            $rows = Database::query("SELECT * FROM blog_posts $where ORDER BY createdAt DESC");
            Utils::jsonResponse($rows);
        } catch (Exception $e) {
            error_log('Blog list error: ' . $e->getMessage());
            Utils::errorResponse('Failed to fetch blog posts', 500);
        }
    }

    public static function handleCreate() {
        if (Utils::getRequestMethod() !== 'POST') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAdmin();
        $input = Utils::getJsonInput();
        $title = trim($input['title'] ?? '');
        if ($title === '') {
            Utils::errorResponse('Title is required.', 400);
        }

        try {
            self::ensureTable();
            Database::query(
                "INSERT INTO blog_posts (title, slug, excerpt, content, coverImage, category, author, status, createdAt)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())",
                [
                    $title,
                    Utils::createSlug($input['slug'] ?? $title),
                    $input['excerpt'] ?? '',
                    $input['content'] ?? '',
                    $input['coverImage'] ?? '',
                    $input['category'] ?? '',
                    $input['author'] ?? '',
                    $input['status'] ?? 'published'
                ]
            );
            Utils::jsonResponse(['message' => 'Blog post created successfully'], 201);
        } catch (Exception $e) {
            error_log('Blog create error: ' . $e->getMessage());
            Utils::errorResponse('Failed to create blog post', 500);
        }
    }

    public static function handleGet($id) {
        if (Utils::getRequestMethod() !== 'GET') {
            Utils::errorResponse('Method not allowed', 405);
        }

        try {
            $post = self::row($id);
            if (!$post) {
                Utils::errorResponse('Blog post not found', 404);
            }
            Utils::jsonResponse($post);
        } catch (Exception $e) {
            error_log('Blog get error: ' . $e->getMessage());
            Utils::errorResponse('Failed to fetch blog post', 500);
        }
    }

    public static function handleUpdate($id) {
        if (Utils::getRequestMethod() !== 'PUT') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAdmin();
        $input = Utils::getJsonInput();
        $title = trim($input['title'] ?? '');
        if ($title === '') {
            Utils::errorResponse('Title is required.', 400);
        }

        try {
            self::ensureTable();
            Database::query(
                "UPDATE blog_posts
                 SET title = ?, slug = ?, excerpt = ?, content = ?, coverImage = ?, category = ?, author = ?, status = ?, updatedAt = NOW()
                 WHERE id = ? OR slug = ?",
                [
                    $title,
                    Utils::createSlug($input['slug'] ?? $title),
                    $input['excerpt'] ?? '',
                    $input['content'] ?? '',
                    $input['coverImage'] ?? '',
                    $input['category'] ?? '',
                    $input['author'] ?? '',
                    $input['status'] ?? 'published',
                    $id,
                    $id
                ]
            );
            Utils::jsonResponse(['message' => 'Blog post updated successfully']);
        } catch (Exception $e) {
            error_log('Blog update error: ' . $e->getMessage());
            Utils::errorResponse('Failed to update blog post', 500);
        }
    }

    public static function handleDelete($id) {
        if (Utils::getRequestMethod() !== 'DELETE') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAdmin();
        try {
            self::ensureTable();
            Database::query("DELETE FROM blog_posts WHERE id = ? OR slug = ?", [$id, $id]);
            Utils::jsonResponse(['message' => 'Blog post deleted successfully']);
        } catch (Exception $e) {
            error_log('Blog delete error: ' . $e->getMessage());
            Utils::errorResponse('Failed to delete blog post', 500);
        }
    }
}
