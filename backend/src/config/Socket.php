<?php
/**
 * Socket Configuration - WebSocket setup (polled via HTTP in PHP)
 * Since PHP doesn't have true WebSocket support, we use polling via RealtimeService
 */
class SocketConfig {
    private static $socketPath = '/socket.io/';
    private static $io = null;

    public static function initSocket() {
        // PHP implementation: Use polling mechanism instead of WebSockets
        // Real-time updates are handled via RealtimeService polling
        return self::getInstance();
    }

    public static function getInstance() {
        if (self::$io === null) {
            self::$io = new self();
        }
        return self::$io;
    }

    public static function emit($channel, $event, $data = []) {
        // Store event in database for clients to poll
        RealtimeService::recordEvent($event, array_merge($data, ['channel' => $channel]));
    }

    public static function broadcast($event, $data = []) {
        RealtimeService::recordEvent($event, $data);
    }

    public static function getSocketPath() {
        return self::$socketPath;
    }

    /**
     * Client-side polling endpoint for real-time updates
     * GET /api/realtime/events?channel=donation:123&since=timestamp
     */
    public static function getRecentEvents($channel = null, $since = null) {
        try {
            $sql = "SELECT * FROM realtime_events WHERE 1=1";
            $params = [];

            if ($channel) {
                $sql .= " AND data JSON_CONTAINS(data, JSON_OBJECT('channel', ?))";
                $params[] = $channel;
            }

            if ($since) {
                $sql .= " AND createdAt > FROM_UNIXTIME(?)";
                $params[] = $since;
            }

            $sql .= " ORDER BY createdAt DESC LIMIT 100";
            return Database::query($sql, $params);
        } catch (Exception $e) {
            error_log('Socket config error: ' . $e->getMessage());
            return [];
        }
    }
}
