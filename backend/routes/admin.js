const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const Student = require("../models/Student");
const Enrollment = require("../models/Enrollment");
const { verifyToken, authorize } = require("../middleware/auth");

// Apply JWT verification and reusable role authorization middleware to ALL admin endpoints
router.use(verifyToken);
router.use(authorize("admin"));

// GET /api/admin/overview - Admin analytics overview (Admin Only)
router.get("/overview", async (req, res) => {
  try {
    const totalCourses = await Course.countDocuments();
    const totalStudents = await Student.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    const completedEnrollments = await Enrollment.countDocuments({ status: "completed" });
    const activeEnrollments = await Enrollment.countDocuments({ status: "active" });

    const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;

    res.json({
      message: "Admin overview loaded successfully",
      requestedBy: req.user,
      stats: {
        totalCourses,
        totalStudents,
        totalEnrollments,
        activeEnrollments,
        completedCertificates: completedEnrollments,
        overallCompletionRate: completionRate,
        systemHealth: "Optimal",
        platformRegion: "Urban Metro Hubs"
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/courses - Retrieve list of all courses saved in DB (Admin Only)
router.get("/courses", async (req, res) => {
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

// POST /api/admin/courses - Add new course to database (Admin Only)
router.post("/courses", async (req, res) => {
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

    if (!title || !title.trim()) errors.title = "Course title is required.";
    if (!category || !category.trim()) errors.category = "Category is required.";
    if (!description || !description.trim()) errors.description = "Course description is required.";
    if (!duration || !duration.trim()) errors.duration = "Course duration is required.";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed. All required fields (title, description, category, duration) must be provided.",
        errors
      });
    }

    // Auto-generate code if omitted
    let courseCode = code && code.trim() ? code.trim().toUpperCase() : `CRS-${Math.floor(1000 + Math.random() * 9000)}`;

    const existingCourse = await Course.findOne({ code: courseCode });
    if (existingCourse && code && code.trim()) {
      return res.status(400).json({
        success: false,
        message: `Course with code "${courseCode}" already exists.`,
        errors: { code: `Course code "${courseCode}" is already registered in database.` }
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

// PUT /api/admin/courses/:id - Update course details (Admin Only)
router.put("/courses/:id", async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found." });
    }
    res.json({ message: "Course updated successfully", course: updatedCourse });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/courses/:id - Remove course (Admin Only)
router.delete("/courses/:id", async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);
    if (!deletedCourse) {
      return res.status(404).json({ message: "Course not found." });
    }
    // Delete associated enrollments
    await Enrollment.deleteMany({ course: req.params.id });

    res.json({ message: "Course and related enrollments removed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/reports - View enrollment stats and progress reports (Admin Only)
router.get("/reports", async (req, res) => {
  try {
    const enrollments = await Enrollment.find().populate("student").populate("course");

    const reportData = enrollments.map((e) => ({
      enrollmentId: e._id,
      studentName: e.student ? e.student.name : "Unknown Student",
      studentEmail: e.student ? e.student.email : "N/A",
      courseTitle: e.course ? e.course.title : "Unknown Course",
      courseCode: e.course ? e.course.code : "N/A",
      progressPercentage: e.progressPercentage,
      status: e.status,
      lastAccessed: e.lastAccessed
    }));

    res.json({
      reportGeneratedAt: new Date(),
      totalRecords: reportData.length,
      reports: reportData
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/students - List all urban students (Admin Only)
router.get("/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.json({ count: students.length, students });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
