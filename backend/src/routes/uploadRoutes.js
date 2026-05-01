const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const env = require("../config/env");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();
const uploadDir = path.resolve(process.cwd(), "uploads");

fs.mkdirSync(uploadDir, { recursive: true });

function sanitizeBaseName(value) {
  const name = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return name || "upload";
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const base = sanitizeBaseName(path.basename(file.originalname || "upload", ext));
    const unique = `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
    cb(null, `${base}-${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const mime = String(file.mimetype || "");
    if (mime.startsWith("image/") || mime.startsWith("video/")) {
      cb(null, true);
      return;
    }
    cb(new Error("Only image or video files are allowed."), false);
  },
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

function getPublicOrigin(req) {
  const forwardedProto = String(req.get("x-forwarded-proto") || req.protocol || "https");
  const forwardedHost = String(req.get("x-forwarded-host") || req.get("host") || "");
  const protocol = forwardedProto.split(",")[0].trim() || "https";
  const host = forwardedHost.split(",")[0].trim();
  return `${protocol}://${host}`;
}

router.post(
  "/upload",
  requireAuth,
  requireAdmin,
  (req, res, next) => {
    upload.single("file")(req, res, (error) => {
      if (!error) {
        next();
        return;
      }
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "File too large. Maximum size is 100MB." });
      }
      return res.status(400).json({ message: error.message || "Upload failed." });
    });
  },
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const filename = req.file.filename;
    const relativeUrl = `${env.uploadsBasePath}/${filename}`;
    const publicUrl = `${getPublicOrigin(req)}${relativeUrl}`;

    return res.json({
      url: publicUrl,
      relativeUrl,
      filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  }),
);

module.exports = router;
