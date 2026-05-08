<?php
/**
 * AI Routes - Documentation-backed assistant
 */
class AIRoutes {
    public static function handleChat() {
        if (Utils::getRequestMethod() !== 'POST') {
            Utils::errorResponse('Method not allowed', 405);
        }

        if (!RateLimiter::checkAILimit()) {
            Utils::errorResponse('AI request limit exceeded', 429);
        }

        $input = Utils::getJsonInput();
        $question = trim($input['question'] ?? $input['prompt'] ?? '');

        if (strlen($question) < 3) {
            Utils::errorResponse('A valid question is required.', 400);
        }

        Utils::jsonResponse(AIService::answerFromDocumentation($question));
    }

    public static function handleQuery() {
        self::handleChat();
    }
}
