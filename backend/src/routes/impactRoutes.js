const express = require("express");
const { query } = require("../config/database");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    const rows = await query(
      "SELECT * FROM impact_stats ORDER BY updatedAt DESC, id DESC",
    );
    return res.json({ data: rows });
  }),
);

router.post(
  "/stats",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { metricKey, label, value, unit, trend, icon, reportUrl } = req.body;
    if (!label) {
      return res.status(400).json({ message: "Label is required." });
    }

    const result = await query(
      `
      INSERT INTO impact_stats (metricKey, label, value, unit, trend, icon, reportUrl)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        String(metricKey || "").trim(),
        String(label || "").trim(),
        Number(value || 0),
        String(unit || "").trim(),
        Number(trend || 0),
        String(icon || "").trim(),
        String(reportUrl || "").trim(),
      ],
    );

    const rows = await query("SELECT * FROM impact_stats WHERE id = ?", [result.insertId]);
    return res.status(201).json({ data: rows[0] });
  }),
);

router.put(
  "/stats/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { metricKey, label, value, unit, trend, icon, reportUrl } = req.body;
    await query(
      `
      UPDATE impact_stats
      SET metricKey = ?, label = ?, value = ?, unit = ?, trend = ?, icon = ?, reportUrl = ?,
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [
        String(metricKey || "").trim(),
        String(label || "").trim(),
        Number(value || 0),
        String(unit || "").trim(),
        Number(trend || 0),
        String(icon || "").trim(),
        String(reportUrl || "").trim(),
        req.params.id,
      ],
    );

    const rows = await query("SELECT * FROM impact_stats WHERE id = ?", [req.params.id]);
    if (!rows[0]) {
      return res.status(404).json({ message: "Impact metric not found." });
    }
    return res.json({ data: rows[0] });
  }),
);

router.delete(
  "/stats/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const result = await query("DELETE FROM impact_stats WHERE id = ?", [
      req.params.id,
    ]);
    if (!result.affectedRows) {
      return res.status(404).json({ message: "Impact metric not found." });
    }
    return res.json({ message: "Impact metric deleted." });
  }),
);

module.exports = router;
