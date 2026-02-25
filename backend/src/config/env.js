const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(process.cwd(), ".env"), quiet: true });

function splitCsv(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function trimTrailingSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

const isProduction = (process.env.NODE_ENV || "development") === "production";
const defaultFrontendUrl = isProduction ? "" : "http://localhost:5173";
const frontendUrl = trimTrailingSlash(process.env.FRONTEND_URL || defaultFrontendUrl);
const allowedOrigins = splitCsv(process.env.ALLOWED_ORIGINS);
const resolvedAllowedOrigins =
  allowedOrigins.length > 0
    ? allowedOrigins.map(trimTrailingSlash)
    : frontendUrl
      ? [frontendUrl]
      : [];

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  frontendUrl,
  allowedOrigins: resolvedAllowedOrigins,

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
