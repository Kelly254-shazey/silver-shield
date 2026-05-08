<?php
/**
 * Documentation Routes
 */
class DocRoutes {
    public static function handleListPublic() {
        if (Utils::getRequestMethod() !== 'GET') {
            Utils::errorResponse('Method not allowed', 405);
        }

        try {
            $filters = ['isPublished = 1'];
            $params = [];

            if (!empty($_GET['category'])) {
                $filters[] = "LOWER(category) = ?";
                $params[] = strtolower(trim($_GET['category']));
            }

            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
            $limit = min(50, max(1, $limit));
            $params[] = $limit;

            $sql = "SELECT id, title, category, content, createdAt, updatedAt 
                    FROM docs 
                    WHERE " . implode(" AND ", $filters) . " 
                    ORDER BY updatedAt DESC, createdAt DESC 
                    LIMIT ?";

            $rows = Database::query($sql, $params);
            Utils::jsonResponse($rows);
        } catch (Exception $e) {
            error_log('Doc list error: ' . $e->getMessage());
            Utils::errorResponse('Failed to fetch documentation', 500);
        }
    }

    public static function handleDownload($id) {
        if (Utils::getRequestMethod() !== 'GET') {
            Utils::errorResponse('Method not allowed', 405);
        }

        try {
            $rows = Database::query(
                "SELECT id, title, content, updatedAt FROM docs WHERE id = ? AND isPublished = 1 LIMIT 1",
                [$id]
            );

            if (empty($rows)) {
                Utils::errorResponse('Document not found', 404);
            }

            $doc = $rows[0];
            $safeTitle = strtolower(preg_replace('/[^a-z0-9]+/', '-', $doc['title']));
            $printableDate = $doc['updatedAt'] ? date('Y-m-d', strtotime($doc['updatedAt'])) : date('Y-m-d');

            header('Content-Type: text/plain; charset=utf-8');
            header("Content-Disposition: attachment; filename=\"" . ($safeTitle ?: 'document') . "-$printableDate.txt\"");

            echo $doc['title'] . "\n\n" . trim($doc['content'] ?? '') . "\n\nUpdated: $printableDate";
            exit;
        } catch (Exception $e) {
            error_log('Doc download error: ' . $e->getMessage());
            Utils::errorResponse('Failed to download document', 500);
        }
    }

    public static function handleList() {
        if (Utils::getRequestMethod() !== 'GET') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAdmin();

        try {
            $rows = Database::query(
                "SELECT d.*, (SELECT COUNT(*) FROM doc_chunks dc WHERE dc.docId = d.id) AS chunksCount 
                 FROM docs d 
                 ORDER BY d.updatedAt DESC"
            );
            Utils::jsonResponse($rows);
        } catch (Exception $e) {
            error_log('Doc list error: ' . $e->getMessage());
            Utils::errorResponse('Failed to fetch documents', 500);
        }
    }

    public static function handleGet($id) {
        if (Utils::getRequestMethod() !== 'GET') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAdmin();

        try {
            $rows = Database::query("SELECT * FROM docs WHERE id = ? LIMIT 1", [$id]);
            if (empty($rows)) {
                Utils::errorResponse('Document not found', 404);
            }
            Utils::jsonResponse($rows[0]);
        } catch (Exception $e) {
            error_log('Doc get error: ' . $e->getMessage());
            Utils::errorResponse('Failed to fetch document', 500);
        }
    }

    public static function handleCreate() {
        if (Utils::getRequestMethod() !== 'POST') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAdmin();
        $input = Utils::getJsonInput();

        try {
            $sql = "INSERT INTO docs (title, category, content, isPublished, createdAt)
                    VALUES (?, ?, ?, ?, NOW())";
            $result = Database::execute($sql, [
                $input['title'] ?? '',
                $input['category'] ?? '',
                $input['content'] ?? '',
                isset($input['isPublished']) ? ($input['isPublished'] ? 1 : 0) : 0
            ]);

            $indexing = AIService::reindexDocument($result['insertId'], $input['content'] ?? '');
            Utils::jsonResponse(['indexing' => $indexing], 201, 'Document created successfully');
        } catch (Exception $e) {
            error_log('Doc create error: ' . $e->getMessage());
            Utils::errorResponse('Failed to create document', 500);
        }
    }

    public static function handleUpdate($id) {
        if (Utils::getRequestMethod() !== 'PUT') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAdmin();
        $input = Utils::getJsonInput();

        try {
            $sql = "UPDATE docs SET title = ?, category = ?, content = ?, isPublished = ?, updatedAt = NOW() 
                    WHERE id = ?";
            Database::execute($sql, [
                $input['title'] ?? '',
                $input['category'] ?? '',
                $input['content'] ?? '',
                isset($input['isPublished']) ? ($input['isPublished'] ? 1 : 0) : 0,
                $id
            ]);

            $indexing = AIService::reindexDocument($id, $input['content'] ?? '');
            Utils::jsonResponse(['indexing' => $indexing], 200, 'Document updated successfully');
        } catch (Exception $e) {
            error_log('Doc update error: ' . $e->getMessage());
            Utils::errorResponse('Failed to update document', 500);
        }
    }

    public static function handleReindex($id) {
        if (Utils::getRequestMethod() !== 'POST') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAdmin();

        try {
            $rows = Database::query("SELECT content FROM docs WHERE id = ? LIMIT 1", [$id]);
            if (empty($rows)) {
                Utils::errorResponse('Document not found', 404);
            }

            $indexing = AIService::reindexDocument($id, $rows[0]['content'] ?? '');
            Utils::jsonResponse(['indexing' => $indexing], 200, 'Document indexed successfully.');
        } catch (Exception $e) {
            error_log('Doc reindex error: ' . $e->getMessage());
            Utils::errorResponse('Failed to reindex document', 500);
        }
    }

    public static function handleDelete($id) {
        if (Utils::getRequestMethod() !== 'DELETE') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAdmin();

        try {
            Database::execute("DELETE FROM doc_chunks WHERE docId = ?", [$id]);
            Database::execute("DELETE FROM docs WHERE id = ?", [$id]);
            Utils::jsonResponse(['message' => 'Document deleted successfully']);
        } catch (Exception $e) {
            error_log('Doc delete error: ' . $e->getMessage());
            Utils::errorResponse('Failed to delete document', 500);
        }
    }
}
