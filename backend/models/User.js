const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    age: {
      type: Number,
      required: true
    },

    gender: {
      type: String,
      required: true
    },

    height: {
      type: Number,
      required: true
    },

    weight: {
      type: Number,
      required: true
    },

    activity: {
      type: String,
      required: true
    },

    // Primary nutrition goal
    goal: {
      type: String,
      required: true
    },

    // Multiple nutrition goals
    goals: {
      type: [String],
      default: []
    },

    // Food preference
    foodPreference: {
      type: String,
      default: ""
    },

    // Allergies / foods to avoid
    allergies: {
      type: String,
      default: ""
    },

    // ==========================
    // FORGOT PASSWORD
    // ==========================
    resetPasswordToken: {
      type: String,
      default: null
    },

    resetPasswordExpires: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);