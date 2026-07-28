const express = require("express");
const router = express.Router();
const Course = require("../models/Course");

const defaultCourses = [
  {
    title: "MERN Stack Development",
    provider: "Intern Nexus",
    instructor: "Intern Nexus",
    category: "Web Development",
    rating: "⭐ 4.9",
    price: "Free",
    image: "💻",
    description: "Build full-stack web applications using MongoDB, Express, React and Node.js.",
    duration: "8 Weeks",
    level: "Beginner to Intermediate"
  },
  {
    title: "Java Programming",
    provider: "Intern Nexus",
    instructor: "Intern Nexus",
    category: "Programming",
    rating: "⭐ 4.8",
    price: "₹999",
    image: "☕",
    description: "Master Java fundamentals with real-world projects.",
    duration: "6 Weeks",
    level: "Beginner"
  },
  {
    title: "Data Structures & Algorithms",
    provider: "Intern Nexus",
    instructor: "Intern Nexus",
    category: "DSA",
    rating: "⭐ 4.9",
    price: "₹799",
    image: "📊",
    description: "Learn Arrays, Linked Lists, Trees, Graphs and Algorithms.",
    duration: "10 Weeks",
    level: "Intermediate"
  },
  {
    title: "Python Data Science",
    provider: "Urban Learn",
    instructor: "Dr. Sarah Chen",
    category: "Data Science",
    rating: "⭐ 4.9",
    price: "Free",
    image: "🐍",
    description: "Analyze datasets, build ML models, and master Pandas and NumPy.",
    duration: "8 Weeks",
    level: "Beginner"
  },
  {
    title: "UI/UX Design Masterclass",
    provider: "Creative Hub",
    instructor: "Alex Rivera",
    category: "Design",
    rating: "⭐ 4.7",
    price: "₹1,299",
    image: "🎨",
    description: "Design modern interfaces with Figma, wireframing, and user testing.",
    duration: "5 Weeks",
    level: "All Levels"
  },
  {
    title: "Cloud Computing & DevOps",
    provider: "Urban Tech",
    instructor: "David Miller",
    category: "Cloud",
    rating: "⭐ 4.8",
    price: "₹1,499",
    image: "☁️",
    description: "Deploy applications with Docker, Kubernetes, and AWS services.",
    duration: "12 Weeks",
    level: "Advanced"
  }
];

// Helper function to generate course progress details
function getCourseProgressDetails(courseId, courseTitle = "MERN Stack Development") {
  const title = (courseTitle || "").toLowerCase();
  
  if (title.includes("java")) {
    return {
      courseId,
      courseTitle: "Java Programming",
      category: "Programming",
      overallProgress: 85,
      totalModules: 5,
      completedModules: 4,
      inProgressModules: 1,
      notStartedModules: 0,
      totalHoursSpent: 42,
      avgQuizScore: 86.25,
      certificateEarned: false,
      modules: [
        { id: "m1", name: "Module 1: Java Syntax & OOP Fundamentals", progress: 100, status: "Completed", timeSpentHours: 10, totalHours: 10 },
        { id: "m2", name: "Module 2: Collections Framework & Generics", progress: 100, status: "Completed", timeSpentHours: 12, totalHours: 12 },
        { id: "m3", name: "Module 3: Multithreading & Concurrency", progress: 100, status: "Completed", timeSpentHours: 10, totalHours: 10 },
        { id: "m4", name: "Module 4: Exception Handling & File I/O", progress: 100, status: "Completed", timeSpentHours: 6, totalHours: 6 },
        { id: "m5", name: "Module 5: Spring Boot & Microservices", progress: 25, status: "In Progress", timeSpentHours: 4, totalHours: 16 }
      ],
      quizzes: [
        { id: "q1", title: "Quiz 1: OOP Concepts", score: 95, maxScore: 100, attempts: 1, status: "Passed" },
        { id: "q2", title: "Quiz 2: Collections & Streams", score: 90, maxScore: 100, attempts: 1, status: "Passed" },
        { id: "q3", title: "Quiz 3: Concurrency Safety", score: 82, maxScore: 100, attempts: 2, status: "Passed" },
        { id: "q4", title: "Quiz 4: File Operations", score: 78, maxScore: 100, attempts: 1, status: "Passed" },
        { id: "q5", title: "Quiz 5: Spring Boot Core", score: 0, maxScore: 100, attempts: 0, status: "Pending" }
      ],
      weeklyActivity: {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
        studyHours: [8, 12, 10, 6, 4, 2],
        quizScores: [95, 90, 82, 78, 0, 0]
      },
      skillMetrics: {
        labels: ["OOP Design", "Collections", "Concurrency", "File I/O", "Spring Boot", "Unit Testing"],
        scores: [95, 90, 82, 78, 30, 70]
      }
    };
  }

  if (title.includes("data structures") || title.includes("dsa")) {
    return {
      courseId,
      courseTitle: "Data Structures & Algorithms",
      category: "DSA",
      overallProgress: 60,
      totalModules: 5,
      completedModules: 3,
      inProgressModules: 1,
      notStartedModules: 1,
      totalHoursSpent: 38,
      avgQuizScore: 83.7,
      certificateEarned: false,
      modules: [
        { id: "m1", name: "Module 1: Arrays, Strings & Pointers", progress: 100, status: "Completed", timeSpentHours: 10, totalHours: 10 },
        { id: "m2", name: "Module 2: Linked Lists, Stacks & Queues", progress: 100, status: "Completed", timeSpentHours: 12, totalHours: 12 },
        { id: "m3", name: "Module 3: Binary Trees & BST", progress: 100, status: "Completed", timeSpentHours: 10, totalHours: 10 },
        { id: "m4", name: "Module 4: Graph Algorithms (BFS/DFS)", progress: 0, status: "In Progress", timeSpentHours: 6, totalHours: 14 },
        { id: "m5", name: "Module 5: Dynamic Programming", progress: 0, status: "Not Started", timeSpentHours: 0, totalHours: 16 }
      ],
      quizzes: [
        { id: "q1", title: "Quiz 1: Array Manipulation", score: 98, maxScore: 100, attempts: 1, status: "Passed" },
        { id: "q2", title: "Quiz 2: Stack & Queue Operations", score: 85, maxScore: 100, attempts: 1, status: "Passed" },
        { id: "q3", title: "Quiz 3: Tree Traversals", score: 68, maxScore: 100, attempts: 2, status: "Passed" },
        { id: "q4", title: "Quiz 4: Shortest Paths & Graphs", score: 0, maxScore: 100, attempts: 0, status: "Pending" },
        { id: "q5", title: "Quiz 5: DP Optimization", score: 0, maxScore: 100, attempts: 0, status: "Pending" }
      ],
      weeklyActivity: {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8", "Week 9", "Week 10"],
        studyHours: [6, 8, 10, 8, 4, 2, 0, 0, 0, 0],
        quizScores: [98, 85, 68, 0, 0, 0, 0, 0, 0, 0]
      },
      skillMetrics: {
        labels: ["Arrays & Strings", "Linked Lists", "Trees & Graphs", "Dynamic Programming", "Sorting & Searching", "Complexity Analysis"],
        scores: [98, 85, 68, 20, 75, 80]
      }
    };
  }

  if (title.includes("python") || title.includes("data science")) {
    return {
      courseId,
      courseTitle: "Python Data Science",
      category: "Data Science",
      overallProgress: 90,
      totalModules: 5,
      completedModules: 4,
      inProgressModules: 1,
      notStartedModules: 0,
      totalHoursSpent: 52,
      avgQuizScore: 91.5,
      certificateEarned: true,
      modules: [
        { id: "m1", name: "Module 1: Python Fundamentals & Data Structures", progress: 100, status: "Completed", timeSpentHours: 10, totalHours: 10 },
        { id: "m2", name: "Module 2: Data Wrangling with Pandas & NumPy", progress: 100, status: "Completed", timeSpentHours: 14, totalHours: 14 },
        { id: "m3", name: "Module 3: Data Visualization (Matplotlib & Seaborn)", progress: 100, status: "Completed", timeSpentHours: 12, totalHours: 12 },
        { id: "m4", name: "Module 4: Machine Learning with Scikit-Learn", progress: 100, status: "Completed", timeSpentHours: 12, totalHours: 12 },
        { id: "m5", name: "Module 5: Neural Networks & Deep Learning Intro", progress: 50, status: "In Progress", timeSpentHours: 4, totalHours: 8 }
      ],
      quizzes: [
        { id: "q1", title: "Quiz 1: Python Basics", score: 100, maxScore: 100, attempts: 1, status: "Passed" },
        { id: "q2", title: "Quiz 2: Pandas DataFrames", score: 92, maxScore: 100, attempts: 1, status: "Passed" },
        { id: "q3", title: "Quiz 3: Plotting & Visual Insights", score: 88, maxScore: 100, attempts: 1, status: "Passed" },
        { id: "q4", title: "Quiz 4: Supervised Learning Models", score: 86, maxScore: 100, attempts: 1, status: "Passed" },
        { id: "q5", title: "Quiz 5: Deep Learning Core", score: 0, maxScore: 100, attempts: 0, status: "Pending" }
      ],
      weeklyActivity: {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8"],
        studyHours: [8, 12, 10, 10, 8, 4, 0, 0],
        quizScores: [100, 92, 88, 86, 0, 0, 0, 0]
      },
      skillMetrics: {
        labels: ["Python Syntax", "Pandas", "Data Viz", "Scikit-Learn", "Statistics", "Deep Learning"],
        scores: [100, 92, 88, 86, 80, 50]
      }
    };
  }

  if (title.includes("design") || title.includes("ui/ux")) {
    return {
      courseId,
      courseTitle: "UI/UX Design Masterclass",
      category: "Design",
      overallProgress: 45,
      totalModules: 4,
      completedModules: 1,
      inProgressModules: 2,
      notStartedModules: 1,
      totalHoursSpent: 22,
      avgQuizScore: 78.0,
      certificateEarned: false,
      modules: [
        { id: "m1", name: "Module 1: User Research & Personas", progress: 100, status: "Completed", timeSpentHours: 8, totalHours: 8 },
        { id: "m2", name: "Module 2: Wireframing & Information Architecture", progress: 50, status: "In Progress", timeSpentHours: 6, totalHours: 12 },
        { id: "m3", name: "Module 3: High-Fidelity Prototyping in Figma", progress: 30, status: "In Progress", timeSpentHours: 5, totalHours: 15 },
        { id: "m4", name: "Module 4: Usability Testing & Handoff", progress: 0, status: "Not Started", timeSpentHours: 0, totalHours: 10 }
      ],
      quizzes: [
        { id: "q1", title: "Quiz 1: User Research Principles", score: 85, maxScore: 100, attempts: 1, status: "Passed" },
        { id: "q2", title: "Quiz 2: Wireframing Essentials", score: 71, maxScore: 100, attempts: 2, status: "Passed" },
        { id: "q3", title: "Quiz 3: Interactive Components", score: 0, maxScore: 100, attempts: 0, status: "Pending" },
        { id: "q4", title: "Quiz 4: Design Handoff", score: 0, maxScore: 100, attempts: 0, status: "Pending" }
      ],
      weeklyActivity: {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
        studyHours: [6, 8, 5, 3, 0],
        quizScores: [85, 71, 0, 0, 0]
      },
      skillMetrics: {
        labels: ["User Research", "Wireframing", "Figma", "Design Systems", "Prototyping", "Usability Testing"],
        scores: [85, 75, 60, 40, 30, 20]
      }
    };
  }

  if (title.includes("cloud") || title.includes("devops")) {
    return {
      courseId,
      courseTitle: "Cloud Computing & DevOps",
      category: "Cloud",
      overallProgress: 35,
      totalModules: 5,
      completedModules: 1,
      inProgressModules: 1,
      notStartedModules: 3,
      totalHoursSpent: 18,
      avgQuizScore: 80.0,
      certificateEarned: false,
      modules: [
        { id: "m1", name: "Module 1: Cloud Fundamentals & AWS Services", progress: 100, status: "Completed", timeSpentHours: 10, totalHours: 10 },
        { id: "m2", name: "Module 2: Docker Containers & Registry", progress: 40, status: "In Progress", timeSpentHours: 8, totalHours: 15 },
        { id: "m3", name: "Module 3: Kubernetes Orchestration", progress: 0, status: "Not Started", timeSpentHours: 0, totalHours: 20 },
        { id: "m4", name: "Module 4: CI/CD Pipelines (GitHub Actions)", progress: 0, status: "Not Started", timeSpentHours: 0, totalHours: 15 },
        { id: "m5", name: "Module 5: Infrastructure as Code (Terraform)", progress: 0, status: "Not Started", timeSpentHours: 0, totalHours: 15 }
      ],
      quizzes: [
        { id: "q1", title: "Quiz 1: AWS Architecture", score: 80, maxScore: 100, attempts: 1, status: "Passed" },
        { id: "q2", title: "Quiz 2: Containerization Basics", score: 0, maxScore: 100, attempts: 0, status: "Pending" },
        { id: "q3", title: "Quiz 3: K8s Pods & Services", score: 0, maxScore: 100, attempts: 0, status: "Pending" },
        { id: "q4", title: "Quiz 4: Pipeline Automation", score: 0, maxScore: 100, attempts: 0, status: "Pending" },
        { id: "q5", title: "Quiz 5: Terraform Modules", score: 0, maxScore: 100, attempts: 0, status: "Pending" }
      ],
      weeklyActivity: {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
        studyHours: [6, 8, 4, 0, 0, 0],
        quizScores: [80, 0, 0, 0, 0, 0]
      },
      skillMetrics: {
        labels: ["AWS Architecture", "Docker", "Kubernetes", "CI/CD Pipelines", "Terraform", "Monitoring"],
        scores: [80, 55, 30, 20, 15, 10]
      }
    };
  }

  // Default: MERN Stack Development
  return {
    courseId,
    courseTitle: courseTitle || "MERN Stack Development",
    category: "Web Development",
    overallProgress: 75,
    totalModules: 5,
    completedModules: 3,
    inProgressModules: 1,
    notStartedModules: 1,
    totalHoursSpent: 48,
    avgQuizScore: 87.2,
    certificateEarned: false,
    modules: [
      { id: "m1", name: "Module 1: React Components & Hooks", progress: 100, status: "Completed", timeSpentHours: 12, totalHours: 12 },
      { id: "m2", name: "Module 2: Node.js & Express REST APIs", progress: 100, status: "Completed", timeSpentHours: 14, totalHours: 14 },
      { id: "m3", name: "Module 3: MongoDB Schemas & Mongoose ORM", progress: 100, status: "Completed", timeSpentHours: 10, totalHours: 10 },
      { id: "m4", name: "Module 4: Chart.js & Data Analytics Dashboard", progress: 75, status: "In Progress", timeSpentHours: 9, totalHours: 12 },
      { id: "m5", name: "Module 5: Production Deployment & Docker", progress: 0, status: "Not Started", timeSpentHours: 0, totalHours: 10 }
    ],
    quizzes: [
      { id: "q1", title: "Quiz 1: React Hooks & State Management", score: 92, maxScore: 100, attempts: 1, status: "Passed" },
      { id: "q2", title: "Quiz 2: Express Routes & Middleware", score: 88, maxScore: 100, attempts: 1, status: "Passed" },
      { id: "q3", title: "Quiz 3: Database Queries & Mongoose", score: 95, maxScore: 100, attempts: 1, status: "Passed" },
      { id: "q4", title: "Quiz 4: Authentication & Security", score: 74, maxScore: 100, attempts: 2, status: "Passed" },
      { id: "q5", title: "Quiz 5: Full Stack Final Exam", score: 0, maxScore: 100, attempts: 0, status: "Pending" }
    ],
    weeklyActivity: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8"],
      studyHours: [6, 10, 14, 12, 16, 10, 8, 4],
      quizScores: [85, 90, 92, 88, 95, 74, 80, 0]
    },
    skillMetrics: {
      labels: ["React UI", "Express Backend", "MongoDB", "Chart Analytics", "Auth & Security", "CI/CD Deployment"],
      scores: [92, 88, 90, 85, 74, 45]
    }
  };
}

const jwt = require("jsonwebtoken");
const CourseProgress = require("../models/CourseProgress");
const { verifyJWT } = require("../middleware/authMiddleware");

const JWT_SECRET = process.env.JWT_SECRET || "urban_edtech_jwt_secret_key_2026";

/**
 * Course Completion Rules & Policy Configuration
 * Defines strict requirements for when an urban student is considered to have completed a course:
 * 1. COMPLETION_THRESHOLD: Overall progress must equal 100%.
 * 2. PASSING_QUIZ_SCORE: Minimum passing score of 70% per assessment quiz.
 * 3. All modules must have status "Completed" (100% module progress).
 * 4. All quizzes must be attempted and passed.
 */
const COMPLETION_RULES = {
  COMPLETION_THRESHOLD: 100, // 100% completion threshold required for certificate
  PASSING_QUIZ_SCORE: 70,    // Minimum passing percentage per quiz (70%)
  REQUIRE_ALL_MODULES: true, // All modules must be marked "Completed"
  REQUIRE_ALL_QUIZZES: true, // All quizzes must be attempted and passed
};

/**
 * Helper function to evaluate certificate eligibility against completion rules
 * @param {Object} progressData - Course progress tracking object
 * @returns {Object} Comprehensive evaluation breakdown and eligibility decision
 */
function evaluateCertificateEligibility(progressData) {
  if (!progressData) {
    return {
      eligible: false,
      reason: "No progress tracking data found for student.",
      completionPercentage: 0,
      completionThreshold: COMPLETION_RULES.COMPLETION_THRESHOLD,
      requirements: { overallThresholdMet: false, modulesCompletionMet: false, quizzesPassedMet: false },
    };
  }

  const { overallProgress = 0, modules = [], quizzes = [] } = progressData;

  // Rule 1: Check overall completion percentage against the 100% threshold
  const overallThresholdMet = overallProgress >= COMPLETION_RULES.COMPLETION_THRESHOLD;

  // Rule 2: Verify all required course modules are completed
  const completedModulesCount = modules.filter(
    (m) => m.progress === 100 || m.status === "Completed"
  ).length;
  const totalModulesCount = modules.length || 1;
  const modulesCompletionMet = completedModulesCount === totalModulesCount;

  // Rule 3: Verify all quizzes attempted and passed with score >= PASSING_QUIZ_SCORE
  const passedQuizzesCount = quizzes.filter(
    (q) => (q.status === "Passed" || q.score >= COMPLETION_RULES.PASSING_QUIZ_SCORE) && q.score > 0
  ).length;
  const totalQuizzesCount = quizzes.length || 1;
  const quizzesPassedMet = quizzes.length > 0 ? passedQuizzesCount === totalQuizzesCount : true;

  // Final Eligibility Status: All criteria must be satisfied
  const eligible = overallThresholdMet && modulesCompletionMet && quizzesPassedMet;

  let message = "";
  if (eligible) {
    message = `Student has achieved ${overallProgress}% course completion and passed all required assessments (${passedQuizzesCount}/${totalQuizzesCount}). Eligible to issue certificate!`;
  } else {
    const missing = [];
    if (!overallThresholdMet) {
      missing.push(`Overall progress is ${overallProgress}% (Requires ${COMPLETION_RULES.COMPLETION_THRESHOLD}%)`);
    }
    if (!modulesCompletionMet) {
      missing.push(`${totalModulesCount - completedModulesCount} module(s) remaining`);
    }
    if (!quizzesPassedMet) {
      missing.push(`${totalQuizzesCount - passedQuizzesCount} quiz(zes) pending or failed`);
    }
    message = `Ineligible for certificate. Requirements remaining: ${missing.join("; ")}.`;
  }

  return {
    eligible,
    completionPercentage: overallProgress,
    completionThreshold: COMPLETION_RULES.COMPLETION_THRESHOLD,
    modulesSummary: {
      completed: completedModulesCount,
      total: totalModulesCount,
      allCompleted: modulesCompletionMet,
    },
    quizzesSummary: {
      passed: passedQuizzesCount,
      total: totalQuizzesCount,
      allPassed: quizzesPassedMet,
      passingMark: COMPLETION_RULES.PASSING_QUIZ_SCORE,
    },
    requirements: {
      overallThresholdMet,
      modulesCompletionMet,
      quizzesPassedMet,
    },
    message,
  };
}

// GET /courses/test-eligibility/:scenario - Test eligibility logic for various scenarios (eligible vs ineligible)
router.get("/test-eligibility/:scenario", (req, res) => {
  const scenario = (req.params.scenario || "eligible").toLowerCase();

  let mockProgress = null;

  if (scenario === "eligible") {
    // Scenario 1: Eligible User (100% completion, all modules completed, all quizzes passed)
    mockProgress = {
      courseId: "1",
      courseTitle: "MERN Stack Development Masterclass",
      overallProgress: 100,
      totalModules: 5,
      completedModules: 5,
      modules: [
        { id: "m1", name: "Module 1: React Components", progress: 100, status: "Completed" },
        { id: "m2", name: "Module 2: Node.js & Express REST APIs", progress: 100, status: "Completed" },
        { id: "m3", name: "Module 3: MongoDB & Mongoose ORM", progress: 100, status: "Completed" },
        { id: "m4", name: "Module 4: JWT Auth & State Context", progress: 100, status: "Completed" },
        { id: "m5", name: "Module 5: Docker & Deployment", progress: 100, status: "Completed" },
      ],
      quizzes: [
        { id: "q1", title: "Quiz 1: React Fundamentals", score: 95, maxScore: 100, status: "Passed" },
        { id: "q2", title: "Quiz 2: REST Architecture", score: 90, maxScore: 100, status: "Passed" },
        { id: "q3", title: "Quiz 3: Database Schemas", score: 92, maxScore: 100, status: "Passed" },
        { id: "q4", title: "Quiz 4: JWT Security", score: 88, maxScore: 100, status: "Passed" },
        { id: "q5", title: "Quiz 5: Final Comprehensive Exam", score: 96, maxScore: 100, status: "Passed" },
      ],
    };
  } else {
    // Scenario 2: Ineligible User (75% completion, 1 module pending, quiz 5 pending)
    mockProgress = {
      courseId: "1",
      courseTitle: "MERN Stack Development Masterclass",
      overallProgress: 75,
      totalModules: 5,
      completedModules: 3,
      modules: [
        { id: "m1", name: "Module 1: React Components", progress: 100, status: "Completed" },
        { id: "m2", name: "Module 2: Node.js & Express REST APIs", progress: 100, status: "Completed" },
        { id: "m3", name: "Module 3: MongoDB & Mongoose ORM", progress: 100, status: "Completed" },
        { id: "m4", name: "Module 4: JWT Auth & State Context", progress: 75, status: "In Progress" },
        { id: "m5", name: "Module 5: Docker & Deployment", progress: 0, status: "Not Started" },
      ],
      quizzes: [
        { id: "q1", title: "Quiz 1: React Fundamentals", score: 95, maxScore: 100, status: "Passed" },
        { id: "q2", title: "Quiz 2: REST Architecture", score: 90, maxScore: 100, status: "Passed" },
        { id: "q3", title: "Quiz 3: Database Schemas", score: 92, maxScore: 100, status: "Passed" },
        { id: "q4", title: "Quiz 4: JWT Security", score: 74, maxScore: 100, status: "Passed" },
        { id: "q5", title: "Quiz 5: Final Comprehensive Exam", score: 0, maxScore: 100, status: "Pending" },
      ],
    };
  }

  const evaluation = evaluateCertificateEligibility(mockProgress);

  res.status(200).json({
    testScenario: scenario,
    student: scenario === "eligible" ? "John Doe (Eligible Student)" : "Jane Smith (Ineligible Student)",
    courseTitle: mockProgress.courseTitle,
    ...evaluation,
  });
});

// GET /courses/:id/eligibility - Check certificate eligibility status with JWT authentication & MongoDB query
router.get("/:id/eligibility", async (req, res) => {
  try {
    const courseId = req.params.id;

    // Check JWT authentication header
    let userId = "guest_user";
    let userName = "Urban Learner";
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
        userName = decoded.name || "Urban Learner";
      } catch (tokenErr) {
        // Invalid or expired token
      }
    }

    let courseTitle = "MERN Stack Development";
    try {
      const courseObj = await Course.findById(courseId);
      if (courseObj) courseTitle = courseObj.title;
    } catch (e) {
      const foundSeed = defaultCourses.find((c, idx) => String(idx + 1) === courseId);
      if (foundSeed) courseTitle = foundSeed.title;
    }

    // Query MongoDB for user progress schema record
    let progressData = null;
    try {
      progressData = await CourseProgress.findOne({ course: courseId, student: userId });
    } catch (e) {}

    // Fallback if no specific MongoDB record exists yet
    if (!progressData) {
      progressData = getCourseProgressDetails(courseId, courseTitle);
    }

    // Evaluate progress against strict 100% completion threshold
    const evaluation = evaluateCertificateEligibility(progressData);

    res.status(200).json({
      success: true,
      studentId: userId,
      studentName: userName,
      courseId: courseId,
      courseTitle: progressData.courseTitle || courseTitle,
      ...evaluation,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error retrieving course completion eligibility status: " + err.message,
    });
  }
});

// GET detailed course progress by course ID
router.get("/:id/progress", async (req, res) => {
  try {
    let courseTitle = "MERN Stack Development";
    try {
      const course = await Course.findById(req.params.id);
      if (course) {
        courseTitle = course.title;
      } else {
        const foundSeed = defaultCourses.find((c, idx) => String(idx + 1) === req.params.id);
        if (foundSeed) courseTitle = foundSeed.title;
      }
    } catch (e) {
      const foundSeed = defaultCourses.find((c, idx) => String(idx + 1) === req.params.id);
      if (foundSeed) courseTitle = foundSeed.title;
    }

    const progressDetails = getCourseProgressDetails(req.params.id, courseTitle);
    res.status(200).json(progressDetails);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all courses
router.get("/", async (req, res) => {
  try {
    let courses = await Course.find();
    if (courses.length === 0) {
      courses = await Course.insertMany(defaultCourses);
    }
    res.status(200).json(courses);
  } catch (err) {
    // If DB is disconnected, fallback to default seed array gracefully
    res.status(200).json(defaultCourses.map((c, i) => ({ ...c, _id: String(i + 1) })));
  }
});

// GET course by ID
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      const fallback = defaultCourses.find((c, i) => String(i + 1) === req.params.id) || defaultCourses[0];
      return res.status(200).json({ ...fallback, _id: req.params.id });
    }
    res.status(200).json(course);
  } catch (err) {
    const fallback = defaultCourses.find((c, i) => String(i + 1) === req.params.id) || defaultCourses[0];
    res.status(200).json({ ...fallback, _id: req.params.id });
  }
});

// Add a course
router.post("/", async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;


