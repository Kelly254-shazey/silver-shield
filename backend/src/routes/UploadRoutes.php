<?php
/**
 * Upload Routes - File upload handling
 */
class UploadRoutes {
    public static function handleUpload() {
        if (Utils::getRequestMethod() !== 'POST') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAuth();

        if (empty($_FILES['file'])) {
            Utils::errorResponse('No file provided', 400);
        }

        try {
            $file = $_FILES['file'];
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword'];
            
            if (!in_array($file['type'], $allowedTypes)) {
                Utils::errorResponse('File type not allowed', 400);
            }

            if ($file['size'] > 10 * 1024 * 1024) { // 10MB limit
                Utils::errorResponse('File too large', 400);
            }

            $uploadDir = __DIR__ . '/../../uploads';
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $filename = bin2hex(random_bytes(16)) . '.' . pathinfo($file['name'], PATHINFO_EXTENSION);
            $filepath = $uploadDir . '/' . $filename;

            if (move_uploaded_file($file['tmp_name'], $filepath)) {
                Utils::rawJsonResponse([
                    'filename' => $filename,
                    'url' => '/backend/uploads/' . $filename,
                    'relativeUrl' => '/backend/uploads/' . $filename,
                    'size' => $file['size']
                ], 201);
            } else {
                Utils::errorResponse('Failed to save file', 500);
            }
        } catch (Exception $e) {
            error_log('Upload error: ' . $e->getMessage());
            Utils::errorResponse('Upload failed', 500);
        }
    }
}
