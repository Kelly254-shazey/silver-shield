const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// File uploads disabled for serverless - use memory storage
const upload = multer({
  storage: multer.memoryStorage(),
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

    // File stored in memory (not persisted in serverless)
    const relativeUrl = `/uploads/${req.file.originalname}`;
    const absoluteUrl = `${getPublicBase(req)}${relativeUrl}`;

    return res.json({
      url: absoluteUrl,
      relativeUrl,
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  }),
);

module.exports = router;
