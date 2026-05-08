<?php
/**
 * Realtime Service - Store and manage realtime events
 */
class RealtimeService {
    public static function recordEvent($eventType, $data = []) {
        try {
            $sql = "
                INSERT INTO realtime_events (eventType, data, createdAt) 
                VALUES (?, ?, NOW())
            ";
            Database::query($sql, [$eventType, json_encode($data)]);
            return true;
        } catch (Exception $e) {
            error_log('RealtimeService error: ' . $e->getMessage());
            return false;
        }
    }

    public static function getRecentEvents($limit = 50) {
        try {
            $sql = "
                SELECT * FROM realtime_events 
                ORDER BY createdAt DESC 
                LIMIT ?
            ";
            return Database::query($sql, [$limit]);
        } catch (Exception $e) {
            error_log('RealtimeService error: ' . $e->getMessage());
            return [];
        }
    }

    public static function cleanOldEvents($daysOld = 30) {
        try {
            $sql = "DELETE FROM realtime_events WHERE createdAt < DATE_SUB(NOW(), INTERVAL ? DAY)";
            Database::query($sql, [$daysOld]);
            return true;
        } catch (Exception $e) {
            error_log('RealtimeService error: ' . $e->getMessage());
            return false;
        }
    }
}
