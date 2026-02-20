const express = require("express");
const { query } = require("../config/database");
const asyncHandler = require("../utils/asyncHandler");
const { createSlug } = require("../utils/slug");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

let ensureEventsTablePromise = null;

function ensureEventsTable() {
  if (!ensureEventsTablePromise) {
    ensureEventsTablePromise = (async () => {
      await query(`
        CREATE TABLE IF NOT EXISTS events (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT NULL,
          eventDate DATETIME NULL,
          location VARCHAR(255) NULL,
          programSlug VARCHAR(160) NULL,
          coverImage VARCHAR(512) NULL,
          videoUrl VARCHAR(512) NULL,
          registrationUrl VARCHAR(512) NULL,
          status VARCHAR(32) NOT NULL DEFAULT 'upcoming',
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      const programSlugColumn = await query(
        "SHOW COLUMNS FROM events LIKE 'programSlug'",
      );
      if (!programSlugColumn[0]) {
        await query("ALTER TABLE events ADD COLUMN programSlug VARCHAR(160) NULL AFTER location");
      }

      // Seed initial events if table is empty
      const existingEvents = await query("SELECT COUNT(*) as count FROM events");
      if (existingEvents[0].count === 0) {
        const futureDate1 = new Date();
        futureDate1.setDate(futureDate1.getDate() + 7);
        const futureDate2 = new Date();
        futureDate2.setDate(futureDate2.getDate() + 14);
        const futureDate3 = new Date();
        futureDate3.setDate(futureDate3.getDate() + 21);

        await query(
          `INSERT INTO events (
            title, description, eventDate, location, status, coverImage
          ) VALUES
          (?, ?, ?, ?, 'upcoming', ?),
          (?, ?, ?, ?, 'upcoming', ?),
          (?, ?, ?, ?, 'upcoming', ?)`,
          [
            "Women in Enterprise Bootcamp",
            "Hands-on training for women-led businesses, financial literacy, and networking.",
            futureDate1.toISOString().slice(0, 19).replace("T", " "),
            "Nairobi",
            "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80",

            "Youth Innovation and Career Clinic",
            "Career coaching, CV labs, and innovation showcases for youth participants.",
            futureDate2.toISOString().slice(0, 19).replace("T", " "),
            "Nakuru",
            "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=80",

            "Community Outreach Health and Legal Camp",
            "Integrated clinic support with referrals for health, legal, and social protection.",
            futureDate3.toISOString().slice(0, 19).replace("T", " "),
            "Mombasa",
            "https://images.unsplash.com/photo-1576765608866-5b51046452be?auto=format&fit=crop&w=1400&q=80",
          ],
        );
      }
    })().catch((error) => {
      ensureEventsTablePromise = null;
      throw error;
    });
  }
  return ensureEventsTablePromise;
}

function toEventPayload(body) {
  const rawDate = String(body.eventDate || "").trim();
  const parsedDate = rawDate ? new Date(rawDate) : null;
  const eventDate =
    parsedDate && !Number.isNaN(parsedDate.getTime())
      ? parsedDate.toISOString().slice(0, 19).replace("T", " ")
      : null;

  const slugInput = String(body.programSlug || "").trim();

  return {
    title: String(body.title || "").trim(),
    description: String(body.description || "").trim(),
    eventDate,
    location: String(body.location || "").trim(),
    programSlug: slugInput ? createSlug(slugInput) : "",
    coverImage: String(body.coverImage || "").trim(),
    videoUrl: String(body.videoUrl || "").trim(),
    registrationUrl: String(body.registrationUrl || "").trim(),
    status: String(body.status || "upcoming").toLowerCase(),
  };
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    await ensureEventsTable();
    const filters = [];
    const params = [];

    if (req.query.status) {
      filters.push("status = ?");
      params.push(String(req.query.status).toLowerCase());
    } else if (req.query.admin !== "true") {
      filters.push("status <> 'draft'");
    }

    if (req.query.programSlug) {
      filters.push("programSlug = ?");
      params.push(createSlug(String(req.query.programSlug)));
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const rows = await query(
      `SELECT * FROM events ${where} ORDER BY eventDate ASC, createdAt DESC`,
      params,
    );
    return res.json({ data: rows });
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    await ensureEventsTable();
    const rows = await query("SELECT * FROM events WHERE id = ? LIMIT 1", [req.params.id]);
    if (!rows[0]) {
      return res.status(404).json({ message: "Event not found." });
    }
    return res.json({ data: rows[0] });
  }),
);

router.post(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    await ensureEventsTable();
    const payload = toEventPayload(req.body);

    if (!payload.title) {
      return res.status(400).json({ message: "Title is required." });
    }

    const result = await query(
      `
      INSERT INTO events
      (title, description, eventDate, location, programSlug, coverImage, videoUrl, registrationUrl, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        payload.title,
        payload.description,
        payload.eventDate,
        payload.location,
        payload.programSlug,
        payload.coverImage,
        payload.videoUrl,
        payload.registrationUrl,
        payload.status,
      ],
    );

    const rows = await query("SELECT * FROM events WHERE id = ?", [result.insertId]);
    return res.status(201).json({ data: rows[0] });
  }),
);

router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    await ensureEventsTable();
    const payload = toEventPayload(req.body);

    await query(
      `
      UPDATE events
      SET title = ?, description = ?, eventDate = ?, location = ?, programSlug = ?, coverImage = ?,
          videoUrl = ?, registrationUrl = ?, status = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [
        payload.title,
        payload.description,
        payload.eventDate,
        payload.location,
        payload.programSlug,
        payload.coverImage,
        payload.videoUrl,
        payload.registrationUrl,
        payload.status,
        req.params.id,
      ],
    );

    const rows = await query("SELECT * FROM events WHERE id = ?", [req.params.id]);
    if (!rows[0]) {
      return res.status(404).json({ message: "Event not found." });
    }
    return res.json({ data: rows[0] });
  }),
);

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    await ensureEventsTable();
    const result = await query("DELETE FROM events WHERE id = ?", [req.params.id]);
    if (!result.affectedRows) {
      return res.status(404).json({ message: "Event not found." });
    }
    return res.json({ message: "Event deleted." });
  }),
);

module.exports = router;

