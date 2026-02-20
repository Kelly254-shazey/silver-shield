const env = require("../config/env");

function isConfigured() {
  return Boolean(env.paypalClientId && env.paypalClientSecret);
}

function getPaypalBaseUrl() {
  return env.paypalEnvironment === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

async function getAccessToken() {
  const auth = Buffer.from(
    `${env.paypalClientId}:${env.paypalClientSecret}`,
  ).toString("base64");
  const response = await fetch(`${getPaypalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PayPal token request failed: ${text}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function createOrder({ amount, currency = "USD", description }) {
  if (!isConfigured()) {
    return {
      mocked: true,
      id: `MOCK-PAYPAL-${Date.now()}`,
      status: "CREATED",
      links: [
        {
          rel: "approve",
          href: `${env.paypalReturnUrl}?mockPaypal=true`,
        },
      ],
    };
  }

  const token = await getAccessToken();
  const response = await fetch(`${getPaypalBaseUrl()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          description,
          amount: {
            currency_code: currency,
            value: Number(amount).toFixed(2),
          },
        },
      ],
      application_context: {
        return_url: env.paypalReturnUrl,
        cancel_url: env.paypalCancelUrl,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PayPal order creation failed: ${text}`);
  }

  return response.json();
}

async function captureOrder(orderId) {
  if (!isConfigured()) {
    return {
      mocked: true,
      id: orderId,
      status: "COMPLETED",
    };
  }

  const token = await getAccessToken();
  const response = await fetch(
    `${getPaypalBaseUrl()}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PayPal capture failed: ${text}`);
  }

  return response.json();
}

module.exports = {
  isConfigured,
  createOrder,
  captureOrder,
};
