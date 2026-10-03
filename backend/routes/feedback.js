const express = require("express");
const Feedback = require("../models/Feedback");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ============================================================
// SUBMIT FEEDBACK
// ============================================================

router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      rating,
      helpfulness,
      usefulFeatures,
      improvement,
      useAgain
    } = req.body;

    // Validate required fields
    if (!rating || !helpfulness || !useAgain) {
      return res.status(400).json({
        message: "Please complete the required feedback fields."
      });
    }

    const feedback = new Feedback({
      userId: req.userId,
      rating: Number(rating),
      helpfulness,
      usefulFeatures: Array.isArray(usefulFeatures)
        ? usefulFeatures
        : [],
      improvement: improvement || "",
      useAgain
    });

    await feedback.save();

    return res.status(201).json({
      message: "Feedback submitted successfully!",
      feedback
    });

  } catch (error) {
    console.error("Feedback error:", error);

    return res.status(500).json({
      message: "Failed to submit feedback."
    });
  }
});

module.exports = router;