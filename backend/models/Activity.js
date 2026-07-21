const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    timeSpentMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    modulesCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    activityType: {
      type: String,
      enum: ["module_completion", "study_session", "quiz", "reading"],
      default: "study_session",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying by student and timestamp range
activitySchema.index({ studentId: 1, timestamp: -1 });

module.exports = mongoose.model("Activity", activitySchema);
