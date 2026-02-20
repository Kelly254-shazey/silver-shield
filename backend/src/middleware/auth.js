const jwt = require("jsonwebtoken");
const env = require("../config/env");

function generateAuthToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;

  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }
  return next();
}

module.exports = {
  generateAuthToken,
  requireAuth,
  requireAdmin,
};
