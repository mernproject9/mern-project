const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { generateToken, verifyToken, authorize, authorizeRoles } = require("../middleware/auth");

// POST /api/auth/register - Register student or admin
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    let existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists." });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || "student",
      department: department || "Computer Science & Urban Tech"
    });

    const token = generateToken(user);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        studentIdCode: user.studentIdCode,
        avatar: user.avatar
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login - Login student or admin & issue JWT
router.post("/login", async (req, res) => {
  try {
    const { email, password, requestedRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide both email and password." });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Create demo user dynamically if requested
      const role = requestedRole || (email.includes("admin") ? "admin" : "student");
      user = await User.create({
        name: email.split("@")[0].toUpperCase(),
        email: email.toLowerCase(),
        password: password,
        role: role,
        department: role === "admin" ? "Urban EdTech Administration" : "Computer Science & Artificial Intelligence"
      });
    } else if (user.comparePassword) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials." });
      }
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        studentIdCode: user.studentIdCode,
        avatar: user.avatar,
        streakDays: user.streakDays,
        totalLearningHours: user.totalLearningHours
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me - Retrieve authenticated user profile using verifyToken middleware
router.get("/me", verifyToken, async (req, res) => {
  try {
    if (req.user.id && req.user.id.startsWith("stu_")) {
      return res.json({ success: true, user: req.user, message: "Decoded payload from token" });
    }
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.json({ success: true, user: req.user });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/student-protected - Route protected for student role
router.get("/student-protected", verifyToken, authorize("student"), (req, res) => {
  res.json({
    success: true,
    message: "Access granted to student protected route.",
    user: req.user
  });
});

// GET /api/auth/admin-protected - Route protected for admin role
router.get("/admin-protected", verifyToken, authorize("admin"), (req, res) => {
  res.json({
    success: true,
    message: "Access granted to admin protected route.",
    user: req.user
  });
});

// GET /api/auth/demo-tokens - Utility route providing ready valid JWT tokens for Student and Admin roles
router.get("/demo-tokens", (req, res) => {
  const studentToken = generateToken({
    _id: "student_demo_101",
    name: "Alex Morgan (Student)",
    email: "alex.morgan@urban.edu",
    role: "student"
  });

  const adminToken = generateToken({
    _id: "admin_demo_999",
    name: "Dr. Marcus Sterling (Admin)",
    email: "admin@urban.edu",
    role: "admin"
  });

  res.json({
    message: "Demo JWT Tokens for Testing Role Authorization",
    student: {
      role: "student",
      email: "alex.morgan@urban.edu",
      token: studentToken,
      authorizationHeader: `Bearer ${studentToken}`
    },
    admin: {
      role: "admin",
      email: "admin@urban.edu",
      token: adminToken,
      authorizationHeader: `Bearer ${adminToken}`
    }
  });
});

module.exports = router;
