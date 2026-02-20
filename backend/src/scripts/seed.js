const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { pool, query } = require("../config/database");
const { reindexDocument } = require("../services/aiService");

const schemaPath = path.resolve(__dirname, "../../db/schema.sql");

function readSchemaFile() {
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found: ${schemaPath}`);
  }
  return fs.readFileSync(schemaPath, "utf8").replace(/^\uFEFF/, "");
}

async function runSeed() {
  const schemaSql = readSchemaFile();
  await pool.query(schemaSql);

  const adminEmail = process.env.ADMIN_EMAIL || "admin@silvershield.org";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  await query(
    `
    INSERT INTO users (name, email, passwordHash, role)
    VALUES (?, ?, ?, 'admin')
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      passwordHash = VALUES(passwordHash),
      role = 'admin'
    `,
    ["Silver Shield Admin", adminEmail, adminPasswordHash],
  );

  const [programCount] = await query("SELECT COUNT(*) AS count FROM programs");
  if (programCount.count === 0) {
    await query(
      `
      INSERT INTO programs (
        title, slug, summary, description, category, heroImage, galleryImages,
        goalAmount, raisedAmount, location, status
      ) VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        "Girls STEM Fellowship",
        "girls-stem-fellowship",
        "Mentorship, digital labs, and scholarships for girls in underserved schools.",
        "Silver Shield runs a 12-month STEM fellowship with laptop grants, coding clubs, and leadership coaching.",
        "Education",
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80",
        JSON.stringify([
          "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80",
        ]),
        120000,
        74500,
        "Nairobi, Kenya",
        "active",

        "Community Health Outreach",
        "community-health-outreach",
        "Mobile clinics, preventive screenings, and referral pathways for rural families.",
        "This program deploys volunteer clinicians and health workers to deliver primary care, health talks, and referral support.",
        "Health",
        "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1400&q=80",
        JSON.stringify([
          "https://images.unsplash.com/photo-1666214280391-8ff5bd3c0bf0?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=900&q=80",
        ]),
        98000,
        62850,
        "Kisumu County, Kenya",
        "active",

        "Youth Climate Labs",
        "youth-climate-labs",
        "Youth-led climate adaptation pilots focused on clean water and regenerative farming.",
        "Our climate labs fund prototypes and train local youth to build resilient community systems.",
        "Climate",
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80",
        JSON.stringify([
          "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=900&q=80",
        ]),
        76000,
        27100,
        "Makueni County, Kenya",
        "active",
      ],
    );
  }

  const [storyCount] = await query("SELECT COUNT(*) AS count FROM stories");
  if (storyCount.count === 0) {
    await query(
      `
      INSERT INTO stories (
        title, slug, excerpt, content, coverImage, category, author, tags, status, publishedAt
      ) VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, 'published', CURRENT_TIMESTAMP),
      (?, ?, ?, ?, ?, ?, ?, ?, 'published', CURRENT_TIMESTAMP)
      `,
      [
        "From Village School to Robotics Finals",
        "from-village-school-to-robotics-finals",
        "How Amina moved from no computer access to national robotics competition finalist.",
        "Amina joined Silver Shield's STEM fellowship in 2024. Within eight months she built her first robotics prototype and represented her school in the county showcase.",
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
        "Education",
        "Silver Shield Editorial",
        JSON.stringify(["education", "youth", "innovation"]),

        "Mobile Clinic Reaches 18 Remote Villages",
        "mobile-clinic-reaches-18-remote-villages",
        "A coordinated health campaign delivered screenings and referrals where services were least accessible.",
        "Through partnerships with county facilities, the outreach team served 3,200 residents and referred urgent cases within 24 hours.",
        "https://images.unsplash.com/photo-1584516150909-c43483ee7939?auto=format&fit=crop&w=1400&q=80",
        "Health",
        "Silver Shield Editorial",
        JSON.stringify(["health", "outreach", "community"]),
      ],
    );
  }

  const [impactCount] = await query("SELECT COUNT(*) AS count FROM impact_stats");
  if (impactCount.count === 0) {
    await query(
      `
      INSERT INTO impact_stats (metricKey, label, value, unit, trend, icon, reportUrl)
      VALUES
      ('lives_reached', 'Lives Reached', 12540, 'people', 18.4, 'users', '/reports/impact-2025.pdf'),
      ('active_programs', 'Active Programs', 12, 'programs', 9.0, 'briefcase', '/reports/programs-2025.pdf'),
      ('volunteers', 'Volunteers Trained', 860, 'volunteers', 22.1, 'heart', '/reports/volunteer-2025.pdf'),
      ('funds_deployed', 'Funds Deployed', 340000, 'USD', 15.8, 'chart', '/reports/finance-2025.pdf')
      `,
    );
  }

  const [partnerCount] = await query("SELECT COUNT(*) AS count FROM partners");
  if (partnerCount.count === 0) {
    await query(
      `
      INSERT INTO partners (name, logoUrl, websiteUrl, orderIndex)
      VALUES
      ('GlobalCare Foundation', 'https://dummyimage.com/240x90/efe7ff/6A0DAD.png&text=GlobalCare', 'https://example.org', 1),
      ('BrightFuture Labs', 'https://dummyimage.com/240x90/fde6f3/6A0DAD.png&text=BrightFuture', 'https://example.org', 2),
      ('ImpactWorks', 'https://dummyimage.com/240x90/e8f2ff/6A0DAD.png&text=ImpactWorks', 'https://example.org', 3),
      ('OneCommunity', 'https://dummyimage.com/240x90/f5f0ff/6A0DAD.png&text=OneCommunity', 'https://example.org', 4)
      `,
    );
  }

  const [docCount] = await query("SELECT COUNT(*) AS count FROM docs");
  if (docCount.count === 0) {
    await query(
      `
      INSERT INTO docs (title, category, content, isPublished)
      VALUES
      (?, ?, ?, 1),
      (?, ?, ?, 1),
      (?, ?, ?, 1)
      `,
      [
        "Mission and Vision",
        "about",
        "Silver Shield Organisation exists to protect dignity and expand opportunity in underserved communities. Our mission is to deliver measurable social impact through education, health, and climate resilience programs. Our vision is a future where every community can thrive safely and sustainably.",

        "Donation Methods",
        "donations",
        "Silver Shield accepts donations through M-Pesa STK push and PayPal checkout. M-Pesa donations are initiated on the donation page by entering a valid mobile number, then confirming on phone. PayPal donations are completed through secure checkout and reflected in donor records after confirmation.",

        "Contact and Volunteering",
        "contact",
        "For partnerships, volunteering, and general support, reach Silver Shield by email at hello@silvershield.org or call +254 700 123 456 during working hours Monday to Friday, 8:00 AM to 5:00 PM. Our office is at Community Impact Centre, Nairobi, Kenya.",
      ],
    );
  }

  const docs = await query("SELECT id, content FROM docs");
  for (const doc of docs) {
    await reindexDocument(doc.id, doc.content);
  }

  console.log("Seed complete.");
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
}

runSeed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });

