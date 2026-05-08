<?php
/**
 * Error Handler Middleware - Global error handling
 */
class ErrorHandler {
    public static function notFoundHandler() {
        $path = $_SERVER['REQUEST_URI'] ?? '';
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        Utils::errorResponse("Route not found: $method $path", 404);
    }

    public static function errorResponse($error, $status = 500) {
        http_response_code($status);
        header('Content-Type: application/json');
        
        $message = $error instanceof Exception ? $error->getMessage() : (string)$error;
        $response = [
            'success' => false,
            'message' => $message
        ];

        // Only include stack trace in development
        if ($_ENV['NODE_ENV'] !== 'production' && $error instanceof Exception) {
            $response['stack'] = $error->getTraceAsString();
            $response['code'] = $error->getCode();
        }

        echo json_encode($response);
        exit;
    }
}
