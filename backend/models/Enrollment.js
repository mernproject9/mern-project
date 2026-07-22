const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completedModules: {
      type: [String], // Array of completed module names
      default: [],
    },
    status: {
      type: String,
      enum: ["enrolled", "completed"],
      default: "enrolled",
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    certificateId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null/undefined certificateIds
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a student can only enroll in a course once
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
