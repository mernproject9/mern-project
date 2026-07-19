const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const { protect, adminOnly } = require("../middleware/auth");

// @route   GET /courses
// @desc    Get all courses
// @access  Public
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /courses/:id
// @desc    Get course by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /courses
// @desc    Create a new course
// @access  Private/Admin
router.post("/", protect, adminOnly, async (req, res) => {
  const { title, description, instructor, category, duration, modules } = req.body;

  try {
    const course = new Course({
      title,
      description,
      instructor,
      category,
      duration,
      modules: modules || [],
    });

    const createdCourse = await course.save();
    res.status(201).json(createdCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /courses/:id
// @desc    Update a course
// @access  Private/Admin
router.put("/:id", protect, adminOnly, async (req, res) => {
  const { title, description, instructor, category, duration, modules } = req.body;

  try {
    const course = await Course.findById(req.params.id);

    if (course) {
      course.title = title || course.title;
      course.description = description || course.description;
      course.instructor = instructor || course.instructor;
      course.category = category || course.category;
      course.duration = duration || course.duration;
      course.modules = modules || course.modules;

      const updatedCourse = await course.save();
      res.json(updatedCourse);
    } else {
      res.status(404).json({ message: "Course not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /courses/:id
// @desc    Delete a course
// @access  Private/Admin
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (course) {
      await course.remove ? await course.remove() : await Course.deleteOne({ _id: req.params.id });
      res.json({ message: "Course removed successfully" });
    } else {
      res.status(404).json({ message: "Course not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
