const express = require("express");
const router = express.Router();
const Course = require("../models/Course");

// Detailed seed data for fallback / initial population
const detailedCoursesCatalog = [
  {
    _id: "c_mern",
    code: "CS-401",
    title: "Full-Stack MERN Architecture & React 19",
    category: "Web Development",
    level: "Advanced",
    estimatedHours: 42,
    thumbnailGradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
    icon: "code",
    description: "Master modern full-stack web application development using the MERN stack (MongoDB, Express, React 19, Node.js). This comprehensive course covers advanced React 19 features, custom hooks, state management, RESTful API architecture, JWT authentication, and production deployment best practices.",
    instructor: "Dr. Sarah Jenkins",
    instructorRole: "Principal Systems Architect & Lead Educator",
    instructorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    instructorBio: "Dr. Sarah Jenkins has over 15 years of software engineering experience leading platform engineering teams at top tech firms. She holds a Ph.D. in Computer Science from MIT and specializes in high-throughput distributed systems and modern web frameworks.",
    prerequisites: [
      "Proficiency in JavaScript (ES6+ async/await, modules)",
      "Basic understanding of HTML5, CSS3, and DOM manipulation",
      "Familiarity with Git version control"
    ],
    learningOutcomes: [
      "Architect end-to-end full-stack applications with React 19 and Express",
      "Implement secure JWT authentication and role-based access control (RBAC)",
      "Design flexible MongoDB schema models using Mongoose ORM",
      "Deploy scalable web apps to cloud environments with automated CI/CD"
    ],
    totalLessons: 10,
    modules: [
      {
        id: "m1",
        title: "Module 1: React 19 Fundamentals & Modern Hooks",
        description: "Explore the new React 19 compiler model, modern hooks, component lifecycle patterns, and optimized rendering strategies.",
        lessons: [
          { id: "l101", title: "JSX Syntax, Component Trees & Props Masterclass", duration: "45m", completed: true },
          { id: "l102", title: "State Management with useState & useReducer", duration: "50m", completed: true },
          { id: "l103", title: "Side Effects & Lifecycle with useEffect", duration: "40m", completed: true },
          { id: "l104", title: "Custom Hooks & Performance Optimization", duration: "55m", completed: true }
        ]
      },
      {
        id: "m2",
        title: "Module 2: Node.js & Express RESTful API Engineering",
        description: "Build robust backend microservices using Node.js and Express. Master middleware pipeline design and error handling.",
        lessons: [
          { id: "l201", title: "Express Server Setup & Middleware Pipeline", duration: "35m", completed: true },
          { id: "l202", title: "RESTful Endpoints & Controller Architecture", duration: "50m", completed: true },
          { id: "l203", title: "MongoDB Atlas Connection & Mongoose Schemas", duration: "60m", completed: false },
          { id: "l204", title: "JWT Authentication & Role-Based Authorization", duration: "65m", completed: false }
        ]
      },
      {
        id: "m3",
        title: "Module 3: Full-Stack Integration & Deployment",
        description: "Connect your React frontend with Express backend via Axios/Fetch API. Configure production environments.",
        lessons: [
          { id: "l301", title: "API Integration, Error Banners & Loading States", duration: "40m", completed: false },
          { id: "l302", title: "Production Build Optimization & Deployment", duration: "50m", completed: false }
        ]
      }
    ]
  },
  {
    _id: "c_ds",
    code: "DS-502",
    title: "Advanced Data Science & Machine Learning",
    category: "AI & Data Science",
    level: "Expert",
    estimatedHours: 56,
    thumbnailGradient: "linear-gradient(135deg, #059669 0%, #10b981 50%, #06b6d4 100%)",
    icon: "brain",
    description: "Dive deep into data manipulation, statistical modeling, supervised and unsupervised machine learning algorithms, deep learning with PyTorch, and deploying ML models to production APIs.",
    instructor: "Prof. Michael Rivera",
    instructorRole: "Head of Artificial Intelligence Research",
    instructorAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    instructorBio: "Prof. Michael Rivera is an AI researcher and consultant who has published over 30 peer-reviewed papers on neural network optimization and predictive modeling. He leads the Data Science & AI Department at Urban Tech Institute.",
    prerequisites: [
      "Solid foundation in Python programming",
      "Linear algebra, calculus, and introductory probability theory",
      "Experience with Jupyter Notebooks or Google Colab"
    ],
    learningOutcomes: [
      "Manipulate large datasets efficiently using Pandas and NumPy",
      "Train, evaluate, and tune supervised ML models (Regression, Random Forests)",
      "Build multi-layer neural networks using PyTorch",
      "Deploy ML model inferencing engines as REST API endpoints"
    ],
    totalLessons: 7,
    modules: [
      {
        id: "ds_m1",
        title: "Module 1: Python for Data Analysis & Pandas",
        description: "Master vector computations, data frame filtering, missing value imputation, and exploratory data analysis.",
        lessons: [
          { id: "ds_l101", title: "NumPy Vectors, Matrices & Math Functions", duration: "50m", completed: true },
          { id: "ds_l102", title: "Pandas DataFrames & Advanced Data Wrangling", duration: "60m", completed: true },
          { id: "ds_l103", title: "Exploratory Data Analysis & Matplotlib Visualization", duration: "55m", completed: true }
        ]
      },
      {
        id: "ds_m2",
        title: "Module 2: Supervised Machine Learning",
        description: "Implement regression models, classification trees, random forests, and hyperparameter tuning techniques.",
        lessons: [
          { id: "ds_l201", title: "Linear & Logistic Regression Implementations", duration: "65m", completed: true },
          { id: "ds_l202", title: "Decision Trees & Ensemble Random Forests", duration: "70m", completed: true },
          { id: "ds_l203", title: "Model Evaluation: Confusion Matrix & ROC Curves", duration: "60m", completed: true }
        ]
      },
      {
        id: "ds_m3",
        title: "Module 3: Deep Learning Foundations with PyTorch",
        description: "Construct artificial neural networks, activation functions, backpropagation algorithm, and loss optimization.",
        lessons: [
          { id: "ds_l301", title: "Neural Network Architectures & PyTorch Tensors", duration: "75m", completed: true }
        ]
      }
    ]
  },
  {
    _id: "c_cyber",
    code: "SEC-301",
    title: "Cybersecurity & Network Defense",
    category: "Security",
    level: "Intermediate",
    estimatedHours: 30,
    thumbnailGradient: "linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)",
    icon: "shield",
    description: "Learn foundational and advanced network security concepts including TCP/IP vulnerability assessment, firewall configuration, cryptographic algorithms, intrusion detection systems, and ethical hacking techniques.",
    instructor: "Cmdr. Robert Sterling",
    instructorRole: "Cyber Defense Consultant & Chief Information Security Officer",
    instructorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    instructorBio: "Cmdr. Robert Sterling served 12 years in defense cybersecurity and threat detection. He consults for global enterprise financial networks on zero-trust architecture and penetration testing.",
    prerequisites: [
      "Basic understanding of computer networking principles",
      "Familiarity with Linux command line terminal operations"
    ],
    learningOutcomes: [
      "Analyze network traffic packets using Wireshark and tcpdump",
      "Configure network firewalls and intrusion prevention systems (IPS)",
      "Understand public key cryptography, TLS/SSL, and digital signatures",
      "Conduct security audits and threat model assessments"
    ],
    totalLessons: 6,
    modules: [
      {
        id: "sec_m1",
        title: "Module 1: Network Architecture & Security Protocols",
        description: "Analyze the OSI and TCP/IP stack layers, packet structures, and protocol vulnerabilities.",
        lessons: [
          { id: "sec_l101", title: "TCP/IP Stack & Deep Packet Inspection", duration: "45m", completed: false },
          { id: "sec_l102", title: "Wireshark Packet Capture & Protocol Analysis", duration: "50m", completed: false }
        ]
      }
    ]
  }
];

// GET /api/courses - List all courses
router.get("/", async (req, res) => {
  try {
    let courses = await Course.find().catch(() => null);
    if (!courses || courses.length === 0) {
      courses = detailedCoursesCatalog;
    }
    res.json(courses);
  } catch (err) {
    res.json(detailedCoursesCatalog);
  }
});

// GET /api/courses/:id - Fetch single course details by ID or Code
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let course = null;

    // Try finding by Mongoose ID or Code if DB is connected
    try {
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        course = await Course.findById(id);
      }
      if (!course) {
        course = await Course.findOne({
          $or: [
            { code: id },
            { _id: id }
          ]
        });
      }
    } catch (dbErr) {
      // Mongoose connection offline - fallback to local catalog
      course = null;
    }

    // Fallback to detailed local seed database catalog if not found in MongoDB
    if (!course) {
      course = detailedCoursesCatalog.find(
        (c) => c._id === id || c.id === id || c.code === id || c.code.toLowerCase() === id.toLowerCase()
      );
    }

    if (!course) {
      // Default to first catalog item if requested ID is generic "demo"
      course = detailedCoursesCatalog[0];
    }

    const courseObj = (course && typeof course.toObject === 'function') ? course.toObject() : (course || detailedCoursesCatalog[0]);
    const matchingDetail = detailedCoursesCatalog.find(
      (c) => c.code === courseObj.code || c._id === courseObj._id || c._id === id || c.id === id
    ) || detailedCoursesCatalog[0];

    // Guarantee full description, instructor info, and syllabus details are present
    const enrichedCourse = {
      ...matchingDetail,
      ...courseObj,
      description: courseObj.description || matchingDetail.description,
      instructorRole: courseObj.instructorRole || matchingDetail.instructorRole,
      instructorBio: courseObj.instructorBio || matchingDetail.instructorBio,
      instructorAvatar: courseObj.instructorAvatar || matchingDetail.instructorAvatar,
      learningOutcomes: (courseObj.learningOutcomes && courseObj.learningOutcomes.length > 0) ? courseObj.learningOutcomes : matchingDetail.learningOutcomes,
      prerequisites: (courseObj.prerequisites && courseObj.prerequisites.length > 0) ? courseObj.prerequisites : matchingDetail.prerequisites
    };

    res.json(enrichedCourse);
  } catch (err) {
    console.error("Fetch course detail error:", err.message);
    const fallbackCourse = detailedCoursesCatalog.find((c) => c._id === req.params.id || c.id === req.params.id) || detailedCoursesCatalog[0];
    res.json(fallbackCourse);
  }
});

module.exports = router;

