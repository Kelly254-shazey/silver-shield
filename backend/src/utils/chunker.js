function splitIntoChunks(text, maxChunkLength = 700) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (!clean) {
    return [];
  }

  const sentences = clean.split(/(?<=[.!?])\s+/);
  const chunks = [];
  let current = "";

  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length > maxChunkLength && current) {
      chunks.push(current);
      current = sentence;
    } else {
      current = candidate;
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

module.exports = {
  splitIntoChunks,
};
