const env = require("../config/env");

function baseUrl() {
  return env.payheroEnvironment === "production"
    ? "https://api.payhero.io"
    : "https://api-sandbox.payhero.io";
}

function isConfigured() {
  return Boolean(env.payheroAuth && env.payheroAccountNumber && env.payheroChannelId);
}

function normalizePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");

  if (!digits) {
    throw new Error("Phone number is required for PayHero STK push.");
  }

  // Handle Kenyan phone numbers
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
    "Invalid phone format. Use 07XXXXXXXX, 01XXXXXXXX, or 2547XXXXXXXX."
  );
}

async function fetchWithTimeout(url, options, timeoutMs = 20000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error?.name === "AbortError") {
      const timeoutError = new Error("PayHero request timed out. Please try again.");
      timeoutError.statusCode = 504;
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function initiateStkPush({
  amount,
  phone,
  accountReference,
  transactionDesc = "Payment",
}) {
  if (!isConfigured()) {
    return {
      mocked: true,
      id: `MOCK-PAYHERO-${Date.now()}`,
      status: "PENDING",
      normalizedPhone: phone,
      environment: "mocked",
    };
  }

  const normalizedPhone = normalizePhone(phone);

  const payload = {
    amount: Number(amount),
    phone_number: normalizedPhone,
    account_number: env.payheroAccountNumber,
    description: transactionDesc,
    channel_id: Number(env.payheroChannelId),
    callback_url: env.payheroCallbackUrl,
  };

  const response = await fetchWithTimeout(
    `${baseUrl()}/api/v1/request-money`,
    {
      method: "POST",
      headers: {
        Authorization: env.payheroAuth,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    const error = new Error(`PayHero STK push failed: ${text}`);
    error.statusCode = response.status;
    error.payheroError = text;
    throw error;
  }

  const data = await response.json();

  if (!data.success) {
    const error = new Error(
      `PayHero request failed: ${data.message || "Unknown error"}`
    );
    error.statusCode = 400;
    error.payheroError = data;
    throw error;
  }

  return {
    id: data.data?.transaction_id || data.data?.request_id,
    transactionId: data.data?.transaction_id,
    requestId: data.data?.request_id,
    status: "PENDING",
    normalizedPhone,
    environment: env.payheroEnvironment,
    customerMessage: data.message,
    ResponseDescription: data.message,
    fullResponse: data,
  };
}

async function checkTransactionStatus(transactionId) {
  if (!isConfigured()) {
    return {
      mocked: true,
      status: "COMPLETED",
      transactionId,
    };
  }

  const response = await fetchWithTimeout(
    `${baseUrl()}/api/v1/transactions/${transactionId}`,
    {
      headers: {
        Authorization: env.payheroAuth,
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to check PayHero transaction status: ${text}`);
  }

  const data = await response.json();
  return data.data || data;
}

module.exports = {
  baseUrl,
  isConfigured,
  normalizePhone,
  initiateStkPush,
  checkTransactionStatus,
};
