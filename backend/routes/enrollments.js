const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const User = require("../models/User");
const { protect, admin } = require("../middleware/auth");

// @desc    Enroll in a course
// @route   POST /enrollments
// @access  Private (Learner only or any protect user)
router.post("/", protect, async (req, res) => {
  const { courseId } = req.body;

  try {
    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required" });
    }

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

// @desc    Get current user's enrollments
// @route   GET /enrollments/my
// @access  Private
router.get("/my", protect, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user._id })
      .populate("courseId")
      .sort("-enrolledAt");
    res.json(enrollments);
  } catch (error) {
    console.error("Get enrollments error:", error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get current user's specific course enrollment details
// @route   GET /enrollments/my/:courseId
// @access  Private
router.get("/my/:courseId", protect, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      studentId: req.user._id,
      courseId: req.params.courseId,
    }).populate("courseId");

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found for this course" });
    }

    res.json(enrollment);
  } catch (error) {
    console.error("Get specific enrollment error:", error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update progress in a course
// @route   PUT /enrollments/my/:courseId/progress
// @access  Private
router.put("/my/:courseId/progress", protect, async (req, res) => {
  const { completedModules } = req.body; // Array of module names completed

  try {
    const enrollment = await Enrollment.findOne({
      studentId: req.user._id,
      courseId: req.params.courseId,
    });

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Verify all completed modules actually exist in the course
    const validCompleted = completedModules.filter((mod) =>
      course.modules.includes(mod)
    );

    const totalModulesCount = course.modules.length;
    const progressPercent = Math.round(
      (validCompleted.length / totalModulesCount) * 100
    );

    enrollment.completedModules = validCompleted;
    enrollment.progress = progressPercent;

    if (progressPercent === 100) {
      if (enrollment.status !== "completed") {
        enrollment.status = "completed";
        enrollment.completedAt = Date.now();
        // Generate a certificate ID
        const dateStr = Date.now().toString(36).toUpperCase();
        const rand = Math.floor(100 + Math.random() * 900);
        enrollment.certificateId = `UL-${course._id.toString().substring(18).toUpperCase()}-${req.user._id.toString().substring(18).toUpperCase()}-${dateStr}-${rand}`;
      }
    } else {
      enrollment.status = "enrolled";
      enrollment.completedAt = undefined;
      enrollment.certificateId = undefined;
    }

    const updated = await enrollment.save();
    const populated = await Enrollment.findById(updated._id).populate("courseId");

    res.json(populated);
  } catch (error) {
    console.error("Update progress error:", error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get user-specific education metrics & stats
// @route   GET /enrollments/stats
// @access  Private
router.get("/stats", protect, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user._id }).populate("courseId");
    
    const totalEnrollments = enrollments.length;
    const completedCourses = enrollments.filter(e => e.status === "completed").length;
    const inProgressCourses = totalEnrollments - completedCourses;
    
    // Average progress
    const avgProgress = totalEnrollments > 0 
      ? Math.round(enrollments.reduce((acc, curr) => acc + curr.progress, 0) / totalEnrollments)
      : 0;

    // Categorized progress
    const categories = {};
    enrollments.forEach(e => {
      if (e.courseId && e.courseId.category) {
        const cat = e.courseId.category;
        categories[cat] = (categories[cat] || 0) + 1;
      }
    });

    res.json({
      totalEnrollments,
      completedCourses,
      inProgressCourses,
      avgProgress,
      categories,
      courseProgressList: enrollments.map(e => ({
        courseTitle: e.courseId ? e.courseId.title : "Unknown",
        progress: e.progress,
        status: e.status
      }))
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get admin global education metrics
// @route   GET /enrollments/admin/stats
// @access  Private/Admin
router.get("/admin/stats", protect, admin, async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "learner" });
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();

    // Get status breakdown
    const completedEnrollments = await Enrollment.countDocuments({ status: "completed" });
    const activeEnrollments = totalEnrollments - completedEnrollments;

    // Get enrollment stats per course
    const enrollments = await Enrollment.find().populate("courseId");
    const courseStatsMap = {};
    const categoryStatsMap = {};

    enrollments.forEach((e) => {
      if (e.courseId) {
        const title = e.courseId.title;
        const category = e.courseId.category;
        
        courseStatsMap[title] = (courseStatsMap[title] || 0) + 1;
        categoryStatsMap[category] = (categoryStatsMap[category] || 0) + 1;
      }
    });

    const coursesBreakdown = Object.keys(courseStatsMap).map((title) => ({
      courseTitle: title,
      enrollments: courseStatsMap[title],
    }));

    const categoriesBreakdown = Object.keys(categoryStatsMap).map((cat) => ({
      category: cat,
      count: categoryStatsMap[cat],
    }));

    res.json({
      totalStudents,
      totalCourses,
      totalEnrollments,
      completedEnrollments,
      activeEnrollments,
      coursesBreakdown,
      categoriesBreakdown,
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all students' progress reports (Admin only)
// @route   GET /enrollments/admin/reports
// @access  Private/Admin
router.get("/admin/reports", protect, admin, async (req, res) => {
  try {
    const reports = await Enrollment.find()
      .populate("studentId", "name email")
      .populate("courseId", "title category instructor modules")
      .sort("-enrolledAt");

    const formattedReports = reports.map((r) => ({
      enrollmentId: r._id,
      studentName: r.studentId ? r.studentId.name : "Removed User",
      studentEmail: r.studentId ? r.studentId.email : "N/A",
      courseTitle: r.courseId ? r.courseId.title : "Removed Course",
      category: r.courseId ? r.courseId.category : "N/A",
      instructor: r.courseId ? r.courseId.instructor : "N/A",
      progress: r.progress,
      status: r.status,
      enrolledAt: r.enrolledAt,
      completedAt: r.completedAt,
      certificateId: r.certificateId,
    }));

    res.json(formattedReports);
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
