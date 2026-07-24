const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const { verifyToken, authorize } = require("../middleware/auth");

// READ ALL - Accessible to logged in users (Student or Admin)
router.get("/", verifyToken, authorize("student", "admin"), async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// STUDENT ONLY ROUTE: View personal profile dashboard
router.get("/portal/profile", verifyToken, authorize("student"), async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Student profile data retrieved successfully.",
      student: req.user
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADMIN ONLY ROUTE: Create new student record
router.post("/", verifyToken, authorize("admin"), async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json({
      success: true,
      message: "Student record created by Admin.",
      student
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADMIN ONLY ROUTE: Delete student record
router.delete("/:id", verifyToken, authorize("admin"), async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: "Student Deleted Successfully by Admin."
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// READ ONE
router.get("/:id", verifyToken, authorize("student", "admin"), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE
router.put("/:id", verifyToken, authorize("admin"), async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;