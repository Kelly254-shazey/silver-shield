const express = require("express");
const authRoutes = require("./authRoutes");
const programRoutes = require("./programRoutes");
const storyRoutes = require("./storyRoutes");
const impactRoutes = require("./impactRoutes");
const partnerRoutes = require("./partnerRoutes");
const donationRoutes = require("./donationRoutes");
const messageRoutes = require("./messageRoutes");
const docRoutes = require("./docRoutes");
const teamRoutes = require("./teamRoutes");
const aiRoutes = require("./aiRoutes");
const uploadRoutes = require("./uploadRoutes");
const aboutRoutes = require("./aboutRoutes");
const eventRoutes = require("./eventRoutes");
const { authLimiter, aiLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.use("/auth", authLimiter, authRoutes);
router.use("/programs", programRoutes);
router.use("/stories", storyRoutes);
router.use("/impact", impactRoutes);
router.use("/partners", partnerRoutes);
router.use("/donations", donationRoutes);
router.use("/messages", messageRoutes);
router.use("/docs", docRoutes);
router.use("/team", teamRoutes);
router.use("/about", aboutRoutes);
router.use("/events", eventRoutes);
router.use("/ai", aiLimiter, aiRoutes);
router.use("/upload", uploadRoutes);

module.exports = router;
