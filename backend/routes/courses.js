const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const { verifyToken, authorize } = require("../middleware/auth");

// GET /api/courses - List all courses saved in MongoDB
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/courses/:id - Get specific course details by ID
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }
    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/courses - Create Express route to accept new course data and save to MongoDB (Admin Only)
router.post("/", verifyToken, authorize("admin"), async (req, res) => {
  try {
    const {
      title,
      code,
      category,
      description,
      duration,
      estimatedHours,
      instructor,
      instructorRole,
      thumbnailGradient,
      icon,
      modules
    } = req.body;

    const errors = {};

    // Validate incoming data
    if (!title || !title.trim()) errors.title = "Course title is required.";
    if (!category || !category.trim()) errors.category = "Category is required.";
    if (!description || !description.trim()) errors.description = "Course description is required.";
    if (!duration || !duration.trim()) errors.duration = "Course duration is required.";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed. Please provide all required fields (title, description, category, duration).",
        errors
      });
    }

    // Auto-generate course code if omitted
    let courseCode = code && code.trim() ? code.trim().toUpperCase() : `CRS-${Math.floor(1000 + Math.random() * 9000)}`;

    const existingCourse = await Course.findOne({ code: courseCode });
    if (existingCourse && code && code.trim()) {
      return res.status(400).json({
        success: false,
        message: `Course with code "${courseCode}" already exists.`,
        errors: { code: `Course code "${courseCode}" is already registered.` }
      });
    } else if (existingCourse) {
      courseCode = `CRS-${Date.now().toString().slice(-4)}`;
    }

    const parsedHours = Number(estimatedHours) || Number(String(duration).replace(/[^0-9.]/g, "")) || 10;
    const durationStr = duration.trim();

    const defaultModules = modules && modules.length > 0 ? modules : [
      {
        id: "m1",
        title: "Module 1: Core Fundamentals & Overview",
        lessons: [
          { id: `l_${Date.now()}_1`, title: "Introduction & Setup", duration: "45m", completed: false },
          { id: `l_${Date.now()}_2`, title: "Core Concepts & Architecture", duration: "50m", completed: false }
        ]
      }
    ];

    const totalL = defaultModules.reduce((sum, m) => sum + (m.lessons ? m.lessons.length : 0), 0);

    // Save course to MongoDB database
    const newCourse = await Course.create({
      title: title.trim(),
      code: courseCode,
      category: category.trim(),
      description: description.trim(),
      duration: durationStr,
      estimatedHours: parsedHours,
      instructor: (instructor && instructor.trim()) || "Urban EdTech Faculty",
      instructorRole: instructorRole || "Senior Instructor",
      thumbnailGradient: thumbnailGradient || "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
      icon: icon || "code",
      totalLessons: totalL,
      modules: defaultModules
    });

    res.status(201).json({
      success: true,
      message: `Course "${newCourse.title}" created successfully and saved to database.`,
      course: newCourse
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
