const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
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

export async function apiFetch(path, { method = "GET", body, token, headers = {} } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

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
