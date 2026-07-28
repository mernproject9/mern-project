const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    required: true,
  },
  instructor: {
    type: String,
    default: "Intern Nexus"
  },
  category: {
    type: String,
    default: "General"
  },
  rating: {
    type: String,
    default: "⭐ 4.8"
  },
  price: {
    type: String,
    default: "Free"
  },
  image: {
    type: String,
    default: "📚"
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    default: "8 Weeks"
  },
  level: {
    type: String,
    default: "Beginner"
  }
}, { timestamps: true });

module.exports = mongoose.model("Course", courseSchema);

