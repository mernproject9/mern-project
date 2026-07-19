const express = require("express");
const router = express.Router();

const Student = require("../models/Student");
const bcrypt = require("bcryptjs");

// CREATE (Registration)
router.post("/", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if email already exists
    const existingUser = await Student.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const student = await Student.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

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
