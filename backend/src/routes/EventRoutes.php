<?php
/**
 * Events Routes
 */
class EventRoutes {
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

        try {
            $sql = "INSERT INTO events (title, slug, description, eventDate, location, programSlug, coverImage, videoUrl, registrationUrl, capacity, registrations, status, createdAt)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
            Database::execute($sql, [
                $input['title'] ?? '',
                Utils::createSlug($input['slug'] ?? $input['title'] ?? ''),
                $input['description'] ?? '',
                $input['eventDate'] ?? '',
                $input['location'] ?? '',
                $input['programSlug'] ?? '',
                $input['coverImage'] ?? '',
                $input['videoUrl'] ?? '',
                $input['registrationUrl'] ?? '',
                $input['capacity'] ?? 100,
                0,
                $input['status'] ?? 'upcoming'
            ]);

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
            Database::execute(
                "UPDATE events SET title = ?, slug = ?, description = ?, eventDate = ?, location = ?, programSlug = ?, coverImage = ?, videoUrl = ?, registrationUrl = ?, status = ?, updatedAt = NOW() WHERE id = ? OR slug = ?",
                [
                    $input['title'] ?? '',
                    Utils::createSlug($input['slug'] ?? $input['title'] ?? $id),
                    $input['description'] ?? '',
                    $input['eventDate'] ?? '',
                    $input['location'] ?? '',
                    $input['programSlug'] ?? '',
                    $input['coverImage'] ?? '',
                    $input['videoUrl'] ?? '',
                    $input['registrationUrl'] ?? '',
                    $input['status'] ?? 'upcoming',
                    $id,
                    $id
                ]
            );
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
            Database::execute("DELETE FROM events WHERE id = ? OR slug = ?", [$id, $id]);
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
