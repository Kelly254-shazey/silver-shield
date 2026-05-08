<?php
/**
 * AI Service - Documentation-based QA system
 */
class AIService {
    private static $fallbackAnswer = "I don't have that information in Silver Shield's documentation yet. Please contact us or ask an admin to update the docs.";

    public static function tokenize($text) {
        $text = strtolower(trim($text));
        $text = preg_replace('/[^a-z0-9\s]/', ' ', $text);
        $words = preg_split('/\s+/', $text, -1, PREG_SPLIT_NO_EMPTY);
        return array_filter($words, function($word) { return strlen($word) > 2; });
    }

    public static function calcScore($questionWords, $chunkText) {
        $chunkWords = self::tokenize($chunkText);
        if (empty($chunkWords)) {
            return 0;
        }

        $chunkSet = array_flip($chunkWords);
        $matchCount = 0;
        foreach ($questionWords as $word) {
            if (isset($chunkSet[$word])) {
                $matchCount++;
            }
        }

        $overlap = $matchCount / max(1, count($questionWords));
        $density = $matchCount / max(1, count($chunkWords));
        return $overlap * 0.8 + $density * 0.2;
    }

    public static function retrieveRelevantChunks($question, $limit = 5) {
        try {
            $chunks = Database::query(
                "SELECT dc.id, dc.docId, dc.chunkText, d.title AS docTitle, d.category AS docCategory
                 FROM doc_chunks dc
                 INNER JOIN docs d ON d.id = dc.docId
                 WHERE d.isPublished = 1"
            );

            $questionWords = self::tokenize($question);
            $scored = [];

            foreach ($chunks as $chunk) {
                $score = self::calcScore($questionWords, $chunk['chunkText']);
                if ($score > 0.06) {
                    $chunk['score'] = $score;
                    $scored[] = $chunk;
                }
            }

            usort($scored, function($a, $b) { return $b['score'] - $a['score']; });
            return array_slice($scored, 0, $limit);
        } catch (Exception $e) {
            error_log('AIService chunk retrieval error: ' . $e->getMessage());
            return [];
        }
    }

    public static function extractSupportSentences($question, $chunks) {
        $qWords = self::tokenize($question);
        $sentencePool = [];

        foreach ($chunks as $chunk) {
            $sentences = preg_split('/(?<=[.!?])\s+/', $chunk['chunkText']);
            foreach ($sentences as $sentence) {
                $sentence = trim($sentence);
                if (!empty($sentence)) {
                    $score = self::calcScore($qWords, $sentence);
                    if ($score > 0) {
                        $sentencePool[] = ['sentence' => $sentence, 'score' => $score];
                    }
                }
            }
        }

        usort($sentencePool, function($a, $b) { return $b['score'] - $a['score']; });

        $picked = [];
        foreach ($sentencePool as $candidate) {
            if (!in_array($candidate['sentence'], $picked)) {
                $picked[] = $candidate['sentence'];
            }
            if (count($picked) >= 4) break;
        }

        return $picked;
    }

    public static function answerFromDocumentation($question) {
        try {
            $chunks = self::retrieveRelevantChunks($question, 5);
            
            if (empty($chunks)) {
                return [
                    'answer' => self::$fallbackAnswer,
                    'sources' => [],
                    'grounded' => false
                ];
            }

            $supportingSentences = self::extractSupportSentences($question, $chunks);
            $answer = !empty($supportingSentences) 
                ? implode(' ', $supportingSentences)
                : $chunks[0]['chunkText'];

            $sources = [];
            foreach ($chunks as $chunk) {
                if (!in_array($chunk['docTitle'], $sources)) {
                    $sources[] = $chunk['docTitle'];
                }
            }

            return [
                'answer' => $answer ?: self::$fallbackAnswer,
                'sources' => $sources,
                'grounded' => !empty($answer)
            ];
        } catch (Exception $e) {
            error_log('AIService error: ' . $e->getMessage());
            return [
                'answer' => self::$fallbackAnswer,
                'sources' => [],
                'grounded' => false
            ];
        }
    }

    public static function reindexDocument($docId, $content) {
        try {
            Database::query("DELETE FROM doc_chunks WHERE docId = ?", [$docId]);
            
            $chunks = self::splitIntoChunks($content);
            $index = 0;
            foreach ($chunks as $chunkText) {
                $index++;
                Database::query(
                    "INSERT INTO doc_chunks (docId, chunkText, chunkIndex, tokenCount) 
                     VALUES (?, ?, ?, ?)",
                    [$docId, $chunkText, $index, count(self::tokenize($chunkText))]
                );
            }

            return ['success' => true, 'chunksCount' => count($chunks)];
        } catch (Exception $e) {
            error_log('AIService reindex error: ' . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    private static function splitIntoChunks($text, $chunkSize = 1000, $overlap = 200) {
        $chunks = [];
        $length = strlen($text);
        
        for ($i = 0; $i < $length; $i += ($chunkSize - $overlap)) {
            $chunk = substr($text, $i, $chunkSize);
            if (!empty(trim($chunk))) {
                $chunks[] = $chunk;
            }
        }
        
        return $chunks;
    }
}
