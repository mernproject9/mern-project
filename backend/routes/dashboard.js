const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const { authenticateToken, verifyToken, authorizeRoles } = require("../middleware/auth");

// Sample courses for initial seed
const sampleCoursesData = [
  {
    title: "Full-Stack MERN Architecture & React 19",
    code: "CS-401",
    category: "Web Development",
    instructor: "Dr. Sarah Jenkins",
    instructorRole: "Principal Engineer & Lead Instructor",
    thumbnailGradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
    icon: "code",
    estimatedHours: 42,
    modules: [
      {
        id: "m1",
        title: "Module 1: React 19 Fundamentals & Modern Hooks",
        lessons: [
          { id: "l101", title: "JSX Syntax, Components & Props Masterclass", duration: "45m", completed: true },
          { id: "l102", title: "State Management with useState & useReducer", duration: "50m", completed: true },
          { id: "l103", title: "Side Effects & Lifecycle with useEffect", duration: "40m", completed: true },
          { id: "l104", title: "Custom Hooks & Performance Optimization", duration: "55m", completed: true }
        ]
      },
      {
        id: "m2",
        title: "Module 2: Node.js & Express RESTful API Engineering",
        lessons: [
          { id: "l201", title: "Express Server Setup & Middleware Design", duration: "35m", completed: true },
          { id: "l202", title: "RESTful Endpoints & Controller Patterns", duration: "50m", completed: true },
          { id: "l203", title: "MongoDB Atlas & Mongoose Schemas", duration: "60m", completed: false },
          { id: "l204", title: "JWT Authentication & Security Best Practices", duration: "65m", completed: false }
        ]
      },
      {
        id: "m3",
        title: "Module 3: Full-Stack Integration & Deployment",
        lessons: [
          { id: "l301", title: "Axios API Layer & State Syncing", duration: "40m", completed: false },
          { id: "l302", title: "Production Build & Docker Containerization", duration: "50m", completed: false }
        ]
      }
    ]
  },
  {
    title: "Advanced Data Science & Machine Learning",
    code: "DS-502",
    category: "AI & Data Science",
    instructor: "Prof. Michael Rivera",
    instructorRole: "Head of AI Research",
    thumbnailGradient: "linear-gradient(135deg, #059669 0%, #10b981 50%, #06b6d4 100%)",
    icon: "brain",
    estimatedHours: 56,
    modules: [
      {
        id: "ds_m1",
        title: "Module 1: Python for Data Analysis & Pandas",
        lessons: [
          { id: "ds_l101", title: "NumPy Vectors, Matrices & Math Functions", duration: "50m", completed: true },
          { id: "ds_l102", title: "Pandas DataFrames & Data Cleaning", duration: "60m", completed: true },
          { id: "ds_l103", title: "Exploratory Data Analysis & Visualization", duration: "55m", completed: true }
        ]
      },
      {
        id: "ds_m2",
        title: "Module 2: Supervised Learning Algorithms",
        lessons: [
          { id: "ds_l201", title: "Linear & Logistic Regression Models", duration: "65m", completed: true },
          { id: "ds_l202", title: "Decision Trees & Random Forests", duration: "70m", completed: true },
          { id: "ds_l203", title: "Support Vector Machines & Evaluation Metrics", duration: "60m", completed: true }
        ]
      },
      {
        id: "ds_m3",
        title: "Module 3: Deep Learning Foundations",
        lessons: [
          { id: "ds_l301", title: "Neural Networks Architecture & PyTorch", duration: "75m", completed: true }
        ]
      }
    ]
  },
  {
    title: "UI/UX Design Systems & Micro-Animations",
    code: "DES-205",
    category: "Design & UX",
    instructor: "Elena Rostova",
    instructorRole: "Lead Product Designer",
    thumbnailGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #ef4444 100%)",
    icon: "palette",
    estimatedHours: 28,
    modules: [
      {
        id: "ux_m1",
        title: "Module 1: Design Tokens & Typography Systems",
        lessons: [
          { id: "ux_l101", title: "Color Theory & HSL Palettes for Dark Mode", duration: "35m", completed: true },
          { id: "ux_l102", title: "Grid Systems, Layouts & Visual Hierarchy", duration: "45m", completed: true },
          { id: "ux_l103", title: "Figma Component Variables & Auto-Layout", duration: "50m", completed: false }
        ]
      },
      {
        id: "ux_m2",
        title: "Module 2: Micro-Interactions & CSS Animations",
        lessons: [
          { id: "ux_l201", title: "CSS Keyframe Animations & Easing Functions", duration: "40m", completed: false },
          { id: "ux_l202", title: "Glassmorphism & Dynamic Elevation Effects", duration: "45m", completed: false }
        ]
      }
    ]
  },
  {
    title: "Cloud Native DevOps & Kubernetes Administration",
    code: "OPS-310",
    category: "DevOps & Cloud",
    instructor: "David K. Vance",
    instructorRole: "Principal Cloud Architect",
    thumbnailGradient: "linear-gradient(135deg, #0284c7 0%, #2563eb 50%, #4f46e5 100%)",
    icon: "cloud",
    estimatedHours: 35,
    modules: [
      {
        id: "ops_m1",
        title: "Module 1: Container Orchestration with Docker & K8s",
        lessons: [
          { id: "ops_l101", title: "Multi-stage Docker Builds & Optimization", duration: "45m", completed: true },
          { id: "ops_l102", title: "Kubernetes Pods, Services & Deployments", duration: "60m", completed: true },
          { id: "ops_l103", title: "ConfigMaps, Secrets & Volume Management", duration: "50m", completed: true },
          { id: "ops_l104", title: "CI/CD Pipelines with GitHub Actions", duration: "55m", completed: true }
        ]
      }
    ]
  }
];

// Helper to calculate total lessons in course
function getTotalLessons(course) {
  if (!course || !course.modules) return 0;
  return course.modules.reduce((sum, mod) => sum + (mod.lessons ? mod.lessons.length : 0), 0);
}

// GET dashboard data for logged-in user via JWT token
router.get("/me", authenticateToken, async (req, res) => {
  try {
    let student = await Student.findOne({ email: req.user.email });
    if (!student) {
      student = await Student.create({
        name: req.user.name || "Alex Morgan",
        email: req.user.email || "alex.morgan@university.edu",
        age: 22
      });
    }

    // Ensure sample courses exist
    let courses = await Course.find();
    if (courses.length === 0) {
      const createdCourses = [];
      for (const cData of sampleCoursesData) {
        let totalL = getTotalLessons(cData);
        const c = await Course.create({ ...cData, totalLessons: totalL });
        createdCourses.push(c);
      }
      courses = createdCourses;
    }

    // Ensure enrollments exist for student
    let enrollments = await Enrollment.find({ student: student._id }).populate("course");
    if (enrollments.length === 0) {
      for (let i = 0; i < courses.length; i++) {
        const c = courses[i];
        let completedIds = i === 0 ? ["l101", "l102", "l103", "l104", "l201", "l202"]
          : i === 1 ? ["ds_l101", "ds_l102", "ds_l103", "ds_l201", "ds_l202", "ds_l203", "ds_l301"]
          : i === 2 ? ["ux_l101", "ux_l102"] : ["ops_l101", "ops_l102", "ops_l103", "ops_l104"];
        const status = (i === 1 || i === 3) ? "completed" : "active";
        const totalL = c.totalLessons || getTotalLessons(c) || 1;
        const pct = Math.round((completedIds.length / totalL) * 100);

        await Enrollment.create({
          student: student._id,
          course: c._id,
          completedLessonIds: completedIds,
          progressPercentage: Math.min(100, pct),
          status: pct >= 100 ? "completed" : status,
          lastAccessed: new Date(Date.now() - i * 3600000 * 24),
        });
      }
      enrollments = await Enrollment.find({ student: student._id }).populate("course");
    }

    let totalCompletedLessons = 0;
    let totalAllLessons = 0;
    let completedCount = 0;
    let inProgressCount = 0;
    let notStartedCount = 0;

    const processedCourses = enrollments.map((enr) => {
      const courseObj = enr.course ? enr.course.toObject() : {};
      const totalLessons = courseObj.totalLessons || getTotalLessons(courseObj) || 1;
      const completedCountCourse = enr.completedLessonIds ? enr.completedLessonIds.length : 0;

      totalCompletedLessons += completedCountCourse;
      totalAllLessons += totalLessons;

      const pct = Math.min(100, Math.round((completedCountCourse / totalLessons) * 100));
      let status = "in-progress";

      if (pct >= 100 || enr.status === "completed") {
        status = "completed";
        completedCount++;
      } else if (pct === 0) {
        status = "not-started";
        notStartedCount++;
      } else {
        status = "in-progress";
        inProgressCount++;
      }

      return {
        id: courseObj._id,
        enrollmentId: enr._id,
        title: courseObj.title,
        code: courseObj.code,
        category: courseObj.category,
        instructor: courseObj.instructor,
        instructorRole: courseObj.instructorRole,
        thumbnailGradient: courseObj.thumbnailGradient,
        icon: courseObj.icon,
        totalLessons,
        completedLessons: completedCountCourse,
        progressPercentage: pct,
        status,
        lastAccessed: enr.lastAccessed,
        reachedMilestones: enr.reachedMilestones || [],
        modules: courseObj.modules || []
      };
    });

    const overallCompletionRate = totalAllLessons > 0 ? Math.round((totalCompletedLessons / totalAllLessons) * 100) : 0;

    res.json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        age: student.age,
        department: "Computer Science & Artificial Intelligence",
        studentIdCode: "STU-2026-8942",
      },
      stats: {
        totalEnrolled: enrollments.length,
        inProgressCourses: inProgressCount,
        completedCourses: completedCount,
        notStartedCourses: notStartedCount,
        overallCompletionRate,
        totalCompletedLessons,
        totalAllLessons
      },
      courses: processedCourses
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET dashboard data for a student by ID
router.get("/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    let student;
    if (studentId === "demo" || studentId === "default") {
      student = await Student.findOne();
      if (!student) {
        student = await Student.create({
          name: "Alex Morgan",
          email: "alex.morgan@university.edu",
          age: 22
        });
      }
    } else {
      student = await Student.findById(studentId);
    }

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Ensure sample courses exist
    let courses = await Course.find();
    if (courses.length === 0) {
      const createdCourses = [];
      for (const cData of sampleCoursesData) {
        let totalL = getTotalLessons(cData);
        const c = await Course.create({ ...cData, totalLessons: totalL });
        createdCourses.push(c);
      }
      courses = createdCourses;
    }

    // Ensure enrollments exist for student
    let enrollments = await Enrollment.find({ student: student._id }).populate("course");
    if (enrollments.length === 0) {
      // Create initial enrollments
      for (let i = 0; i < courses.length; i++) {
        const c = courses[i];
        let completedIds = [];
        let status = "active";

        if (i === 0) {
          completedIds = ["l101", "l102", "l103", "l104", "l201", "l202"];
        } else if (i === 1) {
          completedIds = ["ds_l101", "ds_l102", "ds_l103", "ds_l201", "ds_l202", "ds_l203", "ds_l301"];
          status = "completed";
        } else if (i === 2) {
          completedIds = ["ux_l101", "ux_l102"];
        } else if (i === 3) {
          completedIds = ["ops_l101", "ops_l102", "ops_l103", "ops_l104"];
          status = "completed";
        }

        const totalL = c.totalLessons || getTotalLessons(c) || 1;
        const pct = Math.round((completedIds.length / totalL) * 100);

        await Enrollment.create({
          student: student._id,
          course: c._id,
          completedLessonIds: completedIds,
          progressPercentage: Math.min(100, pct),
          status: pct >= 100 ? "completed" : status,
          lastAccessed: new Date(Date.now() - i * 3600000 * 24),
        });
      }
      enrollments = await Enrollment.find({ student: student._id }).populate("course");
    }

    // Process summary stats
    let totalEnrolled = enrollments.length;
    let inProgressCount = 0;
    let completedCount = 0;
    let notStartedCount = 0;
    let totalCompletedLessons = 0;
    let totalAllLessons = 0;

    const processedCourses = enrollments.map((enr) => {
      const courseObj = enr.course.toObject();
      const totalLessons = courseObj.totalLessons || getTotalLessons(courseObj) || 1;
      const completedCountCourse = enr.completedLessonIds.length;

      totalCompletedLessons += completedCountCourse;
      totalAllLessons += totalLessons;

      const pct = Math.min(100, Math.round((completedCountCourse / totalLessons) * 100));
      let status = "in-progress";

      if (pct >= 100 || enr.status === "completed") {
        status = "completed";
        completedCount++;
      } else if (pct === 0) {
        status = "not-started";
        notStartedCount++;
      } else {
        status = "in-progress";
        inProgressCount++;
      }

      // Mark lessons as completed based on enrollment data
      const updatedModules = courseObj.modules.map((mod) => ({
        ...mod,
        lessons: mod.lessons.map((les) => ({
          ...les,
          completed: enr.completedLessonIds.includes(les.id)
        }))
      }));

      // Find next up lesson
      let nextLesson = null;
      for (const mod of updatedModules) {
        for (const les of mod.lessons) {
          if (!les.completed) {
            nextLesson = { moduleTitle: mod.title, lessonTitle: les.title, duration: les.duration };
            break;
          }
        }
        if (nextLesson) break;
      }

      return {
        id: courseObj._id,
        enrollmentId: enr._id,
        title: courseObj.title,
        code: courseObj.code,
        category: courseObj.category,
        instructor: courseObj.instructor,
        instructorRole: courseObj.instructorRole,
        thumbnailGradient: courseObj.thumbnailGradient,
        icon: courseObj.icon,
        totalLessons,
        completedLessons: completedCountCourse,
        progressPercentage: pct,
        status,
        lastAccessed: enr.lastAccessed,
        reachedMilestones: enr.reachedMilestones || [],
        nextLesson,
        modules: updatedModules
      };
    });

    const overallCompletionRate = totalAllLessons > 0 ? Math.round((totalCompletedLessons / totalAllLessons) * 100) : 0;

    res.json({
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        age: student.age,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        department: "Computer Science & Artificial Intelligence",
        studentIdCode: "STU-2026-8942",
        streakDays: 14,
        totalLearningHours: 48.5,
        targetHours: 60
      },
      stats: {
        totalEnrolled,
        inProgressCourses: inProgressCount,
        completedCourses: completedCount,
        notStartedCourses: notStartedCount,
        overallCompletionRate,
        totalCompletedLessons,
        totalAllLessons,
        certificatesEarned: completedCount
      },
      weeklyActivity: [
        { day: "Mon", hours: 2.5, completed: 3 },
        { day: "Tue", hours: 4.0, completed: 4 },
        { day: "Wed", hours: 1.5, completed: 2 },
        { day: "Thu", hours: 3.5, completed: 3 },
        { day: "Fri", hours: 5.0, completed: 5 },
        { day: "Sat", hours: 2.0, completed: 2 },
        { day: "Sun", hours: 3.0, completed: 3 }
      ],
      courses: processedCourses
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Toggle lesson completion or update progress
router.post("/:studentId/toggle-lesson", async (req, res) => {
  try {
    const { studentId } = req.params;
    const { courseId, lessonId } = req.body;

    let student = studentId === "demo" ? await Student.findOne() : await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    let enrollment = await Enrollment.findOne({ student: student._id, course: courseId });
    if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });

    const course = await Course.findById(courseId);
    const totalL = course ? (course.totalLessons || getTotalLessons(course) || 1) : 1;

    let completedIds = [...enrollment.completedLessonIds];
    if (completedIds.includes(lessonId)) {
      completedIds = completedIds.filter(id => id !== lessonId);
    } else {
      completedIds.push(lessonId);
    }

    const pct = Math.min(100, Math.round((completedIds.length / totalL) * 100));
    enrollment.completedLessonIds = completedIds;
    enrollment.progressPercentage = pct;
    enrollment.status = pct >= 100 ? "completed" : "active";
    enrollment.lastAccessed = new Date();

    // Track Milestone Thresholds (25%, 50%, 75%, 100%)
    if (!enrollment.reachedMilestones) {
      enrollment.reachedMilestones = [];
    }

    const milestoneThresholds = [25, 50, 75, 100];
    let newlyReachedMilestone = null;

    for (const threshold of milestoneThresholds) {
      if (pct >= threshold && !enrollment.reachedMilestones.includes(threshold)) {
        enrollment.reachedMilestones.push(threshold);
        const courseTitle = course ? course.title : "Course";
        let message = "";
        let badgeIcon = "🏆";

        if (threshold === 25) {
          message = `🌱 Off to a Great Start! You reached 25% completion in ${courseTitle}.`;
          badgeIcon = "🌱";
        } else if (threshold === 50) {
          message = `⚡ Halfway Milestone Reached! You hit 50% completion in ${courseTitle}.`;
          badgeIcon = "⚡";
        } else if (threshold === 75) {
          message = `🔥 In the Home Stretch! You reached 75% progress in ${courseTitle}.`;
          badgeIcon = "🔥";
        } else if (threshold === 100) {
          message = `🏆 Course Completed! Congratulations on finishing ${courseTitle}. Your certificate is ready to download!`;
          badgeIcon = "🎓";
        }

        newlyReachedMilestone = {
          id: `ms_${threshold}_${Date.now()}`,
          threshold,
          courseId,
          courseTitle,
          badgeIcon,
          message,
          timestamp: new Date()
        };
        break; // Trigger one notification per progress update
      }
    }

    await enrollment.save();

    res.json({
      success: true,
      courseId,
      lessonId,
      completedLessonIds: completedIds,
      progressPercentage: pct,
      status: enrollment.status,
      reachedMilestones: enrollment.reachedMilestones,
      milestoneNotification: newlyReachedMilestone
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Catalog list & enroll in course
router.get("/catalog/available", async (req, res) => {
  try {
    const catalog = [
      {
        title: "Cybersecurity & Network Defense",
        code: "SEC-301",
        category: "Security",
        instructor: "Cmdr. Robert Sterling",
        estimatedHours: 30,
        thumbnailGradient: "linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)",
        icon: "shield"
      },
      {
        title: "Mobile App Development with React Native",
        code: "MOB-210",
        category: "Mobile",
        instructor: "Jessica Lin",
        estimatedHours: 38,
        thumbnailGradient: "linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #1e40af 100%)",
        icon: "smartphone"
      }
    ];
    res.json(catalog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin-Protected Route: Add new course (Admin only)
router.post("/admin/courses", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { title, code, category, instructor, estimatedHours } = req.body;
    if (!title || !code) {
      return res.status(400).json({ success: false, message: "Title and course code are required." });
    }

    const newCourse = await Course.create({
      title,
      code,
      category: category || "General",
      instructor: instructor || "Urban EdTech Admin",
      estimatedHours: estimatedHours || 20,
      thumbnailGradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
      icon: "book-open",
      modules: []
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully by Admin.",
      course: newCourse
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin-Protected Route: View platform global stats (Admin only)
router.get("/admin/stats", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalCourses,
        totalEnrollments,
        activeLearnersRate: 88.4
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

