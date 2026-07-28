const mongoose = require("mongoose");

/**
 * CourseProgress Schema
 * Tracks individual student course completion metrics, module statuses, and quiz scores
 * used for calculating certificate eligibility based on completion thresholds (100%).
 */
const courseProgressSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completedModules: {
      type: Number,
      default: 0,
    },
    totalModules: {
      type: Number,
      default: 5,
    },
    modules: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        progress: { type: Number, default: 0, min: 0, max: 100 },
        status: {
          type: String,
          enum: ["Not Started", "In Progress", "Completed"],
          default: "Not Started",
        },
        timeSpentHours: { type: Number, default: 0 },
      },
    ],
    quizzes: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        score: { type: Number, default: 0 },
        maxScore: { type: Number, default: 100 },
        passScore: { type: Number, default: 70 },
        status: {
          type: String,
          enum: ["Pending", "Passed", "Failed"],
          default: "Pending",
        },
      },
    ],
    certificateEarned: {
      type: Boolean,
      default: false,
    },
    certificateIssuedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CourseProgress", courseProgressSchema);
