<?php
/**
 * Events Routes
 */
class EventRoutes {
    private static function eventColumns() {
        $columns = Database::query("SHOW COLUMNS FROM events");
        return array_map(function ($column) {
            return $column['Field'];
        }, $columns);
    }

    private static function filterFieldsByColumns($fields, $columns) {
        $filtered = [];
        foreach ($fields as $field => $value) {
            if (in_array($field, $columns, true)) {
                $filtered[$field] = $value;
            }
        }
        return $filtered;
    }

    private static function normalizeEventDate($value) {
        $text = trim((string)$value);
        if ($text === '') {
            return null;
        }
        return str_replace('T', ' ', $text);
    }

    public static function handleList() {
        if (Utils::getRequestMethod() !== 'GET') {
            Utils::errorResponse('Method not allowed', 405);
        }

        try {
            $where = empty($_GET['admin']) ? "WHERE status <> 'draft'" : "";
            $rows = Database::query("SELECT * FROM events $where ORDER BY eventDate DESC");
            Utils::jsonResponse($rows);
        } catch (Exception $e) {
            error_log('Events list error: ' . $e->getMessage());
            Utils::errorResponse('Failed to fetch events', 500);
        }
    }

    public static function handleCreate() {
        if (Utils::getRequestMethod() !== 'POST') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAdmin();
        $input = Utils::getJsonInput();
        $title = trim($input['title'] ?? '');
        $eventDate = trim($input['eventDate'] ?? '');

        if ($title === '' || $eventDate === '') {
            Utils::errorResponse('Title and event date are required.', 400);
        }

        try {
            $columns = self::eventColumns();
            $fields = self::filterFieldsByColumns([
                'title' => $title,
                'slug' => Utils::createSlug($input['slug'] ?? $title),
                'description' => $input['description'] ?? '',
                'eventDate' => self::normalizeEventDate($eventDate),
                'location' => $input['location'] ?? '',
                'programSlug' => $input['programSlug'] ?? '',
                'coverImage' => $input['coverImage'] ?? '',
                'image' => $input['coverImage'] ?? '',
                'videoUrl' => $input['videoUrl'] ?? '',
                'registrationUrl' => $input['registrationUrl'] ?? '',
                'capacity' => (int)($input['capacity'] ?? 100),
                'registrations' => 0,
                'status' => $input['status'] ?? 'upcoming'
            ], $columns);

            if (in_array('createdAt', $columns, true)) {
                $fields['createdAt'] = date('Y-m-d H:i:s');
            }

            $fieldNames = array_keys($fields);
            $placeholders = array_fill(0, count($fieldNames), '?');
            Database::query(
                "INSERT INTO events (" . implode(', ', $fieldNames) . ") VALUES (" . implode(', ', $placeholders) . ")",
                array_values($fields)
            );

            Utils::jsonResponse(['message' => 'Event created successfully'], 201);
        } catch (Exception $e) {
            error_log('Events create error: ' . $e->getMessage());
            Utils::errorResponse('Failed to create event', 500);
        }
    }

    public static function handleUpdate($id) {
        if (Utils::getRequestMethod() !== 'PUT') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAdmin();
        $input = Utils::getJsonInput();

        try {
            $columns = self::eventColumns();
            $fields = self::filterFieldsByColumns([
                'title' => $input['title'] ?? '',
                'slug' => Utils::createSlug($input['slug'] ?? $input['title'] ?? $id),
                'description' => $input['description'] ?? '',
                'eventDate' => self::normalizeEventDate($input['eventDate'] ?? ''),
                'location' => $input['location'] ?? '',
                'programSlug' => $input['programSlug'] ?? '',
                'coverImage' => $input['coverImage'] ?? '',
                'image' => $input['coverImage'] ?? '',
                'videoUrl' => $input['videoUrl'] ?? '',
                'registrationUrl' => $input['registrationUrl'] ?? '',
                'status' => $input['status'] ?? 'upcoming'
            ], $columns);

            if (in_array('updatedAt', $columns, true)) {
                $fields['updatedAt'] = date('Y-m-d H:i:s');
            }

            if (empty($fields)) {
                Utils::errorResponse('Events table has no editable columns.', 500);
            }

            $sets = [];
            $params = [];
            foreach ($fields as $field => $value) {
                $sets[] = "$field = ?";
                $params[] = $value;
            }
            $params[] = $id;

            Database::query("UPDATE events SET " . implode(', ', $sets) . " WHERE id = ?", $params);
            Utils::jsonResponse(['message' => 'Event updated successfully']);
        } catch (Exception $e) {
            error_log('Events update error: ' . $e->getMessage());
            Utils::errorResponse('Failed to update event', 500);
        }
    }

    public static function handleDelete($id) {
        if (Utils::getRequestMethod() !== 'DELETE') {
            Utils::errorResponse('Method not allowed', 405);
        }

        Auth::requireAdmin();

        try {
            $columns = self::eventColumns();
            if (in_array('slug', $columns, true)) {
                Database::query("DELETE FROM events WHERE id = ? OR slug = ?", [$id, $id]);
            } else {
                Database::query("DELETE FROM events WHERE id = ?", [$id]);
            }
            Utils::jsonResponse(['message' => 'Event deleted successfully']);
        } catch (Exception $e) {
            error_log('Events delete error: ' . $e->getMessage());
            Utils::errorResponse('Failed to delete event', 500);
        }
    }

    public static function handleRegister() {
        if (Utils::getRequestMethod() !== 'POST') {
            Utils::errorResponse('Method not allowed', 405);
        }

        $input = Utils::getJsonInput();

        try {
            $sql = "INSERT INTO event_registrations (eventId, attendeeName, email, phone, createdAt) VALUES (?, ?, ?, ?, NOW())";
            Database::query($sql, [
                $input['eventId'] ?? '',
                $input['attendeeName'] ?? '',
                $input['email'] ?? '',
                $input['phone'] ?? ''
            ]);

            Utils::jsonResponse(['message' => 'Registration successful'], 201);
        } catch (Exception $e) {
            error_log('Event register error: ' . $e->getMessage());
            Utils::errorResponse('Failed to register for event', 500);
        }
    }
}
