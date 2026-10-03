const feedbackRoutes = require("./routes/feedback");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables BEFORE importing routes
dotenv.config();

const authRoutes = require("./routes/auth");
const aiRoutes = require("./ai");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 15000,
    tls: true
  })
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((error) => {
    console.log("MongoDB connection failed!");
    console.log("Error name:", error.name);
    console.log("Error message:", error.message);
  });

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/feedback", feedbackRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("NutriAI Backend is running!");
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`NutriAI Backend running on port ${PORT}`);
});