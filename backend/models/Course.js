const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  id: String,
  title: String,
  duration: String,
  completed: { type: Boolean, default: false }
});

const moduleSchema = new mongoose.Schema({
  id: String,
  title: String,
  lessons: [lessonSchema]
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  code: String,
  category: String,
  instructor: String,
  instructorRole: String,
  thumbnailGradient: String,
  icon: String,
  estimatedHours: Number,
  totalLessons: Number,
  modules: [moduleSchema]
}, { timestamps: true });

module.exports = mongoose.model("Course", courseSchema);
