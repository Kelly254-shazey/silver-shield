const express = require("express");
const { query } = require("../config/database");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const rows = await query("SELECT * FROM partners ORDER BY orderIndex ASC, id ASC");
    return res.json({ data: rows });
  }),
);

router.post(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { name, logoUrl, websiteUrl, orderIndex } = req.body;
    if (!name || !logoUrl) {
      return res.status(400).json({ message: "Name and logoUrl are required." });
    }

    const result = await query(
      "INSERT INTO partners (name, logoUrl, websiteUrl, orderIndex) VALUES (?, ?, ?, ?)",
      [
        String(name || "").trim(),
        String(logoUrl || "").trim(),
        String(websiteUrl || "").trim(),
        Number(orderIndex || 0),
      ],
    );

    const rows = await query("SELECT * FROM partners WHERE id = ?", [result.insertId]);
    return res.status(201).json({ data: rows[0] });
  }),
);

router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { name, logoUrl, websiteUrl, orderIndex } = req.body;
    await query(
      `
      UPDATE partners
      SET name = ?, logoUrl = ?, websiteUrl = ?, orderIndex = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [
        String(name || "").trim(),
        String(logoUrl || "").trim(),
        String(websiteUrl || "").trim(),
        Number(orderIndex || 0),
        req.params.id,
      ],
    );

    const rows = await query("SELECT * FROM partners WHERE id = ?", [req.params.id]);
    if (!rows[0]) {
      return res.status(404).json({ message: "Partner not found." });
    }
    return res.json({ data: rows[0] });
  }),
);

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const result = await query("DELETE FROM partners WHERE id = ?", [req.params.id]);
    if (!result.affectedRows) {
      return res.status(404).json({ message: "Partner not found." });
    }
    return res.json({ message: "Partner deleted." });
  }),
);

module.exports = router;
