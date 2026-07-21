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

// POST /api/admin/courses - Add new course (Admin Only)
router.post("/courses", async (req, res) => {
  try {
    const { title, code, category, instructor, instructorRole, thumbnailGradient, icon, estimatedHours, modules } = req.body;

    if (!title || !code) {
      return res.status(400).json({ message: "Course title and code are required." });
    }

    const existingCourse = await Course.findOne({ code: code.toUpperCase() });
    if (existingCourse) {
      return res.status(400).json({ message: `Course with code ${code} already exists.` });
    }

    const totalL = modules ? modules.reduce((sum, m) => sum + (m.lessons ? m.lessons.length : 0), 0) : 10;

    const newCourse = await Course.create({
      title,
      code: code.toUpperCase(),
      category: category || "General",
      instructor: instructor || "EdTech Staff",
      instructorRole: instructorRole || "Course Lead",
      thumbnailGradient: thumbnailGradient || "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
      icon: icon || "code",
      estimatedHours: estimatedHours || 30,
      totalLessons: totalL,
      modules: modules || []
    });

    res.status(201).json({
      message: "Course created successfully by Admin",
      course: newCourse
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
