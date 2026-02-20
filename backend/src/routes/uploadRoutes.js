const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname || "").toLowerCase();
    const baseName = path
      .basename(file.originalname || "upload", ext)
      .replace(/[^\w-]+/g, "-")
      .slice(0, 60);
    cb(null, `${baseName || "image"}-${uniqueSuffix}${ext || ".jpg"}`);
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

function getPublicBase(req) {
  const forwardedProto = req.get("x-forwarded-proto");
  const forwardedHost = req.get("x-forwarded-host");
  const protocol = forwardedProto || req.protocol;
  const host = forwardedHost || req.get("host");
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

    const relativeUrl = `/uploads/${req.file.filename}`;
    const absoluteUrl = `${getPublicBase(req)}${relativeUrl}`;

    return res.json({
      url: absoluteUrl,
      relativeUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  }),
);

module.exports = router;
