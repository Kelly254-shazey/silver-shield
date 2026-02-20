const express = require("express");
const { query } = require("../config/database");
const asyncHandler = require("../utils/asyncHandler");
const { createSlug } = require("../utils/slug");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

const initiativePrograms = [
  {
    title: "Women empowerment program (wezesha dada initiative)",
    slug: "women-empowerment-program-wezesha-dada-initiative",
    summary: "Empowering women through mentorship, enterprise support, and leadership pathways.",
    description:
      "The Wezesha Dada initiative strengthens women-led households and community networks through training, financial literacy, and practical support structures.",
    category: "Women Empowerment",
    heroImage:
      "https://images.unsplash.com/photo-1593113598332-cd59a93b8f50?auto=format&fit=crop&w=1400&q=80",
    location: "Nairobi and surrounding counties",
  },
  {
    title: "Youth empowerment program",
    slug: "youth-empowerment-program",
    summary: "Preparing youth with skills, confidence, and opportunities for sustainable futures.",
    description:
      "Our youth empowerment program provides mentorship, entrepreneurship support, and life-skills development so young people can transition into productive leadership.",
    category: "Youth Empowerment",
    heroImage:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
    location: "Nairobi, Kisumu, and Mombasa",
  },
  {
    title: "School mentorship programmes",
    slug: "school-mentorship-programmes",
    summary:
      "In-school mentorship journeys that build character, academic focus, and purpose.",
    description:
      "School mentorship programmes connect students with mentors for academic encouragement, career guidance, and psychosocial support in a safe environment.",
    category: "Mentorship",
    heroImage:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1400&q=80",
    location: "Partner schools across Kenya",
  },
  {
    title: "Community outreach programme",
    slug: "community-outreach-programme",
    summary:
      "Direct outreach to vulnerable communities through practical support and referral systems.",
    description:
      "This programme delivers inclusive outreach services, community mobilization, and coordinated interventions that connect families to resources and care.",
    category: "Community Outreach",
    heroImage:
      "https://images.unsplash.com/photo-1615897571701-13f3c5f79d55?auto=format&fit=crop&w=1400&q=80",
    location: "Community hubs and rural clusters",
  },
  {
    title: "Naturing talent",
    slug: "naturing-talent",
    summary:
      "Identifying and growing talent in arts, sports, and innovation through structured support.",
    description:
      "Naturing Talent helps young people discover and refine abilities through coaching, showcase platforms, and pathways to long-term growth opportunities.",
    category: "Talent Development",
    heroImage:
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1400&q=80",
    location: "Urban and peri-urban youth centers",
  },
];

let ensureProgramsSetupPromise = null;

function toProgramPayload(body) {
  const {
    title,
    slug,
    summary,
    description,
    category,
    heroImage,
    galleryImages = [],
    goalAmount = 0,
    raisedAmount = 0,
    location,
    status = "active",
  } = body;

  const normalizedTitle = String(title || "").trim();
  const normalizedSlug = createSlug(String(slug || normalizedTitle).trim());

  return {
    title: normalizedTitle,
    slug: normalizedSlug,
    summary: String(summary || "").trim(),
    description: String(description || "").trim(),
    category: String(category || "").trim(),
    heroImage: String(heroImage || "").trim(),
    galleryImages: JSON.stringify(
      Array.isArray(galleryImages)
        ? galleryImages
        : String(galleryImages || "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
    ),
    goalAmount: Number(goalAmount || 0),
    raisedAmount: Number(raisedAmount || 0),
    location: String(location || "").trim(),
    status: String(status || "active").toLowerCase(),
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

function mapProgram(row) {
  return {
    ...row,
    galleryImages: parseJsonField(row.galleryImages, []),
  };
}

function ensureProgramsSetup() {
  if (!ensureProgramsSetupPromise) {
    ensureProgramsSetupPromise = (async () => {
      await query(`
        CREATE TABLE IF NOT EXISTS programs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(160) NOT NULL,
          summary TEXT NOT NULL,
          description LONGTEXT NULL,
          category VARCHAR(120) NULL,
          heroImage VARCHAR(512) NULL,
          galleryImages LONGTEXT NULL,
          goalAmount DECIMAL(14,2) NOT NULL DEFAULT 0,
          raisedAmount DECIMAL(14,2) NOT NULL DEFAULT 0,
          location VARCHAR(255) NULL,
          status VARCHAR(32) NOT NULL DEFAULT 'active',
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY uq_program_slug (slug)
        )
      `);

      const countRows = await query("SELECT COUNT(*) AS count FROM programs");
      const existingCount = Number(countRows?.[0]?.count || 0);
      if (existingCount === 0) {
        for (const initiative of initiativePrograms) {
          await query(
            `
            INSERT INTO programs (
              title, slug, summary, description, category, heroImage, galleryImages,
              goalAmount, raisedAmount, location, status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
            `,
            [
              initiative.title,
              initiative.slug,
              initiative.summary,
              initiative.description,
              initiative.category,
              initiative.heroImage,
              JSON.stringify([]),
              0,
              0,
              initiative.location,
            ],
          );
        }
      }
    })().catch((error) => {
      ensureProgramsSetupPromise = null;
      throw error;
    });
  }

  return ensureProgramsSetupPromise;
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    await ensureProgramsSetup();
    const filters = [];
    const params = [];

    if (req.query.category) {
      filters.push("category = ?");
      params.push(req.query.category);
    }

    if (req.query.status) {
      filters.push("status = ?");
      params.push(req.query.status);
    } else if (req.query.admin !== "true") {
      filters.push("status <> 'draft'");
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const rows = await query(
      `SELECT * FROM programs ${where} ORDER BY createdAt DESC`,
      params,
    );
    return res.json({ data: rows.map(mapProgram) });
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    await ensureProgramsSetup();
    const idOrSlug = req.params.id;
    const numericId = Number(idOrSlug);
    const rows = await query(
      `
      SELECT *
      FROM programs
      WHERE id = ? OR slug = ?
      LIMIT 1
      `,
      [Number.isNaN(numericId) ? 0 : numericId, idOrSlug],
    );

    const program = rows[0];
    if (!program) {
      return res.status(404).json({ message: "Program not found." });
    }

    return res.json({ data: mapProgram(program) });
  }),
);

router.post(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    await ensureProgramsSetup();
    const payload = toProgramPayload(req.body);
    if (!payload.title || !payload.summary) {
      return res.status(400).json({ message: "Title and summary are required." });
    }

    const result = await query(
      `
      INSERT INTO programs (
        title, slug, summary, description, category, heroImage, galleryImages,
        goalAmount, raisedAmount, location, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        payload.title,
        payload.slug,
        payload.summary,
        payload.description,
        payload.category,
        payload.heroImage,
        payload.galleryImages,
        payload.goalAmount,
        payload.raisedAmount,
        payload.location,
        payload.status,
      ],
    );

    const created = await query("SELECT * FROM programs WHERE id = ?", [
      result.insertId,
    ]);
    return res.status(201).json({ data: mapProgram(created[0]) });
  }),
);

router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    await ensureProgramsSetup();
    const payload = toProgramPayload(req.body);
    await query(
      `
      UPDATE programs
      SET title = ?, slug = ?, summary = ?, description = ?, category = ?, heroImage = ?,
          galleryImages = ?, goalAmount = ?, raisedAmount = ?, location = ?, status = ?,
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [
        payload.title,
        payload.slug,
        payload.summary,
        payload.description,
        payload.category,
        payload.heroImage,
        payload.galleryImages,
        payload.goalAmount,
        payload.raisedAmount,
        payload.location,
        payload.status,
        req.params.id,
      ],
    );

    const rows = await query("SELECT * FROM programs WHERE id = ?", [req.params.id]);
    if (!rows[0]) {
      return res.status(404).json({ message: "Program not found." });
    }
    return res.json({ data: mapProgram(rows[0]) });
  }),
);

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    await ensureProgramsSetup();
    const result = await query("DELETE FROM programs WHERE id = ?", [req.params.id]);
    if (!result.affectedRows) {
      return res.status(404).json({ message: "Program not found." });
    }
    return res.json({ message: "Program deleted." });
  }),
);

module.exports = router;
