const https = require("https");
const env = require("../config/env");

function baseUrl() {
  return String(env.payheroBaseUrl || "").trim().replace(/\/+$/, "");
}

function isPlaceholderUrl(url) {
  return /example\.com|your-domain\.com/i.test(String(url || ""));
}

function isCallbackUrlValid(url) {
  const value = String(url || "").trim();
  if (!value) {
    return false;
  }
  if (!/^https?:\/\//i.test(value)) {
    return false;
  }
  if (isPlaceholderUrl(value)) {
    return false;
  }
  if (env.payheroEnvironment === "production" && /localhost|127\.0\.0\.1/i.test(value)) {
    return false;
  }
  return true;
}

function resolveAuthorizationHeader() {
  const directAuth = String(env.payheroAuth || "").trim();
  if (directAuth) {
    if (/^(Basic|Bearer)\s+/i.test(directAuth)) {
      return directAuth;
    }
    return `Basic ${directAuth}`;
  }

  const apiKey = String(env.payheroApiKey || "").trim();
  if (!apiKey) {
    return "";
  }
  if (/^(Basic|Bearer)\s+/i.test(apiKey)) {
    return apiKey;
  }
  return `Bearer ${apiKey}`;
}

function isConfigured() {
  return Boolean(
    resolveAuthorizationHeader() &&
      String(env.payheroChannelId || "").trim(),
  );
}

function getConfigurationWarnings() {
  const warnings = [];

  if (!resolveAuthorizationHeader()) {
    warnings.push("Missing PAYHERO_AUTH or PAYHERO_API_KEY.");
  }

  if (!String(env.payheroChannelId || "").trim()) {
    warnings.push("Missing PAYHERO_CHANNEL_ID.");
  }

  if (!isCallbackUrlValid(env.payheroCallbackUrl)) {
    warnings.push(
      "PAYHERO_CALLBACK_URL is invalid or still a placeholder. Use your public API callback URL.",
    );
  }

  if (env.payheroEnvironment !== "production") {
    warnings.push("PAYHERO_ENVIRONMENT is sandbox. Use production for live payments.");
  }

  return warnings;
}

function getPaymentDetails() {
  return {
    baseUrl: baseUrl(),
    accountNumber: env.payheroAccountNumber,
    channelId: env.payheroChannelId,
    environment: env.payheroEnvironment,
    configured: isConfigured(),
    warnings: getConfigurationWarnings(),
  };
}

function normalizePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");

  if (!digits) {
    throw new Error("Phone number is required for PayHero.");
  }

  if (/^254(7|1)\d{8}$/.test(digits)) {
    return digits;
  }

  if (/^0(7|1)\d{8}$/.test(digits)) {
    return `254${digits.slice(1)}`;
  }

  if (/^(7|1)\d{8}$/.test(digits)) {
    return `254${digits}`;
  }

  throw new Error(
    "Invalid phone format. Use 07XXXXXXXX, 01XXXXXXXX, or 2547XXXXXXXX.",
  );
}

function toPayheroPhone(phone) {
  const normalized = normalizePhone(phone);
  if (/^254(7|1)\d{8}$/.test(normalized)) {
    return `0${normalized.slice(3)}`;
  }
  return normalized;
}

function requestPayhero({
  method,
  path,
  payload,
}) {
  const body = payload == null ? null : JSON.stringify(payload);

  return new Promise((resolve, reject) => {
    const req = https.request(
      `${baseUrl()}${path}`,
      {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(body ? { "Content-Length": Buffer.byteLength(body) } : {}),
          Authorization: resolveAuthorizationHeader(),
        },
        timeout: 30000,
      },
      (response) => {
        let raw = "";
        response.on("data", (chunk) => {
          raw += chunk.toString();
        });
        response.on("end", () => {
          let parsed = null;
          try {
            parsed = raw ? JSON.parse(raw) : null;
          } catch {
            parsed = null;
          }

          resolve({
            statusCode: Number(response.statusCode || 0),
            ok: Number(response.statusCode || 0) >= 200 && Number(response.statusCode || 0) < 300,
            body: raw,
            data: parsed,
          });
        });
      },
    );

    req.on("timeout", () => {
      req.destroy(new Error("PayHero request timed out."));
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (body) {
      req.write(body);
    }

    req.end();
  });
}

async function initiatePayment({
  amount,
  phone,
  accountReference,
  transactionDesc,
  customerName,
  callbackUrl,
}) {
  const warnings = getConfigurationWarnings();
  const hardWarnings = warnings.filter((item) => !item.toLowerCase().includes("sandbox"));
  if (hardWarnings.length > 0) {
    const error = new Error(
      `PayHero is not fully configured. ${hardWarnings.join(" ")}`,
    );
    error.statusCode = 503;
    throw error;
  }

  const normalizedPhone = normalizePhone(phone);
  const payheroPhone = toPayheroPhone(phone);
  const channelId = String(env.payheroChannelId || "").trim();

  const payload = {
    amount: Math.max(1, Math.round(Number(amount))),
    phone_number: payheroPhone,
    channel_id: /^\d+$/.test(channelId) ? Number(channelId) : channelId,
    provider: "m-pesa",
    external_reference: accountReference || `SILVER-${Date.now()}`,
    customer_name: String(customerName || "").trim() || "Anonymous Donor",
    description: transactionDesc || "Silver Shield Donation",
    callback_url: callbackUrl || env.payheroCallbackUrl,
  };

  if (String(env.payheroAccountNumber || "").trim()) {
    payload.account_number = env.payheroAccountNumber;
  }

  try {
    const response = await requestPayhero({
      method: "POST",
      path: "/api/v2/payments",
      payload,
    });

    if (!response.ok) {
      const message =
        response.data?.error_message ||
        response.data?.message ||
        response.body ||
        "Unknown provider error.";
      throw new Error(`PayHero payment initiation failed: ${message}`);
    }

    const data = response.data || {};
    return {
      ...data,
      normalizedPhone: normalizedPhone,
      environment: env.payheroEnvironment,
    };
  } catch (error) {
    throw new Error(`PayHero API Error: ${error.message}`);
  }
}

async function checkPaymentStatus(checkoutId) {
  const warnings = getConfigurationWarnings();
  const hardWarnings = warnings.filter((item) => !item.toLowerCase().includes("sandbox"));
  if (hardWarnings.length > 0) {
    const error = new Error(
      `PayHero is not fully configured. ${hardWarnings.join(" ")}`,
    );
    error.statusCode = 503;
    throw error;
  }

  try {
    const response = await requestPayhero({
      method: "GET",
      path: `/api/v2/transaction-status?reference=${encodeURIComponent(checkoutId)}`,
    });

    if (!response.ok) {
      const message =
        response.data?.error_message ||
        response.data?.message ||
        response.body ||
        "Unknown provider error.";
      throw new Error(`PayHero status check failed: ${message}`);
    }

    return response.data || {};
  } catch (error) {
    throw new Error(`PayHero API Error: ${error.message}`);
  }
}

function validateCallback(callbackData) {
  const required = ["checkout_id", "status", "amount", "phone"];
  const missing = required.filter((field) => !callbackData[field]);

  if (missing.length > 0) {
    throw new Error(`Missing required callback fields: ${missing.join(", ")}`);
  }

  return true;
}

module.exports = {
  initiatePayment,
  checkPaymentStatus,
  normalizePhone,
  isConfigured,
  getConfigurationWarnings,
  getPaymentDetails,
  validateCallback,
};
