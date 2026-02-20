const express = require("express");
const { query } = require("../config/database");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { contactLimiter } = require("../middleware/rateLimiters");
const { sendReplyEmail } = require("../services/emailService");
const realtime = require("../services/realtimeService");

const router = express.Router();

async function emitMessageUpdate(messageId) {
  const rows = await query("SELECT * FROM messages WHERE id = ? LIMIT 1", [messageId]);
  if (!rows[0]) {
    return;
  }
  realtime.emitToAdmins("message:update", rows[0]);
}

router.post(
  "/",
  contactLimiter,
  asyncHandler(async (req, res) => {
    const { fullName, email, phone, subject, message } = req.body;

    if (!fullName || !email || !subject || !message) {
      return res.status(400).json({
        message: "fullName, email, subject, and message are required.",
      });
    }

    const result = await query(
      `
      INSERT INTO messages (fullName, email, phone, subject, message, status)
      VALUES (?, ?, ?, ?, ?, 'UNREAD')
      `,
      [
        String(fullName).trim(),
        String(email).trim().toLowerCase(),
        String(phone || "").trim(),
        String(subject).trim(),
        String(message).trim(),
      ],
    );

    const rows = await query("SELECT * FROM messages WHERE id = ? LIMIT 1", [
      result.insertId,
    ]);

    realtime.emitToAdmins("message:new", rows[0]);

    return res.status(201).json({
      message: "Message received. We will get back to you soon.",
      data: rows[0],
    });
  }),
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
      params.push(String(req.query.status).toUpperCase());
    }

    if (req.query.search) {
      filters.push("(fullName LIKE ? OR email LIKE ? OR subject LIKE ?)");
      const search = `%${req.query.search}%`;
      params.push(search, search, search);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const rows = await query(
      `
      SELECT *
      FROM messages
      ${where}
      ORDER BY createdAt DESC
      `,
      params,
    );

    return res.json({ data: rows });
  }),
);

router.get(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const messageRows = await query("SELECT * FROM messages WHERE id = ? LIMIT 1", [
      req.params.id,
    ]);

    if (!messageRows[0]) {
      return res.status(404).json({ message: "Message not found." });
    }

    const replies = await query(
      `
      SELECT mr.*, u.name AS adminName
      FROM message_replies mr
      LEFT JOIN users u ON u.id = mr.adminUserId
      WHERE mr.messageId = ?
      ORDER BY mr.sentAt DESC
      `,
      [req.params.id],
    );

    return res.json({
      data: {
        ...messageRows[0],
        replies,
      },
    });
  }),
);

router.patch(
  "/:id/status",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    const normalizedStatus = String(status || "").toUpperCase();
    if (!["UNREAD", "READ", "ARCHIVED"].includes(normalizedStatus)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    await query(
      "UPDATE messages SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
      [normalizedStatus, req.params.id],
    );
    await emitMessageUpdate(req.params.id);
    return res.json({ message: "Message status updated." });
  }),
);

router.post(
  "/:id/archive",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    await query(
      "UPDATE messages SET status = 'ARCHIVED', updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
      [req.params.id],
    );
    await emitMessageUpdate(req.params.id);
    return res.json({ message: "Message archived." });
  }),
);

router.post(
  "/:id/reply",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { replyText } = req.body;
    if (!replyText) {
      return res.status(400).json({ message: "replyText is required." });
    }

    const messageRows = await query("SELECT * FROM messages WHERE id = ? LIMIT 1", [
      req.params.id,
    ]);
    const message = messageRows[0];
    if (!message) {
      return res.status(404).json({ message: "Message not found." });
    }

    await query(
      `
      INSERT INTO message_replies (
        messageId, adminUserId, replyText, sentToEmail, sentAt
      ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `,
      [req.params.id, req.user.id, String(replyText).trim(), message.email],
    );

    const emailResult = await sendReplyEmail({
      recipientEmail: message.email,
      recipientName: message.fullName,
      originalSubject: message.subject,
      replyText: String(replyText).trim(),
    });

    await query(
      `
      UPDATE messages
      SET status = 'READ', updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [req.params.id],
    );

    await emitMessageUpdate(req.params.id);

    return res.json({
      message: "Reply stored and sender notified.",
      email: emailResult,
    });
  }),
);

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    await query("DELETE FROM message_replies WHERE messageId = ?", [req.params.id]);
    const result = await query("DELETE FROM messages WHERE id = ?", [req.params.id]);
    if (!result.affectedRows) {
      return res.status(404).json({ message: "Message not found." });
    }
    realtime.emitToAdmins("message:deleted", { id: Number(req.params.id) });
    return res.json({ message: "Message deleted." });
  }),
);

module.exports = router;
