const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const studentsRoutes = require("./routes/students");

const app = express();

// Enable CORS for frontend integration
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/students", studentsRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Server Error:", err.stack);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/studentbigDB";

// Connect DB & Start Server
const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Database Connected Successfully.");
  } catch (err) {
    console.warn("MongoDB connection warning:", err.message);
    console.log("Server will run with fallback database operations.");
  }

  app.listen(PORT, () => {
    console.log(`Express Authentication Server running on port ${PORT}`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = app;
