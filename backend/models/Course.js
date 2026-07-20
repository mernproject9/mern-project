const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  duration: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const moduleSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  lessons: [lessonSchema],
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  code: { type: String, required: true },
  category: { type: String, required: true },
  instructor: { type: String, required: true },
  instructorRole: { type: String, default: "Senior Instructor" },
  thumbnailGradient: { type: String, default: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" },
  icon: { type: String, default: "code" },
  totalLessons: { type: Number, default: 0 },
  estimatedHours: { type: Number, default: 10 },
  modules: [moduleSchema],
}, { timestamps: true });

module.exports = mongoose.model("Course", courseSchema);
