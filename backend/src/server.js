const http = require("http");
const express = require("express");
const cors = require("cors");
const env = require("./config/env");
const apiRoutes = require("./routes");
const { initSocket } = require("./config/socket");
const { globalLimiter } = require("./middleware/rateLimiters");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");
const { query } = require("./config/database");

const app = express();
const server = http.createServer(app);

initSocket(server);

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(globalLimiter);

// Serve static files (uploads)
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

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
      ...(env.nodeEnv !== "production" ? { dbError: error.message } : {}),
    });
  }
});

app.use("/api", apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

server.listen(env.port, () => {
  console.log(`Silver Shield API running on port ${env.port}`);
});
