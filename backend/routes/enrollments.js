const express = require("express");
const router = express.Router();
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const User = require("../models/User");
const { protect, adminOnly } = require("../middleware/auth");

// @route   POST /enrollments
// @desc    Enroll in a course
// @access  Private
router.post("/", protect, async (req, res) => {
  const { courseId } = req.body;

  try {
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if student is already enrolled
    const alreadyEnrolled = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
    });

    if (alreadyEnrolled) {
      return res.status(400).json({ message: "Already enrolled in this course" });
    }

    // Create enrollment
    const enrollment = new Enrollment({
      student: req.user._id,
      course: courseId,
      progress: 0,
      completedModules: [],
      status: "enrolled",
    });

    const savedEnrollment = await enrollment.save();
    // Populate course details before sending back
    const populated = await Enrollment.findById(savedEnrollment._id).populate("course");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /enrollments/my
// @desc    Get current user's enrollments
// @access  Private
router.get("/my", protect, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate("course")
      .sort({ createdAt: -1 });
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /enrollments/:id/progress
// @desc    Update progress of a course enrollment
// @access  Private
router.put("/:id/progress", protect, async (req, res) => {
  const { completedModules } = req.body;

  try {
    const enrollment = await Enrollment.findById(req.id || req.params.id).populate("course");

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    // Verify ownership
    if (enrollment.student.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this progress" });
    }

    enrollment.completedModules = completedModules || [];

    const totalModules = enrollment.course.modules ? enrollment.course.modules.length : 0;
    if (totalModules === 0) {
      enrollment.progress = 100;
    } else {
      const completedCount = enrollment.completedModules.filter(m => 
        enrollment.course.modules.includes(m)
      ).length;
      enrollment.progress = Math.round((completedCount / totalModules) * 100);
    }

    if (enrollment.progress === 100) {
      enrollment.status = "completed";
      if (!enrollment.completedAt) {
        enrollment.completedAt = Date.now();
      }
    } else {
      enrollment.status = "enrolled";
      enrollment.completedAt = undefined;
    }

    const updatedEnrollment = await enrollment.save();
    res.json(updatedEnrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /enrollments/admin/stats
// @desc    Get aggregate metrics for admin charts
// @access  Private/Admin
router.get("/admin/stats", protect, adminOnly, async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    const totalCompleted = await Enrollment.countDocuments({ status: "completed" });

    // Course-wise enrollments
    const enrollments = await Enrollment.find().populate("course");
    const courseEnrollmentCounts = {};
    const categoryCounts = {};

    enrollments.forEach((enrollment) => {
      if (enrollment.course) {
        const title = enrollment.course.title;
        const category = enrollment.course.category;
        courseEnrollmentCounts[title] = (courseEnrollmentCounts[title] || 0) + 1;
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
    });

    res.json({
      totalStudents,
      totalCourses,
      totalEnrollments,
      totalCompleted,
      totalActive: totalEnrollments - totalCompleted,
      courseEnrollments: Object.entries(courseEnrollmentCounts).map(([title, count]) => ({
        title,
        count,
      })),
      categoryEnrollments: Object.entries(categoryCounts).map(([category, count]) => ({
        category,
        count,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /enrollments/admin/reports
// @desc    Get all progress reports for admin
// @access  Private/Admin
router.get("/admin/reports", protect, adminOnly, async (req, res) => {
  try {
    const reports = await Enrollment.find()
      .populate("student", "name email")
      .populate("course", "title category instructor modules")
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
