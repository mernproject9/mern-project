const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const { protect, admin } = require("../middleware/auth");

// @desc    Get all courses (with optional search and category filters)
// @route   GET /courses
// @access  Private
router.get("/", protect, async (req, res) => {
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
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
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
