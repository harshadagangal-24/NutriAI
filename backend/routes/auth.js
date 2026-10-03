const express = require("express");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const crypto = require("crypto");

const { Resend } = require("resend");

const User = require("../models/User");

const authMiddleware = require("../middleware/authMiddleware");


const router = express.Router();


// ==========================
// EMAIL TRANSPORTER
// ==========================

const resend = new Resend(process.env.RESEND_API_KEY);


// ==========================
// REGISTER
// ==========================

router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      age,
      gender,
      height,
      weight,
      activity,
      goal,
      goals,
      foodPreference,
      allergies
    } = req.body;


    const existingUser = await User.findOne({ email });


    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    const user = new User({
      name,
      email,
      password: hashedPassword,
      age,
      gender,
      height,
      weight,
      activity,
      goal,
      goals: Array.isArray(goals) ? goals : goal ? [goal] : [],
      foodPreference: foodPreference || "",
      allergies: allergies || ""
    });


    await user.save();


    res.status(201).json({
      message: "Registration successful!"
    });


  } catch (error) {
    console.log(error);


    res.status(500).json({
      message: "Server error during registration"
    });
  }
});


// ==========================
// LOGIN
// ==========================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;


    const user = await User.findOne({ email });


    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }


    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );


    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }


    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );


    res.json({
      message: "Login successful!",
      token,


      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        activity: user.activity,

        // Primary goal
        goal: user.goal,

        // Multiple goals
        goals: user.goals || (user.goal ? [user.goal] : []),

        // Food preference
        foodPreference: user.foodPreference || "",

        // Allergies
        allergies: user.allergies || ""
      }
    });


  } catch (error) {
    console.log(error);


    res.status(500).json({
      message: "Server error during login"
    });
  }
});


// ==========================
// UPDATE USER PROFILE
// ==========================

router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      height,
      weight,
      activity,
      goal,
      goals,
      foodPreference,
      allergies
    } = req.body;


    const user = await User.findById(req.userId);


    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }


    user.name = name;
    user.age = age;
    user.gender = gender;
    user.height = height;
    user.weight = weight;
    user.activity = activity;


    // Save primary goal
    user.goal = goal;


    // Save all selected goals
    user.goals = Array.isArray(goals)
      ? goals
      : goal
      ? [goal]
      : [];


    // Save food preference
    user.foodPreference = foodPreference || "";

    // Save allergies
    user.allergies = allergies || "";


    await user.save();


    res.json({
      message: "Profile updated successfully!",


      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        activity: user.activity,


        goal: user.goal,

        goals: user.goals || [],

        foodPreference: user.foodPreference || "",

        allergies: user.allergies || ""
      }
    });


  } catch (error) {
    console.error("Profile update error:", error);


    res.status(500).json({
      message: "Failed to update profile"
    });
  }
});


// ==========================
// CHANGE PASSWORD
// ==========================

router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword
    } = req.body;


    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Please enter current and new password"
      });
    }


    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters"
      });
    }


    const user = await User.findById(req.userId);


    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }


    const isCurrentPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );


    if (!isCurrentPasswordCorrect) {
      return res.status(400).json({
        message: "Current password is incorrect"
      });
    }


    const hashedNewPassword = await bcrypt.hash(
      newPassword,
      10
    );


    user.password = hashedNewPassword;


    await user.save();


    res.json({
      message: "Password changed successfully!"
    });


  } catch (error) {
    console.error("Change password error:", error);


    res.status(500).json({
      message: "Failed to change password"
    });
  }
});


// ==========================
// FORGOT PASSWORD
// ==========================

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;


    if (!email) {
      return res.status(400).json({
        message: "Please enter your email address"
      });
    }


    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });


    if (!user) {
      return res.json({
        message:
          "If an account with that email exists, a password reset link has been sent."
      });
    }


    const resetToken = crypto.randomBytes(32).toString("hex");


    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");


    user.resetPasswordExpires =
      Date.now() + 15 * 60 * 1000;


    await user.save();


    const resetLink =
  `https://nutri-ai-tth8.vercel.app/reset-password/${resetToken}`;


    await resend.emails.send({
  from: "NutriAI <onboarding@resend.dev>",
  to: user.email,
  subject: "NutriAI - Password Reset",
  html: `
    <div style="
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: auto;
      padding: 30px;
      background-color: #111111;
      color: #ffffff;
      border-radius: 12px;
    ">

      <h2 style="margin-bottom: 10px;">
        NutriAI Password Reset
      </h2>

      <p>
        Hello ${user.name},
      </p>

      <p>
        We received a request to reset your NutriAI password.
      </p>

      <p>
        Click the button below to create a new password:
      </p>

      <a
        href="${resetLink}"
        style="
          display: inline-block;
          padding: 12px 20px;
          background-color: #ffffff;
          color: #000000;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          margin: 15px 0;
        "
      >
        Reset Password
      </a>

      <p>
        This link will expire in <strong>15 minutes</strong>.
      </p>

      <p>
        If you did not request a password reset,
        you can safely ignore this email.
      </p>

      <p style="margin-top: 25px;">
        — NutriAI Team
      </p>

    </div>
  `
});


    res.json({
      message:
        "If an account with that email exists, a password reset link has been sent."
    });


  } catch (error) {
    console.error("Forgot password error:", error);


    res.status(500).json({
      message:
        "Failed to send password reset email. Please try again."
    });
  }
});


// ==========================
// RESET PASSWORD
// ==========================

router.post("/reset-password", async (req, res) => {
  try {
    const {
      token,
      newPassword
    } = req.body;


    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Please provide the reset token and new password"
      });
    }


    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters"
      });
    }


    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");


    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: {
        $gt: Date.now()
      }
    });


    if (!user) {
      return res.status(400).json({
        message:
          "Password reset link is invalid or has expired"
      });
    }


    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );


    user.password = hashedPassword;


    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;


    await user.save();


    res.json({
      message:
        "Password reset successfully! You can now log in with your new password."
    });


  } catch (error) {
    console.error("Reset password error:", error);


    res.status(500).json({
      message: "Failed to reset password"
    });
  }
});


// ==========================
// EXPORT ROUTER
// ==========================

module.exports = router;