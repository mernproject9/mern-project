const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  studentId: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  courseId: {
    type: String,
    required: true
  },
  courseTitle: {
    type: String,
    required: true
  },
  instructorName: {
    type: String,
    default: "Lead Instructor"
  },
  instructorRole: {
    type: String,
    default: "Principal Educator"
  },
  completionDate: {
    type: Date,
    default: Date.now
  },
  pdfPath: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model("Certificate", certificateSchema);
