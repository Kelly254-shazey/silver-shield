const express = require("express");
const { query } = require("../config/database");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { reindexDocument } = require("../services/aiService");

const router = express.Router();

router.get(
  "/public",
  asyncHandler(async (req, res) => {
    const filters = ["isPublished = 1"];
    const params = [];

    if (req.query.category) {
      filters.push("LOWER(category) = ?");
      params.push(String(req.query.category).trim().toLowerCase());
    }

    const limitValue = Number.parseInt(String(req.query.limit || "10"), 10);
    const limit = Number.isNaN(limitValue) ? 10 : Math.min(50, Math.max(1, limitValue));
    params.push(limit);

    const rows = await query(
      `
      SELECT id, title, category, content, createdAt, updatedAt
      FROM docs
      WHERE ${filters.join(" AND ")}
      ORDER BY updatedAt DESC, createdAt DESC
      LIMIT ?
      `,
      params,
    );

    return res.json({ data: rows });
  }),
);

router.get(
  "/public/:id/download",
  asyncHandler(async (req, res) => {
    const rows = await query(
      `
      SELECT id, title, content, updatedAt
      FROM docs
      WHERE id = ? AND isPublished = 1
      LIMIT 1
      `,
      [req.params.id],
    );

    const doc = rows[0];
    if (!doc) {
      return res.status(404).json({ message: "Document not found." });
    }

    const safeTitle = String(doc.title || "newsletter")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const printableDate = doc.updatedAt
      ? new Date(doc.updatedAt).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeTitle || "newsletter"}-${printableDate}.txt"`,
    );

    return res.send(
      `${doc.title}\n\n${String(doc.content || "").trim()}\n\nUpdated: ${printableDate}`,
    );
  }),
);

router.get(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const rows = await query(
      `
      SELECT
        d.*,
        (SELECT COUNT(*) FROM doc_chunks dc WHERE dc.docId = d.id) AS chunksCount
      FROM docs d
      ORDER BY d.updatedAt DESC
      `,
    );
    return res.json({ data: rows });
  }),
);

router.get(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const rows = await query("SELECT * FROM docs WHERE id = ? LIMIT 1", [req.params.id]);
    if (!rows[0]) {
      return res.status(404).json({ message: "Document not found." });
    }
    return res.json({ data: rows[0] });
  }),
);

router.post(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { title, category, content, isPublished = true } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "title and content are required." });
    }

    const result = await query(
      "INSERT INTO docs (title, category, content, isPublished) VALUES (?, ?, ?, ?)",
      [
        String(title).trim(),
        String(category || "general").trim(),
        String(content).trim(),
        isPublished ? 1 : 0,
      ],
    );

    const docId = result.insertId;
    const indexing = await reindexDocument(docId, content);
    const rows = await query("SELECT * FROM docs WHERE id = ?", [docId]);

    return res.status(201).json({
      data: rows[0],
      indexing,
    });
  }),
);

router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { title, category, content, isPublished = true } = req.body;
    await query(
      `
      UPDATE docs
      SET title = ?, category = ?, content = ?, isPublished = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [
        String(title).trim(),
        String(category || "general").trim(),
        String(content || "").trim(),
        isPublished ? 1 : 0,
        req.params.id,
      ],
    );

    const rows = await query("SELECT * FROM docs WHERE id = ?", [req.params.id]);
    if (!rows[0]) {
      return res.status(404).json({ message: "Document not found." });
    }

    const indexing = await reindexDocument(req.params.id, rows[0].content);
    return res.json({
      data: rows[0],
      indexing,
    });
  }),
);

router.post(
  "/:id/reindex",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const rows = await query("SELECT content FROM docs WHERE id = ? LIMIT 1", [req.params.id]);
    if (!rows[0]) {
      return res.status(404).json({ message: "Document not found." });
    }

    const indexing = await reindexDocument(req.params.id, rows[0].content);
    return res.json({
      message: "Document indexed successfully.",
      indexing,
    });
  }),
);

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    await query("DELETE FROM doc_chunks WHERE docId = ?", [req.params.id]);
    const result = await query("DELETE FROM docs WHERE id = ?", [req.params.id]);
    if (!result.affectedRows) {
      return res.status(404).json({ message: "Document not found." });
    }
    return res.json({ message: "Document deleted." });
  }),
);

module.exports = router;
