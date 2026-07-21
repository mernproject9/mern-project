const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const { protect, optionalAuth, admin } = require("../middleware/auth");

// @desc    Get all courses (with optional search and category filters)
// @route   GET /courses
// @access  Public (Optional Auth)
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const courses = await Course.find(query);
    res.json(courses);
  } catch (error) {
    console.error("Fetch courses error:", error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single course by ID
// @route   GET /courses/:id
// @access  Public (Optional Auth)
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Course not found" });
    }
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (error) {
    console.error("Get course error:", error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Enroll in a course by ID
// @route   POST /courses/:id/enroll
// @access  Private
router.post("/:id/enroll", protect, async (req, res) => {
  const courseId = req.params.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if already enrolled
    const alreadyEnrolled = await Enrollment.findOne({
      studentId: req.user._id,
      courseId,
    });

    if (alreadyEnrolled) {
      return res.status(400).json({ message: "You are already enrolled in this course" });
    }

    const enrollment = await Enrollment.create({
      studentId: req.user._id,
      courseId,
      progress: 0,
      completedModules: [],
      status: "enrolled",
    });

    // Populate course details and return
    const populated = await Enrollment.findById(enrollment._id).populate("courseId");

    return res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "You are already enrolled in this course" });
    }
    console.error("Enrollment error:", error);
    return res.status(500).json({ message: error.message });
  }
});

// @desc    Create a new course
// @route   POST /courses
// @access  Private/Admin
router.post("/", protect, admin, async (req, res) => {
  const { title, description, category, duration, instructor, modules, imageUrl } = req.body;

  try {
    if (!title || !description || !category || !duration || !instructor || !modules) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // Convert modules to array if it is passed differently
    let moduleList = modules;
    if (typeof modules === "string") {
      moduleList = modules.split(",").map((m) => m.trim());
    }

    const course = await Course.create({
      title,
      description,
      category,
      duration,
      instructor,
      modules: moduleList,
      imageUrl: imageUrl || "",
    });

    res.status(201).json(course);
  } catch (error) {
    console.error("Create course error:", error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update course
// @route   PUT /courses/:id
// @access  Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const { title, description, category, duration, instructor, modules, imageUrl } = req.body;

    course.title = title || course.title;
    course.description = description || course.description;
    course.category = category || course.category;
    course.duration = duration || course.duration;
    course.instructor = instructor || course.instructor;
    if (modules) {
      course.modules = typeof modules === "string" ? modules.split(",").map((m) => m.trim()) : modules;
    }
    course.imageUrl = imageUrl !== undefined ? imageUrl : course.imageUrl;

    const updatedCourse = await course.save();
    res.json(updatedCourse);
  } catch (error) {
    console.error("Update course error:", error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete course
// @route   DELETE /courses/:id
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    await course.remove ? await course.remove() : await Course.findByIdAndDelete(req.params.id);
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
