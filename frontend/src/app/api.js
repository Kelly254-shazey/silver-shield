// Build API URL with proper protocol handling
const LIVE_API_BASE_URL = "https://silver-shield-ducn.vercel.app/api";

function isLocalHost(value) {
  return value === "localhost" || value === "127.0.0.1";
}

function isLocalApiUrl(value) {
  try {
    const parsed = new URL(value);
    return isLocalHost(parsed.hostname);
  } catch {
    return false;
  }
}

function getApiBaseUrl() {
  const envUrl = String(import.meta.env.VITE_API_BASE_URL || "").trim();
  if (envUrl) {
    const normalizedEnvUrl = envUrl.replace(/\/+$/, "");

    if (typeof window !== "undefined") {
      const appHost = String(window.location.hostname || "").trim();
      const appIsLocal = isLocalHost(appHost);

      // Prevent production builds from accidentally using localhost API.
      if (!appIsLocal && isLocalApiUrl(normalizedEnvUrl)) {
        return LIVE_API_BASE_URL;
      }
    }

    return normalizedEnvUrl;
  }

  // Production default: always use the live deployed backend
  return LIVE_API_BASE_URL;
}

const API_BASE_URL = getApiBaseUrl();
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export function resolveMediaUrl(value) {
  const input = String(value || "").trim();
  if (!input) {
    return "";
  }
  if (/^https?:\/\//i.test(input)) {
    return input;
  }
  if (input.startsWith("//")) {
    return `https:${input}`;
  }
  return `${API_ORIGIN}${input.startsWith("/") ? input : `/${input}`}`;
}

export async function apiFetch(path, { method = "GET", body, token, headers = {}, useFormData = false } = {}) {
  const options = {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  if (useFormData && body instanceof FormData) {
    options.body = body;
    // Don't set Content-Type header, let the browser set it with boundary
  } else {
    options.headers["Content-Type"] = "application/json";
    if (body) {
      options.body = JSON.stringify(body);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, options);

  const text = await response.text();
  let payload = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = { message: text };
  }

  if (!response.ok) {
    throw new Error(payload?.message || "Request failed");
  }

  return payload;
}

export { API_BASE_URL, API_ORIGIN };
