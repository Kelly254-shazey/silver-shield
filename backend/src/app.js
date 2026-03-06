const express = require("express");
const cors = require("cors");
const env = require("./config/env");
const apiRoutes = require("./routes");
const { globalLimiter } = require("./middleware/rateLimiters");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");
const { query } = require("./config/database");

const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (env.allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(globalLimiter);

app.get("/", (req, res) => {
  res.json({ message: "Silver Shield API", status: "running" });
});

app.get("/api/health", async (req, res) => {
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

app.use("/api", apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
