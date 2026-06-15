<?php
/**
 * Upload Routes - File upload handling
 */
class UploadRoutes {
    private static function allowedTypes() {
        return [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'application/msword',
            'video/mp4',
            'video/webm',
            'video/quicktime'
        ];
    }

    private static function hasCloudinaryConfig() {
        return Env::get('CLOUDINARY_CLOUD_NAME') && Env::get('CLOUDINARY_API_KEY') && Env::get('CLOUDINARY_API_SECRET');
    }

    private static function hasPartialCloudinaryConfig() {
        return Env::get('CLOUDINARY_CLOUD_NAME') || Env::get('CLOUDINARY_API_KEY') || Env::get('CLOUDINARY_API_SECRET');
    }

    private static function cloudinarySignature($params, $secret) {
        ksort($params);
        $parts = [];
        foreach ($params as $key => $value) {
            if ($value !== '' && $value !== null) {
                $parts[] = $key . '=' . $value;
            }
        }
        return sha1(implode('&', $parts) . $secret);
    }

    private static function uploadToCloudinary($file) {
        if (!function_exists('curl_init') || !class_exists('CURLFile')) {
            Utils::errorResponse('Cloudinary upload requires PHP cURL support.', 500);
        }

        $cloudName = Env::get('CLOUDINARY_CLOUD_NAME');
        $apiKey = Env::get('CLOUDINARY_API_KEY');
        $apiSecret = Env::get('CLOUDINARY_API_SECRET');
        $folder = Env::get('CLOUDINARY_FOLDER', 'silver-shield/uploads');
        $timestamp = time();
        $signatureParams = [
            'folder' => $folder,
            'timestamp' => $timestamp
        ];

        $payload = [
            'file' => new CURLFile($file['tmp_name'], $file['type'], $file['name']),
            'api_key' => $apiKey,
            'timestamp' => $timestamp,
            'folder' => $folder,
            'signature' => self::cloudinarySignature($signatureParams, $apiSecret)
        ];

        $url = 'https://api.cloudinary.com/v1_1/' . rawurlencode($cloudName) . '/auto/upload';
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, Env::isProduction());

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($response === false || $curlError) {
            error_log('Cloudinary upload cURL error: ' . $curlError);
            Utils::errorResponse('Cloudinary upload failed', 502);
        }

        $data = json_decode($response, true);
        if ($httpCode < 200 || $httpCode >= 300 || empty($data['secure_url'])) {
            error_log('Cloudinary upload error: HTTP ' . $httpCode . ' ' . $response);
            Utils::errorResponse($data['error']['message'] ?? 'Cloudinary upload failed', 502);
        }

        Utils::rawJsonResponse([
            'filename' => basename(parse_url($data['secure_url'], PHP_URL_PATH) ?? ''),
            'url' => $data['secure_url'],
            'relativeUrl' => $data['secure_url'],
            'provider' => 'cloudinary',
            'publicId' => $data['public_id'] ?? '',
            'resourceType' => $data['resource_type'] ?? '',
            'size' => $file['size']
        ], 201);
    }

    private static function uploadLocally($file) {
        $uploadDir = __DIR__ . '/../../uploads';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $filename = bin2hex(random_bytes(16)) . '.' . pathinfo($file['name'], PATHINFO_EXTENSION);
        $filepath = $uploadDir . '/' . $filename;

        if (move_uploaded_file($file['tmp_name'], $filepath)) {
            $basePath = rtrim((string)Env::get('APP_BASE_PATH', '/backend'), '/');
            $relativeUrl = $basePath . '/uploads/' . $filename;
            $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
            $host = $_SERVER['HTTP_HOST'] ?? 'edumin.co.ke';

            Utils::rawJsonResponse([
                'filename' => $filename,
                'url' => $scheme . '://' . $host . $relativeUrl,
                'relativeUrl' => $relativeUrl,
                'provider' => 'local',
                'size' => $file['size']
            ], 201);
        }

        Utils::errorResponse('Failed to save file', 500);
    }

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
            
            if (!in_array($file['type'], self::allowedTypes())) {
                Utils::errorResponse('File type not allowed', 400);
            }

            if ($file['size'] > 10 * 1024 * 1024) { // 10MB limit
                Utils::errorResponse('File too large', 400);
            }

            if (self::hasCloudinaryConfig()) {
                self::uploadToCloudinary($file);
            }

            if (self::hasPartialCloudinaryConfig()) {
                Utils::errorResponse('Cloudinary is missing CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET.', 500);
            }

            self::uploadLocally($file);
        } catch (Exception $e) {
            error_log('Upload error: ' . $e->getMessage());
            Utils::errorResponse('Upload failed', 500);
        }
    }
}
