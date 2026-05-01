const express = require("express");
const cors = require("cors");
const path = require("path");
const env = require("./config/env");
const apiRoutes = require("./routes");
const { globalLimiter } = require("./middleware/rateLimiters");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");
const { query } = require("./config/database");

const app = express();
const allowedOriginSet = new Set(env.allowedOrigins.map((origin) => String(origin || "").toLowerCase()));
const uniquePaths = (paths) => [...new Set(paths.filter(Boolean))];
const apiMountPaths = uniquePaths(["/api", env.apiBasePath]);
const healthPaths = uniquePaths(["/api/health", `${env.apiBasePath}/health`]);
const rootPaths = uniquePaths(["/", env.appBasePath]);
const uploadsPaths = uniquePaths(["/uploads", env.uploadsBasePath]);

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const normalizedOrigin = String(origin || "").replace(/\/+$/, "").toLowerCase();
      if (allowedOriginSet.has(normalizedOrigin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(uploadsPaths, express.static(path.resolve(process.cwd(), "uploads")));
app.use(globalLimiter);

app.get(rootPaths, (req, res) => {
  res.json({ message: "Silver Shield API", status: "running" });
});

app.get(healthPaths, async (req, res) => {
  try {
    await query("SELECT 1");
    return res.json({
      status: "ok",
      service: "silver-shield-api",
      timestamp: new Date().toISOString(),
      db: "connected",
    });
  } catch (error) {
    return res.status(503).json({
      status: "degraded",
      service: "silver-shield-api",
      timestamp: new Date().toISOString(),
      db: "disconnected",
      error: error.message,
    });
  }
});

app.use(apiMountPaths, apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
