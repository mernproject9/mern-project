const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Student = require("../models/Student");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

// Fallback seed list of user enrolled courses
const fallbackEnrolledCourses = [
  {
    id: "c_mern",
    _id: "c_mern",
    title: "Full-Stack MERN Architecture & React 19",
    code: "CS-401",
    category: "Web Development",
    instructor: "Dr. Sarah Jenkins",
    instructorRole: "Principal Systems Architect & Lead Educator",
    thumbnailGradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
    totalLessons: 10,
    completedLessons: 6,
    progressPercentage: 60,
    status: "in-progress",
    nextLesson: {
      moduleTitle: "Module 2: Node.js & Express RESTful API",
      lessonTitle: "MongoDB Atlas & Mongoose Schemas",
      duration: "60m"
    },
    modules: [
      {
        id: "m1",
        title: "Module 1: React 19 Fundamentals & Modern Hooks",
        lessons: [
          { id: "l101", title: "JSX Syntax & Component Architecture", duration: "45m", completed: true },
          { id: "l102", title: "State Management with useState & useReducer", duration: "50m", completed: true },
          { id: "l103", title: "Side Effects with useEffect", duration: "40m", completed: true },
          { id: "l104", title: "Custom Hooks & Performance", duration: "55m", completed: true }
        ]
      },
      {
        id: "m2",
        title: "Module 2: Node.js & Express RESTful API",
        lessons: [
          { id: "l201", title: "Express Server Setup & Middleware", duration: "35m", completed: true },
          { id: "l202", title: "RESTful Endpoints & Controller Patterns", duration: "50m", completed: true },
          { id: "l203", title: "MongoDB Atlas & Mongoose Schemas", duration: "60m", completed: false },
          { id: "l204", title: "JWT Authentication & Security", duration: "65m", completed: false }
        ]
      }
    ]
  },
  {
    id: "c_ds",
    _id: "c_ds",
    title: "Advanced Data Science & Machine Learning",
    code: "DS-502",
    category: "AI & Data Science",
    instructor: "Prof. Michael Rivera",
    instructorRole: "Head of Artificial Intelligence Research",
    thumbnailGradient: "linear-gradient(135deg, #059669 0%, #10b981 50%, #06b6d4 100%)",
    totalLessons: 7,
    completedLessons: 7,
    progressPercentage: 100,
    status: "completed",
    modules: [
      {
        id: "ds_m1",
        title: "Module 1: Python for Data Analysis & Pandas",
        lessons: [
          { id: "ds_l101", title: "NumPy Vectors & Math Functions", duration: "50m", completed: true },
          { id: "ds_l102", title: "Pandas DataFrames & Data Cleaning", duration: "60m", completed: true }
        ]
      }
    ]
  },
  {
    id: "c_cyber",
    _id: "c_cyber",
    title: "Cybersecurity & Network Defense",
    code: "SEC-301",
    category: "Security",
    instructor: "Cmdr. Robert Sterling",
    instructorRole: "Cyber Defense Consultant & CISO",
    thumbnailGradient: "linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)",
    totalLessons: 6,
    completedLessons: 0,
    progressPercentage: 0,
    status: "not-started",
    modules: [
      {
        id: "sec_m1",
        title: "Module 1: Network Architecture & Protocols",
        lessons: [
          { id: "sec_l101", title: "TCP/IP Stack & Packet Inspection", duration: "45m", completed: false },
          { id: "sec_l102", title: "Wireshark Packet Analysis", duration: "50m", completed: false }
        ]
      }
    ]
  }
];

// GET /users/:id/enrollments OR /api/users/:id/enrollments
router.get("/:id/enrollments", async (req, res) => {
  try {
    const userId = req.params.id;
    let enrollments = [];

    try {
      if (userId && userId.match(/^[0-9a-fA-F]{24}$/)) {
        enrollments = await Enrollment.find({ student: userId }).populate("course");
      }
    } catch (e) {
      enrollments = [];
    }

    if (enrollments && enrollments.length > 0) {
      const formatted = enrollments.map(e => {
        const c = e.course ? (typeof e.course.toObject === 'function' ? e.course.toObject() : e.course) : {};
        return {
          id: c._id || e._id,
          _id: c._id || e._id,
          title: c.title || "Enrolled Course",
          code: c.code || "CS-101",
          category: c.category || "General",
          instructor: c.instructor || "Lead Faculty",
          instructorRole: c.instructorRole || "Instructor",
          thumbnailGradient: c.thumbnailGradient || "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
          totalLessons: c.totalLessons || 10,
          completedLessons: e.completedLessonIds ? e.completedLessonIds.length : 0,
          progressPercentage: e.progressPercentage || 0,
          status: e.status || "in-progress",
          modules: c.modules || []
        };
      });
      return res.json(formatted);
    }

    return res.json(fallbackEnrolledCourses);
  } catch (err) {
    return res.json(fallbackEnrolledCourses);
  }
});

module.exports = router;
