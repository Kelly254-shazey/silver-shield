const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

const envPathCandidates = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(__dirname, "../../.env"),
];

const resolvedEnvPath = envPathCandidates.find((candidate) => fs.existsSync(candidate));
dotenv.config(
  resolvedEnvPath
    ? { path: resolvedEnvPath, quiet: true }
    : { quiet: true },
);

function splitCsv(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function trimTrailingSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

function normalizePathPrefix(value) {
  const raw = String(value || "").trim();
  if (!raw || raw === "/") {
    return "";
  }
  const withLeadingSlash = raw.startsWith("/") ? raw : `/${raw}`;
  return trimTrailingSlash(withLeadingSlash);
}

function normalizeOrigin(value) {
  return trimTrailingSlash(value).toLowerCase();
}

function unique(values) {
  return [...new Set(values)];
}

const isProduction = (process.env.NODE_ENV || "development") === "production";
const defaultFrontendUrl = isProduction ? "https://edumin.co.ke" : "http://localhost:5173";
const frontendUrl = normalizeOrigin(process.env.FRONTEND_URL || defaultFrontendUrl);
const allowedOrigins = splitCsv(process.env.ALLOWED_ORIGINS).map(normalizeOrigin);
const fallbackOrigins = isProduction
  ? ["https://edumin.co.ke", "https://www.edumin.co.ke"]
  : ["http://localhost:5173"];
const resolvedAllowedOrigins =
  allowedOrigins.length > 0
    ? unique(allowedOrigins)
    : unique([frontendUrl, ...fallbackOrigins].filter(Boolean).map(normalizeOrigin));
const appBasePath = normalizePathPrefix(
  process.env.APP_BASE_PATH || (isProduction ? "/backend" : ""),
);
const apiBasePath = appBasePath ? `${appBasePath}/api` : "/api";
const uploadsBasePath = appBasePath ? `${appBasePath}/uploads` : "/uploads";
const socketPath = normalizePathPrefix(
  process.env.SOCKET_PATH || (appBasePath ? `${appBasePath}/socket.io` : "/socket.io"),
) || "/socket.io";

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  frontendUrl,
  allowedOrigins: resolvedAllowedOrigins,
  appBasePath,
  apiBasePath,
  uploadsBasePath,
  socketPath,

  dbHost: process.env.DB_HOST || "127.0.0.1",
  dbPort: Number(process.env.DB_PORT || 3306),
  dbName: process.env.DB_NAME || "silver_shield",
  dbUser: process.env.DB_USER || "root",
  dbPassword: process.env.DB_PASSWORD || "",

  jwtSecret: process.env.JWT_SECRET || "silver-shield-dev-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "12h",

  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpSecure: process.env.SMTP_SECURE === "true",
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  smtpFromEmail: process.env.SMTP_FROM_EMAIL || "noreply@silvershield.org",
  smtpFromName: process.env.SMTP_FROM_NAME || "Silver Shield Organisation",

  mpesaConsumerKey: process.env.MPESA_CONSUMER_KEY || "",
  mpesaConsumerSecret: process.env.MPESA_CONSUMER_SECRET || "",
  mpesaShortCode: process.env.MPESA_SHORTCODE || "",
  mpesaPasskey: process.env.MPESA_PASSKEY || "",
  mpesaPaybill: process.env.MPESA_PAYBILL || "522522",
  mpesaAccountNumber: process.env.MPESA_ACCOUNT_NUMBER || "1342183193",
  mpesaCallbackUrl:
    process.env.MPESA_CALLBACK_URL ||
    (isProduction
      ? "https://your-domain.com/api/donations/mpesa/callback"
      : "http://localhost:5000/api/donations/mpesa/callback"),
  mpesaEnvironment: process.env.MPESA_ENVIRONMENT || "sandbox",

  paypalClientId: process.env.PAYPAL_CLIENT_ID || "",
  paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET || "",
  paypalEnvironment: process.env.PAYPAL_ENVIRONMENT || "sandbox",
  paypalReturnUrl:
    process.env.PAYPAL_RETURN_URL || (frontendUrl ? `${frontendUrl}/donate` : ""),
  paypalCancelUrl:
    process.env.PAYPAL_CANCEL_URL || (frontendUrl ? `${frontendUrl}/donate` : ""),

  payheroEnvironment: process.env.PAYHERO_ENVIRONMENT || "sandbox",
  payheroAuth: process.env.PAYHERO_AUTH || "",
  payheroAccountNumber: process.env.PAYHERO_ACCOUNT_NUMBER || "",
  payheroChannelId: process.env.PAYHERO_CHANNEL_ID || "",
  payheroCallbackUrl:
    process.env.PAYHERO_CALLBACK_URL ||
    (isProduction
      ? "https://your-domain.com/api/donations/payhero/callback"
      : "http://localhost:5000/api/donations/payhero/callback"),
};

function assertProductionConfig() {
  if (!isProduction) {
    return;
  }

  const missing = [];

  if (!process.env.JWT_SECRET || env.jwtSecret === "silver-shield-dev-secret") {
    missing.push("JWT_SECRET");
  }

  if (!process.env.DB_PASSWORD) {
    missing.push("DB_PASSWORD");
  }

  if (!env.allowedOrigins.length) {
    missing.push("ALLOWED_ORIGINS");
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required production configuration: ${missing.join(", ")}.`,
    );
  }
}

module.exports = {
  ...env,
  assertProductionConfig,
};
