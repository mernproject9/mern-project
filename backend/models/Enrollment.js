const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  completedLessonIds: [{
    type: String
  }],
  progressPercentage: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["active", "completed", "not-started"],
    default: "active"
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
