const express = require("express");
const { query } = require("../config/database");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

let ensureTeamSetupPromise = null;

async function ensureTeamSetup() {
  if (!ensureTeamSetupPromise) {
    ensureTeamSetupPromise = (async () => {
      // Create team_members table
      await query(`
        CREATE TABLE IF NOT EXISTS team_members (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          role VARCHAR(120) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          phone VARCHAR(20) NULL,
          bio TEXT NULL,
          profileImage VARCHAR(512) NOT NULL,
          department VARCHAR(120) NOT NULL DEFAULT 'general',
          linkedinUrl VARCHAR(512) NULL,
          orderIndex INT NOT NULL DEFAULT 0,
          status VARCHAR(32) NOT NULL DEFAULT 'active',
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_status (status),
          INDEX idx_orderIndex (orderIndex)
        )
      `);

      // Create board_members table
      await query(`
        CREATE TABLE IF NOT EXISTS board_members (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          role VARCHAR(120) NOT NULL,
          credentials TEXT NOT NULL,
          profileImage VARCHAR(512) NOT NULL,
          linkedinUrl VARCHAR(512) NULL,
          orderIndex INT NOT NULL DEFAULT 0,
          status VARCHAR(32) NOT NULL DEFAULT 'active',
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_status (status),
          INDEX idx_orderIndex (orderIndex)
        )
      `);

      // Seed team members if table is empty
      const teamCount = await query("SELECT COUNT(*) as count FROM team_members");
      if (teamCount[0].count === 0) {
        await query(
          `INSERT INTO team_members (
            name, role, email, bio, profileImage, department, orderIndex
          ) VALUES
          (?, ?, ?, ?, ?, ?, ?),
          (?, ?, ?, ?, ?, ?, ?),
          (?, ?, ?, ?, ?, ?, ?),
          (?, ?, ?, ?, ?, ?, ?)`,
          [
            "Jane Mwangi",
            "Executive Director",
            "jane.mwangi@silvershield.org",
            "Visionary leader with 15+ years of social impact experience. Jane drives strategic initiatives across all programs.",
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
            "leadership",
            1,

            "David Kipchoge",
            "Programs Director",
            "david.kipchoge@silvershield.org",
            "Passionate about youth empowerment and community development. David oversees all program delivery and impact measurement.",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
            "programs",
            2,

            "Sarah Okonkwo",
            "Finance & Operations Manager",
            "sarah.okonkwo@silvershield.org",
            "Ensures transparent and accountable stewardship of all resources. Sarah manages financial reporting and compliance.",
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
            "operations",
            3,

            "Peter Kamau",
            "Community Partnerships Lead",
            "peter.kamau@silvershield.org",
            "Builds and strengthens relationships with local communities and partner organizations. Peter ensures grassroots alignment.",
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
            "partnerships",
            4,
          ],
        );
      }

      // Seed board members if table is empty
      const boardCount = await query("SELECT COUNT(*) as count FROM board_members");
      if (boardCount[0].count === 0) {
        await query(
          `INSERT INTO board_members (
            name, role, credentials, profileImage, orderIndex
          ) VALUES
          (?, ?, ?, ?, ?),
          (?, ?, ?, ?, ?),
          (?, ?, ?, ?, ?)`,
          [
            "Dr. Elizabeth Muthoni",
            "Board Chair",
            "PhD in Development Studies, Former Director of Regional NGO Networks, 20+ years in social impact",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
            1,

            "Hon. James Kariuki",
            "Board Vice-Chair",
            "Former County Commissioner, Expert in governance and community engagement, Advocate of Kenya's Constitution",
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
            2,

            "Prof. Margaret Oduor",
            "Board Member",
            "Professor of Economics, Researcher in sustainable development, Published author on poverty alleviation strategies",
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
            3,
          ],
        );
      }
    })().catch((error) => {
      ensureTeamSetupPromise = null;
      throw error;
    });
  }

  return ensureTeamSetupPromise;
}

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
    await ensureTeamSetup();
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
    await ensureTeamSetup();
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
    await ensureTeamSetup();
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
    await ensureTeamSetup();
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
