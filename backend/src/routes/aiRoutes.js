const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { answerFromDocumentation } = require("../services/aiService");

const router = express.Router();

router.post(
  "/chat",
  asyncHandler(async (req, res) => {
    const { question } = req.body;
    if (!question || String(question).trim().length < 3) {
      return res.status(400).json({ message: "A valid question is required." });
    }

    const answer = await answerFromDocumentation(String(question).trim());
    return res.json({
      data: answer,
    });
  }),
);

module.exports = router;
