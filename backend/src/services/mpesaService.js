const env = require("../config/env");

function baseUrl() {
  return env.mpesaEnvironment === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
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
  if (env.mpesaEnvironment === "production" && /localhost|127\.0\.0\.1/i.test(value)) {
    return false;
  }
  return true;
}

function getConfigurationWarnings() {
  const warnings = [];

  if (!env.mpesaConsumerKey || !env.mpesaConsumerSecret) {
    warnings.push("Missing MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET.");
  }

  if (!env.mpesaShortCode) {
    warnings.push("Missing MPESA_SHORTCODE.");
  }

  if (!env.mpesaPasskey) {
    warnings.push("Missing MPESA_PASSKEY.");
  } else if (String(env.mpesaPasskey).length < 20) {
    warnings.push(
      "MPESA_PASSKEY looks invalid. Use the full Lipa na M-Pesa passkey from Daraja portal.",
    );
  }

  if (!isCallbackUrlValid(env.mpesaCallbackUrl)) {
    warnings.push(
      "MPESA_CALLBACK_URL is invalid or still a placeholder. Use your public API callback URL.",
    );
  }

  if (env.mpesaEnvironment !== "production") {
    warnings.push(
      "MPESA_ENVIRONMENT is sandbox. Sandbox may not trigger a real phone STK popup.",
    );
  }

  return warnings;
}

function isConfigured() {
  return getConfigurationWarnings().filter((item) => !item.includes("sandbox")).length === 0;
}

function formatTimestamp(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}${hh}${min}${ss}`;
}

function normalizePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");

  if (!digits) {
    throw new Error("Phone number is required for M-Pesa STK push.");
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

async function fetchWithTimeout(url, options, timeoutMs = 20000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error?.name === "AbortError") {
      const timeoutError = new Error("M-Pesa request timed out. Please try again.");
      timeoutError.statusCode = 504;
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function getAccessToken() {
  if (!env.mpesaConsumerKey || !env.mpesaConsumerSecret) {
    throw new Error("M-Pesa consumer credentials are missing.");
  }

  const auth = Buffer.from(
    `${env.mpesaConsumerKey}:${env.mpesaConsumerSecret}`,
  ).toString("base64");

  const response = await fetchWithTimeout(
    `${baseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    },
  );

  if (!response.ok) {
    const text = await response.text();
    const error = new Error(`M-Pesa token request failed: ${text}`);
    error.statusCode = 502;
    throw error;
  }

  const data = await response.json();
  if (!data.access_token) {
    const error = new Error("M-Pesa token response did not include an access token.");
    error.statusCode = 502;
    throw error;
  }
  return data.access_token;
}

async function initiateStkPush({
  amount,
  phone,
  accountReference,
  transactionDesc,
}) {
  const warnings = getConfigurationWarnings();
  const hardWarnings = warnings.filter((item) => !item.includes("sandbox"));
  if (hardWarnings.length > 0) {
    const error = new Error(
      `M-Pesa is not fully configured. ${hardWarnings.join(" ")}`,
    );
    error.statusCode = 503;
    throw error;
  }

  const normalizedPhone = normalizePhone(phone);
  const token = await getAccessToken();
  const timestamp = formatTimestamp();
  const password = Buffer.from(
    `${env.mpesaShortCode}${env.mpesaPasskey}${timestamp}`,
  ).toString("base64");

  const requestBody = {
    BusinessShortCode: env.mpesaShortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: Math.max(1, Math.round(Number(amount))),
    PartyA: normalizedPhone,
    PartyB: env.mpesaShortCode,
    PhoneNumber: normalizedPhone,
    CallBackURL: env.mpesaCallbackUrl,
    AccountReference: accountReference,
    TransactionDesc: transactionDesc || "Silver Shield Donation",
  };

  const response = await fetchWithTimeout(
    `${baseUrl()}/mpesa/stkpush/v1/processrequest`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    },
  );

  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = { raw: text };
  }

  if (!response.ok) {
    const error = new Error(
      `M-Pesa STK request failed: ${payload?.errorMessage || payload?.raw || text}`,
    );
    error.statusCode = 502;
    throw error;
  }

  const responseCode = String(payload?.ResponseCode ?? "");
  if (responseCode !== "0") {
    const error = new Error(
      `M-Pesa STK rejected: ${payload?.ResponseDescription || "Unknown provider response."}`,
    );
    error.statusCode = 502;
    throw error;
  }

  return {
    ...payload,
    normalizedPhone,
    environment: env.mpesaEnvironment,
  };
}

function getPaymentDetails() {
  const warnings = getConfigurationWarnings();
  return {
    paybill: env.mpesaPaybill,
    accountNumber: env.mpesaAccountNumber,
    environment: env.mpesaEnvironment,
    configured: isConfigured(),
    warnings,
  };
}

module.exports = {
  isConfigured,
  getPaymentDetails,
  getConfigurationWarnings,
  normalizePhone,
  initiateStkPush,
};
