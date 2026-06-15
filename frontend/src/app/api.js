// Build API URL with proper protocol handling
const LIVE_API_BASE_URL = "https://edumin.co.ke/backend/";

function trimTrailingSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

function isLocalHost(value) {
  const host = String(value || "").trim().toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

function safeParseUrl(value) {
  try {
    return new URL(String(value || ""));
  } catch {
    return null;
  }
}

function isLocalApiUrl(value) {
  const parsed = safeParseUrl(value);
  return Boolean(parsed && isLocalHost(parsed.hostname));
}

function getApiBaseUrl() {
  // All frontend API calls must use the live deployed backend.
  return LIVE_API_BASE_URL;
}

function toBooleanEnv(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) {
    return null;
  }
  return ["1", "true", "yes", "on"].includes(normalized);
}

function joinUrl(base, value) {
  return `${trimTrailingSlash(base)}/${String(value || "").replace(/^\/+/, "")}`;
}

function looksLikeMediaFilename(value) {
  return /^[^/?#]+\.(?:avif|bmp|gif|jpe?g|png|svg|webp|mp4|webm|mov|avi|m4v)$/i.test(
    String(value || "").trim(),
  );
}

function normalizeMediaPath(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }

  if (!raw.startsWith("/")) {
    if (raw.startsWith("uploads/")) {
      return `/${raw}`;
    }
    if (looksLikeMediaFilename(raw)) {
      return `/uploads/${raw}`;
    }
    return `/${raw}`;
  }

  return raw;
}

function getMediaBaseUrl(defaultValue) {
  const envMediaBase = String(import.meta.env.VITE_MEDIA_BASE_URL || "").trim();
  if (!envMediaBase) {
    return defaultValue;
  }

  const normalizedEnvMediaBase = trimTrailingSlash(envMediaBase);

  if (typeof window !== "undefined") {
    const appHost = String(window.location.hostname || "").trim();
    const appIsLocal = isLocalHost(appHost);
    if (!appIsLocal && isLocalApiUrl(normalizedEnvMediaBase)) {
      return defaultValue;
    }
  }

  return normalizedEnvMediaBase;
}

const API_BASE_URL = getApiBaseUrl();
const parsedApiUrl = safeParseUrl(API_BASE_URL);
const API_REQUEST_BASE_URL = trimTrailingSlash(API_BASE_URL.replace(/\/api\/?$/, ""));
const API_PATH_PREFIX = parsedApiUrl
  ? parsedApiUrl.pathname.replace(/\/api\/?$/, "").replace(/\/+$/, "")
  : "";
const API_ORIGIN = parsedApiUrl
  ? `${parsedApiUrl.origin}${API_PATH_PREFIX}`
  : trimTrailingSlash(API_BASE_URL.replace(/\/api\/?$/, ""));
const SOCKET_BASE_URL = parsedApiUrl ? parsedApiUrl.origin : API_ORIGIN;
const SOCKET_PATH = API_PATH_PREFIX ? `${API_PATH_PREFIX}/socket.io` : "/socket.io";
const MEDIA_BASE_URL = getMediaBaseUrl(API_ORIGIN);
const SOCKET_ENABLED = (() => {
  const envDecision = toBooleanEnv(import.meta.env.VITE_ENABLE_SOCKET);
  if (envDecision !== null) {
    return envDecision;
  }
  if (typeof window === "undefined") {
    return false;
  }
  return isLocalHost(window.location.hostname);
})();

export function resolveMediaUrl(value) {
  const input = String(value || "").trim();
  if (!input) {
    return "";
  }

  if (/^(data|blob):/i.test(input)) {
    return input;
  }

  if (input.startsWith("//")) {
    return `https:${input}`;
  }

  if (/^https?:\/\//i.test(input)) {
    const parsed = safeParseUrl(input);
    if (!parsed) {
      return input;
    }

    if (isLocalHost(parsed.hostname)) {
      const localPath = normalizeMediaPath(parsed.pathname);
      const localWithQuery = `${localPath}${parsed.search || ""}`;
      return localPath ? joinUrl(MEDIA_BASE_URL, localWithQuery) : "";
    }

    if (
      typeof window !== "undefined" &&
      window.location.protocol === "https:" &&
      parsed.protocol === "http:" &&
      parsed.hostname === window.location.hostname
    ) {
      parsed.protocol = "https:";
      return parsed.toString();
    }

    return input;
  }

  const normalizedPath = normalizeMediaPath(input);
  if (!normalizedPath) {
    return "";
  }

  if (parsedApiUrl && normalizedPath.includes("/uploads/") && !normalizedPath.startsWith("/uploads/")) {
    return `${parsedApiUrl.origin}${normalizedPath}`;
  }

  if (API_PATH_PREFIX && normalizedPath.startsWith(`${API_PATH_PREFIX}/`)) {
    return `${parsedApiUrl ? parsedApiUrl.origin : ""}${normalizedPath}`;
  }

  return joinUrl(MEDIA_BASE_URL, normalizedPath);
}

export function apiUrl(path) {
  return `${API_REQUEST_BASE_URL}/api/${String(path || "").replace(/^\/+/, "")}`;
}

export async function apiFetch(path, { method = "GET", body, token, headers = {}, useFormData = false } = {}) {
  const normalizedMethod = String(method || "GET").toUpperCase();
  const options = {
    method: normalizedMethod,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  if (useFormData && body instanceof FormData) {
    options.body = body;
    // Don't set Content-Type header, let the browser set it with boundary
  } else {
    const hasBody = body !== undefined && body !== null;
    if (hasBody) {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }
  }

  const response = await fetch(apiUrl(path), options);

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

export { API_BASE_URL, API_ORIGIN, SOCKET_BASE_URL, SOCKET_PATH, MEDIA_BASE_URL, SOCKET_ENABLED };
