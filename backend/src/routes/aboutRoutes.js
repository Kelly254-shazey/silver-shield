const express = require("express");
const { query } = require("../config/database");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

let ensureAboutTablePromise = null;

function ensureAboutTable() {
  if (!ensureAboutTablePromise) {
    ensureAboutTablePromise = query(`
      CREATE TABLE IF NOT EXISTS about_content (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL DEFAULT 'About Silver Shield',
        storyContent LONGTEXT NULL,
        mission TEXT NULL,
        vision TEXT NULL,
        heroImage VARCHAR(512) NULL,
        videoUrl VARCHAR(512) NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  }
  return ensureAboutTablePromise;
}

function toAboutPayload(body) {
  return {
    title: String(body.title || "About Silver Shield").trim(),
    storyContent: String(body.storyContent || "").trim(),
    mission: String(body.mission || "").trim(),
    vision: String(body.vision || "").trim(),
    heroImage: String(body.heroImage || "").trim(),
    videoUrl: String(body.videoUrl || "").trim(),
  };
}

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    await ensureAboutTable();
    const rows = await query("SELECT * FROM about_content ORDER BY id ASC LIMIT 1");

    if (!rows[0]) {
      return res.json({
        data: {
          id: null,
          title: "About Silver Shield",
          storyContent: "",
          mission: "",
          vision: "",
          heroImage: "",
          videoUrl: "",
        },
      });
    }

    return res.json({ data: rows[0] });
  }),
);

router.put(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    await ensureAboutTable();
    const payload = toAboutPayload(req.body);
    const existing = await query("SELECT id FROM about_content ORDER BY id ASC LIMIT 1");

    if (existing[0]) {
      await query(
        `
        UPDATE about_content
        SET title = ?, storyContent = ?, mission = ?, vision = ?, heroImage = ?, videoUrl = ?,
            updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
        `,
        [
          payload.title,
          payload.storyContent,
          payload.mission,
          payload.vision,
          payload.heroImage,
          payload.videoUrl,
          existing[0].id,
        ],
      );

      const rows = await query("SELECT * FROM about_content WHERE id = ?", [existing[0].id]);
      return res.json({ data: rows[0] });
    }

    const result = await query(
      `
      INSERT INTO about_content (title, storyContent, mission, vision, heroImage, videoUrl)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        payload.title,
        payload.storyContent,
        payload.mission,
        payload.vision,
        payload.heroImage,
        payload.videoUrl,
      ],
    );
    const rows = await query("SELECT * FROM about_content WHERE id = ?", [result.insertId]);
    return res.status(201).json({ data: rows[0] });
  }),
);

module.exports = router;
