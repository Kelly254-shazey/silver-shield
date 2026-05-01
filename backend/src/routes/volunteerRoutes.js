const express = require("express");
const { query } = require("../config/database");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const {
      fullName,
      email,
      phone,
      location,
      skills,
      interests,
      availability,
      message,
    } = req.body;

    if (!fullName || !email || !phone) {
      return res.status(400).json({
        message: "Full name, email, and phone are required.",
      });
    }

    try {
      const result = await query(
        `
        INSERT INTO volunteers (
          fullName, email, phone, location, skills, interests, availability, message, status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
        `,
        [
          fullName,
          email,
          phone,
          location || null,
          skills || null,
          interests || null,
          availability || null,
          message || null,
        ]
      );

      return res.status(201).json({
        id: result.insertId,
        message: "Volunteer application submitted successfully.",
        data: {
          id: result.insertId,
          fullName,
          email,
          phone,
          status: "PENDING",
        },
      });
    } catch (error) {
      console.error("Volunteer signup error:", error);
      throw error;
    }
  })
);

router.get(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const filters = [];
    const params = [];

    if (req.query.status) {
      filters.push("status = ?");
      params.push(req.query.status);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const rows = await query(
      `SELECT * FROM volunteers ${where} ORDER BY createdAt DESC`,
      params
    );

    return res.json({ data: rows });
  })
);

router.get(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const rows = await query(
      "SELECT * FROM volunteers WHERE id = ? LIMIT 1",
      [req.params.id]
    );

    if (!rows[0]) {
      return res.status(404).json({ message: "Volunteer not found." });
    }

    return res.json({ data: rows[0] });
  })
);

router.patch(
  "/:id/status",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { status } = req.body;

    if (!status || !["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    await query(
      "UPDATE volunteers SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
      [status, req.params.id]
    );

    const rows = await query(
      "SELECT * FROM volunteers WHERE id = ? LIMIT 1",
      [req.params.id]
    );

    return res.json({ data: rows[0] });
  })
);

module.exports = router;
