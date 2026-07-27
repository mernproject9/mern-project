const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Student = require("../models/Student");
const { verifyToken, JWT_SECRET } = require("../middleware/auth");

// Helper to seed default users if collection is empty
const seedDefaultUsers = async () => {
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      const hashedPassword1 = await bcrypt.hash("password123", 10);
      const hashedPassword2 = await bcrypt.hash("admin123", 10);

      // Create default student user
      const defaultStudent = await User.create({
        name: "Alex Morgan",
        email: "student@urban.edu",
        password: hashedPassword1,
        role: "student",
        department: "Computer Science & AI"
      });

      // Also ensure Student record exists
      await Student.create({
        _id: defaultStudent._id,
        name: defaultStudent.name,
        email: defaultStudent.email,
        age: 22
      }).catch(() => {});

      // Create default admin user
      await User.create({
        name: "Admin User",
        email: "admin@urban.edu",
        password: hashedPassword2,
        role: "admin",
        department: "EdTech Platform Admin"
      });

      console.log("Default seed users created successfully (student@urban.edu / admin@urban.edu)");
    }
  } catch (err) {
    console.error("Error seeding default users:", err.message);
  }
};

// Seed on route load
seedDefaultUsers();

// @route   POST /api/auth/register
// @desc    Register a new user (student or admin)
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, age, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide name, email, and password." });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userRole = role === "admin" ? "admin" : "student";

    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: userRole,
      department: department || (userRole === "admin" ? "Platform Administration" : "Computer Science & AI")
    });

    // Create Student record if student role
    if (userRole === "student") {
      await Student.create({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        age: age ? Number(age) : 22
      }).catch((e) => console.log("Student create note:", e.message));
    }

    // Sign JWT token containing user ID and role in payload
    const tokenPayload = {
      id: newUser._id,
      role: newUser.role,
      email: newUser.email,
      name: newUser.name
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        avatar: newUser.avatar
      }
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error during registration: " + err.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get JWT token (includes ID & Role in payload)
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter both email and password." });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find user by email
    let user = await User.findOne({ email: cleanEmail });

    // Fallback: If demo email alex.morgan@university.edu is used
    if (!user && (cleanEmail === "alex.morgan@university.edu" || cleanEmail === "alex@urban.edu")) {
      user = await User.findOne({ email: "student@urban.edu" });
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials. User with this email does not exist." });
    }

    // Match password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials. Password incorrect." });
    }

    // Build JWT payload with ID and role
    const tokenPayload = {
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name
    };

    // Issue JWT
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login: " + err.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user details from JWT token
// @access  Private
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user, decodedTokenPayload: req.user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
