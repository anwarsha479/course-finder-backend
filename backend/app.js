const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load .env from parent directory
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
    require('./scheduler');

    // Start the server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Routes
const courseRoutes = require("./routes/courses");
app.use("/api/courses", courseRoutes);
