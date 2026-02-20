const express = require("express");
const { query } = require("../config/database");
const asyncHandler = require("../utils/asyncHandler");
const { createSlug } = require("../utils/slug");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

let ensureStoriesSetupPromise = null;

function ensureStoriesSetup() {
  if (!ensureStoriesSetupPromise) {
    ensureStoriesSetupPromise = (async () => {
      await query(`
        CREATE TABLE IF NOT EXISTS stories (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(160) NOT NULL,
          excerpt TEXT NOT NULL,
          content LONGTEXT NULL,
          coverImage VARCHAR(512) NULL,
          category VARCHAR(120) NULL,
          programSlug VARCHAR(160) NULL,
          author VARCHAR(160) NULL,
          tags LONGTEXT NULL,
          status VARCHAR(32) NOT NULL DEFAULT 'published',
          publishedAt DATETIME NULL,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY uq_story_slug (slug)
        )
      `);

      const programSlugColumn = await query(
        "SHOW COLUMNS FROM stories LIKE 'programSlug'",
      );
      if (!programSlugColumn[0]) {
        await query("ALTER TABLE stories ADD COLUMN programSlug VARCHAR(160) NULL AFTER category");
      }
    })().catch((error) => {
      ensureStoriesSetupPromise = null;
      throw error;
    });
  }

  return ensureStoriesSetupPromise;
}

function toStoryPayload(body) {
  const {
    title,
    excerpt,
    content,
    coverImage,
    category,
    programSlug,
    author = "Silver Shield Team",
    tags = [],
    status = "published",
  } = body;

  const rawProgramSlug = String(programSlug || "").trim();

  return {
    title: String(title || "").trim(),
    slug: createSlug(title),
    excerpt: String(excerpt || "").trim(),
    content: String(content || "").trim(),
    coverImage: String(coverImage || "").trim(),
    category: String(category || "").trim(),
    programSlug: rawProgramSlug ? createSlug(rawProgramSlug) : "",
    author: String(author || "Silver Shield Team").trim(),
    tags: JSON.stringify(
      Array.isArray(tags)
        ? tags
        : String(tags || "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
    ),
    status: String(status || "published").toLowerCase(),
  };
}

function parseJsonField(value, fallback) {
  if (value == null) {
    return fallback;
  }
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return value;
}

function mapStory(row) {
  return {
    ...row,
    tags: parseJsonField(row.tags, []),
  };
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    await ensureStoriesSetup();
    const filters = [];
    const params = [];

    if (req.query.category) {
      filters.push("category = ?");
      params.push(req.query.category);
    }

    if (req.query.programSlug) {
      filters.push("programSlug = ?");
      params.push(createSlug(String(req.query.programSlug)));
    }

    if (req.query.status) {
      filters.push("status = ?");
      params.push(req.query.status);
    } else if (req.query.admin !== "true") {
      filters.push("status = 'published'");
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const rows = await query(
      `SELECT * FROM stories ${where} ORDER BY publishedAt DESC, createdAt DESC`,
      params,
    );
    return res.json({ data: rows.map(mapStory) });
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    await ensureStoriesSetup();
    const idOrSlug = req.params.id;
    const numericId = Number(idOrSlug);
    const rows = await query(
      `
      SELECT *
      FROM stories
      WHERE id = ? OR slug = ?
      LIMIT 1
      `,
      [Number.isNaN(numericId) ? 0 : numericId, idOrSlug],
    );

    if (!rows[0]) {
      return res.status(404).json({ message: "Story not found." });
    }

    return res.json({ data: mapStory(rows[0]) });
  }),
);

router.post(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    await ensureStoriesSetup();
    const payload = toStoryPayload(req.body);
    if (!payload.title || !payload.excerpt) {
      return res.status(400).json({ message: "Title and excerpt are required." });
    }

    const result = await query(
      `
      INSERT INTO stories (
        title, slug, excerpt, content, coverImage, category, programSlug, author, tags, status, publishedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `,
      [
        payload.title,
        payload.slug,
        payload.excerpt,
        payload.content,
        payload.coverImage,
        payload.category,
        payload.programSlug,
        payload.author,
        payload.tags,
        payload.status,
      ],
    );

    const rows = await query("SELECT * FROM stories WHERE id = ?", [result.insertId]);
    return res.status(201).json({ data: mapStory(rows[0]) });
  }),
);

router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    await ensureStoriesSetup();
    const payload = toStoryPayload(req.body);
    await query(
      `
      UPDATE stories
      SET title = ?, slug = ?, excerpt = ?, content = ?, coverImage = ?, category = ?,
          programSlug = ?, author = ?, tags = ?, status = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [
        payload.title,
        payload.slug,
        payload.excerpt,
        payload.content,
        payload.coverImage,
        payload.category,
        payload.programSlug,
        payload.author,
        payload.tags,
        payload.status,
        req.params.id,
      ],
    );

    const rows = await query("SELECT * FROM stories WHERE id = ?", [req.params.id]);
    if (!rows[0]) {
      return res.status(404).json({ message: "Story not found." });
    }

    return res.json({ data: mapStory(rows[0]) });
  }),
);

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    await ensureStoriesSetup();
    const result = await query("DELETE FROM stories WHERE id = ?", [req.params.id]);
    if (!result.affectedRows) {
      return res.status(404).json({ message: "Story not found." });
    }

    return res.json({ message: "Story deleted." });
  }),
);

module.exports = router;

