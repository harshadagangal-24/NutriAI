const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot be more than 5"]
    },

    helpfulness: {
      type: String,
      required: [true, "Helpfulness is required"]
    },

    usefulFeatures: {
      type: [String],
      default: []
    },

    improvement: {
      type: String,
      default: ""
    },

    useAgain: {
      type: String,
      required: [true, "Please specify if you would use NutriAI again"]
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Feedback", feedbackSchema);