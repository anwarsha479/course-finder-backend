const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const serverless = require("serverless-http");

// Load .env from the root directory
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
app.use(cors());

// MongoDB Connection
console.log("🔍 Checking MONGO_URI...");
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is undefined. Check your .env file.");
  process.exit(1);
}
console.log("✅ MONGO_URI detected. Connecting...");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Successfully connected to MongoDB Atlas");

    // Start the scheduler ONLY after DB connection is established
    require('../scheduler'); // Ensure this path is correct from the 'api' folder
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Routes
const courseRoutes = require("../../routes/courses");  // Correct path to courses.js
app.use("/api/courses", courseRoutes);

// Export the serverless function to be used by Vercel
module.exports.handler = serverless(app);
