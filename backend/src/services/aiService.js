const { query } = require("../config/database");
const { splitIntoChunks } = require("../utils/chunker");

const FALLBACK_ANSWER =
  "I don’t have that information in Silver Shield’s documentation yet. Please contact us or ask an admin to update the docs.";

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 2);
}

function calcScore(questionWords, chunkText) {
  const chunkWords = tokenize(chunkText);
  if (!chunkWords.length) {
    return 0;
  }

  const chunkSet = new Set(chunkWords);
  let matchCount = 0;
  for (const word of questionWords) {
    if (chunkSet.has(word)) {
      matchCount += 1;
    }
  }

  const overlap = matchCount / Math.max(1, questionWords.length);
  const density = matchCount / Math.max(1, chunkWords.length);
  return overlap * 0.8 + density * 0.2;
}

function extractSupportSentences(question, chunks) {
  const qWords = tokenize(question);
  const sentencePool = [];

  for (const chunk of chunks) {
    const sentences = String(chunk.chunkText || "").split(/(?<=[.!?])\s+/);
    for (const sentence of sentences) {
      const score = calcScore(qWords, sentence);
      if (score > 0) {
        sentencePool.push({
          sentence: sentence.trim(),
          score,
        });
      }
    }
  }

  sentencePool.sort((a, b) => b.score - a.score);
  const picked = [];

  for (const candidate of sentencePool) {
    if (!candidate.sentence) {
      continue;
    }
    if (!picked.includes(candidate.sentence)) {
      picked.push(candidate.sentence);
    }
    if (picked.length >= 4) {
      break;
    }
  }

  return picked;
}

async function reindexDocument(docId, content) {
  const chunks = splitIntoChunks(content);
  await query("DELETE FROM doc_chunks WHERE docId = ?", [docId]);

  if (!chunks.length) {
    return { chunksCount: 0 };
  }

  let index = 0;
  for (const chunkText of chunks) {
    index += 1;
    await query(
      `
      INSERT INTO doc_chunks (docId, chunkText, chunkIndex, tokenCount, vectorRef)
      VALUES (?, ?, ?, ?, ?)
      `,
      [docId, chunkText, index, tokenize(chunkText).length, null],
    );
  }

  return { chunksCount: chunks.length };
}

async function retrieveRelevantChunks(question, limit = 5) {
  const allChunks = await query(
    `
    SELECT
      dc.id,
      dc.docId,
      dc.chunkText,
      d.title AS docTitle,
      d.category AS docCategory
    FROM doc_chunks dc
    INNER JOIN docs d ON d.id = dc.docId
    WHERE d.isPublished = 1
    `,
  );

  const questionWords = tokenize(question);
  const scored = allChunks
    .map((chunk) => ({
      ...chunk,
      score: calcScore(questionWords, chunk.chunkText),
    }))
    .filter((chunk) => chunk.score > 0.06)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}

async function answerFromDocumentation(question) {
  const chunks = await retrieveRelevantChunks(question, 5);
  if (!chunks.length) {
    return {
      answer: FALLBACK_ANSWER,
      sources: [],
      grounded: false,
    };
  }

  const supportingSentences = extractSupportSentences(question, chunks);
  const text =
    supportingSentences.length > 0
      ? supportingSentences.join(" ")
      : chunks[0].chunkText;

  return {
    answer: text || FALLBACK_ANSWER,
    sources: [...new Set(chunks.map((chunk) => chunk.docTitle))],
    grounded: Boolean(text),
  };
}

module.exports = {
  FALLBACK_ANSWER,
  reindexDocument,
  answerFromDocumentation,
};
