const express = require("express");
const bcrypt = require("bcryptjs");
const { query } = require("../config/database");
const asyncHandler = require("../utils/asyncHandler");
const { generateAuthToken, requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const rows = await query(
      "SELECT id, name, email, passwordHash, role FROM users WHERE email = ? LIMIT 1",
      [String(email).trim().toLowerCase()],
    );

    const user = rows[0];
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOk) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = generateAuthToken(user);
    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  }),
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const rows = await query(
      "SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1",
      [req.user.id],
    );
    const user = rows[0];
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.json({ user });
  }),
);

module.exports = router;
