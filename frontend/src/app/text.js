export function normalizeText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncateText(value, maxLength = 140) {
  const normalized = normalizeText(value);
  if (!normalized) {
    return "";
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const safeLimit = Math.max(1, maxLength - 3);
  const sliced = normalized.slice(0, safeLimit);
  const wordBoundary = sliced.lastIndexOf(" ");
  const compact = wordBoundary > 40 ? sliced.slice(0, wordBoundary) : sliced;
  return `${compact.trimEnd()}...`;
}
