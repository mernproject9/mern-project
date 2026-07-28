const express = require("express");
const router = express.Router();

const Student = require("../models/Student");
const bcrypt = require("bcryptjs");

// CREATE / REGISTER Logic Helper
const handleRegistration = async (req, res) => {
  try {
    let { name, email, password, role } = req.body;

    // Validate email presence and format
    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Validate password presence and length
    if (!password || typeof password !== "string" || password.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Validate and sanitize role selection
    const allowedRoles = ["Student", "Instructor", "Admin"];
    if (!role || !allowedRoles.includes(role)) {
      role = "Student";
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if email already exists in MongoDB
    const existingUser = await Student.findOne({
      email: { $regex: new RegExp(`^${cleanEmail}$`, "i") },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Hash password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user with role to MongoDB
    const student = await Student.create({
      name: name && name.trim() ? name.trim() : cleanEmail.split("@")[0],
      email: cleanEmail,
      password: hashedPassword,
      role: role,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful!",
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Server Error",
    });
  }
};

// CREATE (Registration endpoint)
router.post("/", handleRegistration);
router.post("/register", handleRegistration);

// READ ALL
router.get("/", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// READ ONE
router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    res.json(student);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(student);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);

    res.json({
      message: "Student Deleted Successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;
