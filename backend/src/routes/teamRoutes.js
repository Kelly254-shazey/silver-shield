const express = require("express");
const { query } = require("../config/database");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

function serializeTeamMember(row) {
  return {
    ...row,
    linkedinUrl: row.linkedinUrl || "",
  };
}

function serializeBoardMember(row) {
  return {
    ...row,
    linkedinUrl: row.linkedinUrl || "",
  };
}

/* ============================================================================
   TEAM MEMBERS ENDPOINTS
   ============================================================================ */

router.get(
  "/members",
  asyncHandler(async (req, res) => {
    const rows = await query(
      `SELECT * FROM team_members WHERE status = 'active' ORDER BY orderIndex ASC, createdAt ASC`,
    );
    return res.json({ data: rows.map(serializeTeamMember) });
  }),
);

router.get(
  "/members/admin",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const rows = await query(
      `SELECT * FROM team_members ORDER BY status ASC, orderIndex ASC, createdAt ASC`,
    );
    return res.json({ data: rows.map(serializeTeamMember) });
  }),
);

router.get(
  "/members/:id",
  asyncHandler(async (req, res) => {
    const rows = await query(
      "SELECT * FROM team_members WHERE id = ? LIMIT 1",
      [req.params.id],
    );
    if (!rows[0]) {
      return res.status(404).json({ message: "Team member not found." });
    }
    return res.json({ data: serializeTeamMember(rows[0]) });
  }),
);

router.post(
  "/members",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const {
      name = "",
      role = "",
      email = "",
      phone = "",
      bio = "",
      profileImage = "",
      department = "general",
      linkedinUrl = "",
      orderIndex = 0,
    } = req.body;

    if (!name || !role || !email || !profileImage) {
      return res.status(400).json({
        message: "Name, role, email, and profileImage are required.",
      });
    }

    const result = await query(
      `
      INSERT INTO team_members (
        name, role, email, phone, bio, profileImage, department, linkedinUrl, orderIndex
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [name, role, email, phone, bio, profileImage, department, linkedinUrl, orderIndex],
    );

    const rows = await query(
      "SELECT * FROM team_members WHERE id = ? LIMIT 1",
      [result.insertId],
    );

    return res.status(201).json({ data: serializeTeamMember(rows[0]) });
  }),
);

router.put(
  "/members/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const {
      name = "",
      role = "",
      email = "",
      phone = "",
      bio = "",
      profileImage = "",
      department = "general",
      linkedinUrl = "",
      orderIndex = 0,
      status = "active",
    } = req.body;

    if (!name || !role || !email || !profileImage) {
      return res.status(400).json({
        message: "Name, role, email, and profileImage are required.",
      });
    }

    await query(
      `
      UPDATE team_members
      SET name = ?, role = ?, email = ?, phone = ?, bio = ?, profileImage = ?,
          department = ?, linkedinUrl = ?, orderIndex = ?, status = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [
        name,
        role,
        email,
        phone,
        bio,
        profileImage,
        department,
        linkedinUrl,
        orderIndex,
        status,
        req.params.id,
      ],
    );

    const rows = await query(
      "SELECT * FROM team_members WHERE id = ? LIMIT 1",
      [req.params.id],
    );

    if (!rows[0]) {
      return res.status(404).json({ message: "Team member not found." });
    }

    return res.json({ data: serializeTeamMember(rows[0]) });
  }),
);

router.delete(
  "/members/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    await query("DELETE FROM team_members WHERE id = ?", [req.params.id]);
    return res.json({ message: "Team member deleted successfully." });
  }),
);

/* ============================================================================
   BOARD MEMBERS ENDPOINTS
   ============================================================================ */

router.get(
  "/board",
  asyncHandler(async (req, res) => {
    const rows = await query(
      `SELECT * FROM board_members WHERE status = 'active' ORDER BY orderIndex ASC, createdAt ASC`,
    );
    return res.json({ data: rows.map(serializeBoardMember) });
  }),
);

router.get(
  "/board/admin",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const rows = await query(
      `SELECT * FROM board_members ORDER BY status ASC, orderIndex ASC, createdAt ASC`,
    );
    return res.json({ data: rows.map(serializeBoardMember) });
  }),
);

router.get(
  "/board/:id",
  asyncHandler(async (req, res) => {
    const rows = await query(
      "SELECT * FROM board_members WHERE id = ? LIMIT 1",
      [req.params.id],
    );
    if (!rows[0]) {
      return res.status(404).json({ message: "Board member not found." });
    }
    return res.json({ data: serializeBoardMember(rows[0]) });
  }),
);

router.post(
  "/board",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const {
      name = "",
      role = "",
      credentials = "",
      profileImage = "",
      linkedinUrl = "",
      orderIndex = 0,
    } = req.body;

    if (!name || !role || !credentials || !profileImage) {
      return res.status(400).json({
        message: "Name, role, credentials, and profileImage are required.",
      });
    }

    const result = await query(
      `
      INSERT INTO board_members (name, role, credentials, profileImage, linkedinUrl, orderIndex)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [name, role, credentials, profileImage, linkedinUrl, orderIndex],
    );

    const rows = await query(
      "SELECT * FROM board_members WHERE id = ? LIMIT 1",
      [result.insertId],
    );

    return res.status(201).json({ data: serializeBoardMember(rows[0]) });
  }),
);

router.put(
  "/board/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const {
      name = "",
      role = "",
      credentials = "",
      profileImage = "",
      linkedinUrl = "",
      orderIndex = 0,
      status = "active",
    } = req.body;

    if (!name || !role || !credentials || !profileImage) {
      return res.status(400).json({
        message: "Name, role, credentials, and profileImage are required.",
      });
    }

    await query(
      `
      UPDATE board_members
      SET name = ?, role = ?, credentials = ?, profileImage = ?,
          linkedinUrl = ?, orderIndex = ?, status = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [name, role, credentials, profileImage, linkedinUrl, orderIndex, status, req.params.id],
    );

    const rows = await query(
      "SELECT * FROM board_members WHERE id = ? LIMIT 1",
      [req.params.id],
    );

    if (!rows[0]) {
      return res.status(404).json({ message: "Board member not found." });
    }

    return res.json({ data: serializeBoardMember(rows[0]) });
  }),
);

router.delete(
  "/board/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    await query("DELETE FROM board_members WHERE id = ?", [req.params.id]);
    return res.json({ message: "Board member deleted successfully." });
  }),
);

module.exports = router;
