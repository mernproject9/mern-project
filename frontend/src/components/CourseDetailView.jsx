import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const fallbackCoursesCatalog = [
  {
    id: "c_mern",
    _id: "c_mern",
    code: "CS-401",
    title: "Full-Stack MERN Architecture & React 19",
    category: "Web Development",
    level: "Advanced",
    estimatedHours: 42,
    thumbnailGradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
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
    id: "c_ds",
    _id: "c_ds",
    code: "DS-502",
    title: "Advanced Data Science & Machine Learning",
    category: "AI & Data Science",
    level: "Expert",
    estimatedHours: 56,
    thumbnailGradient: "linear-gradient(135deg, #059669 0%, #10b981 50%, #06b6d4 100%)",
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
    id: "c_cyber",
    _id: "c_cyber",
    code: "SEC-301",
    title: "Cybersecurity & Network Defense",
    category: "Security",
    level: "Intermediate",
    estimatedHours: 30,
    thumbnailGradient: "linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)",
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

export default function CourseDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedModule, setExpandedModule] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const API_URL = window.location.port === "5173" ? `/api/courses/${id}` : `http://localhost:5000/api/courses/${id}`;

    fetch(API_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load course details (Status ${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setCourse(data);
          if (data.modules && data.modules.length > 0) {
            setExpandedModule(data.modules[0].id || "m1");
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn("Course fetch note:", err);
          const fallback = fallbackCoursesCatalog.find(
            c => c.id === id || c._id === id || c.code === id || c.code.toLowerCase() === id.toLowerCase()
          ) || fallbackCoursesCatalog[0];
          setCourse(fallback);
          if (fallback.modules && fallback.modules.length > 0) {
            setExpandedModule(fallback.modules[0].id || "m1");
          }
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Back Navigation preserving scroll position
  const handleBackToCatalog = () => {
    const savedScrollPos = sessionStorage.getItem("catalog_scroll_pos");
    navigate("/");
    if (savedScrollPos) {
      setTimeout(() => {
        window.scrollTo({
          top: parseInt(savedScrollPos, 10),
          behavior: "instant"
        });
      }, 50);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container" style={{ textAlign: "center", padding: "4rem 2rem" }}>
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
        <h3 style={{ fontSize: "1.2rem", color: "var(--text-primary)" }}>
          Loading Course Details...
        </h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Fetching syllabus, description, and instructor information for ID: <code>{id}</code>
        </p>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="dashboard-container" style={{ padding: "3rem 1.5rem" }}>
        <button className="btn-secondary" onClick={handleBackToCatalog} style={{ marginBottom: "1.5rem" }}>
          ← Back to Catalog
        </button>
        <div style={{
          background: "rgba(239, 68, 68, 0.12)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          color: "#f87171",
          padding: "1.5rem",
          borderRadius: "var(--radius-md)"
        }}>
          <h3>Error Loading Course Details</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{ paddingBottom: "4rem" }}>
      {/* Back Navigation Bar */}
      <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          className="btn-secondary"
          onClick={handleBackToCatalog}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Course Catalog
        </button>

        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
          Course Route ID: {id}
        </span>
      </div>

      {/* Hero Banner Header */}
      <div style={{
        background: course?.thumbnailGradient || "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
        borderRadius: "var(--radius-lg)",
        padding: "2.5rem 2rem",
        color: "#ffffff",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        marginBottom: "2rem",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
          <span style={{ background: "rgba(255,255,255,0.2)", padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)", fontSize: "0.8rem", fontWeight: 700 }}>
            {course?.code || "CS-401"}
          </span>
          <span style={{ background: "rgba(0,0,0,0.25)", padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)", fontSize: "0.8rem", fontWeight: 600 }}>
            {course?.category || "Web Development"}
          </span>
          <span style={{ background: "rgba(16, 185, 129, 0.3)", color: "#a7f3d0", padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)", fontSize: "0.8rem", fontWeight: 700 }}>
            Level: {course?.level || "Intermediate"}
          </span>
        </div>

        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.75rem", lineHeight: 1.2 }}>
          {course?.title}
        </h1>

        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", fontSize: "0.9rem", opacity: 0.95, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Estimated {course?.estimatedHours || 40} Hours</span>
          </div>
          <div>
            📚 {course?.totalLessons || course?.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 10} Total Lessons
          </div>
          <div>
            👨‍🏫 Taught by <strong>{course?.instructor}</strong>
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Columns (Content & Sidebar) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem" }}>
        
        {/* Left Column: Full Description & Syllabus */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* Section 1: Full Course Description */}
          <div className="section-card" style={{ background: "var(--bg-secondary)", padding: "1.75rem" }}>
            <h2 style={{ fontSize: "1.25rem", color: "var(--text-primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              📖 Full Course Description
            </h2>
            
            <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
              {course?.description || "This course provides a comprehensive deep dive into core and advanced concepts. Gain hands-on practical experience through guided projects, code walk-throughs, and real-world architecture patterns."}
            </p>

            {/* Learning Outcomes */}
            {course?.learningOutcomes && course.learningOutcomes.length > 0 && (
              <div style={{ marginTop: "1.25rem", background: "var(--bg-card)", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                <h4 style={{ fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  🎯 What You Will Learn
                </h4>
                <ul style={{ paddingLeft: "1.25rem", margin: 0, color: "var(--text-secondary)", fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {course.learningOutcomes.map((outcome, idx) => (
                    <li key={idx} style={{ lineHeight: 1.5 }}>{outcome}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Prerequisites */}
            {course?.prerequisites && course.prerequisites.length > 0 && (
              <div style={{ marginTop: "1rem" }}>
                <h4 style={{ fontSize: "0.9rem", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                  📋 Course Prerequisites
                </h4>
                <ul style={{ paddingLeft: "1.25rem", margin: 0, color: "var(--text-muted)", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  {course.prerequisites.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Section 2: Complete Course Syllabus */}
          <div className="section-card" style={{ background: "var(--bg-secondary)", padding: "1.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.25rem", color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                📚 Course Syllabus & Modules
              </h2>
              <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                {course?.modules?.length || 0} Modules
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {course?.modules?.map((mod, modIdx) => {
                const isExpanded = expandedModule === mod.id;
                return (
                  <div
                    key={mod.id || modIdx}
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius-md)",
                      overflow: "hidden"
                    }}
                  >
                    <div
                      onClick={() => setExpandedModule(isExpanded ? null : mod.id)}
                      style={{
                        padding: "1rem 1.25rem",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: isExpanded ? "rgba(99, 102, 241, 0.08)" : "transparent",
                        transition: "background 0.2s ease"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{
                          color: "var(--accent-primary)",
                          transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                          transition: "transform 0.2s ease",
                          display: "inline-block"
                        }}>
                          ▶
                        </span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>
                            {mod.title}
                          </div>
                          {mod.description && (
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                              {mod.description}
                            </div>
                          )}
                        </div>
                      </div>

                      <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                        {mod.lessons?.length || 0} Lessons
                      </span>
                    </div>

                    {isExpanded && mod.lessons && (
                      <div style={{ borderTop: "1px solid var(--border-color)", padding: "0.75rem 1.25rem 1rem" }}>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                          {mod.lessons.map((les) => (
                            <li
                              key={les.id}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "0.5rem 0.75rem",
                                borderRadius: "var(--radius-sm)",
                                background: "var(--bg-secondary)",
                                fontSize: "0.88rem"
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                <span style={{ color: les.completed ? "var(--accent-success)" : "var(--text-muted)" }}>
                                  {les.completed ? "✓" : "📄"}
                                </span>
                                <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{les.title}</span>
                              </div>
                              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                                {les.duration}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Instructor Info & Enrollment Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Section 3: Instructor Information Card */}
          <div className="section-card" style={{ background: "var(--bg-secondary)", padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.05rem", color: "var(--text-primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              👤 Instructor Information
            </h3>

            <div style={{ textAlign: "center", marginBottom: "1rem" }}>
              <img
                src={course?.instructorAvatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"}
                alt={course?.instructor}
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid var(--accent-primary)",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                  marginBottom: "0.75rem"
                }}
              />
              <h4 style={{ fontSize: "1.1rem", margin: "0 0 0.2rem", color: "var(--text-primary)" }}>
                {course?.instructor}
              </h4>
              <div style={{ fontSize: "0.8rem", color: "var(--accent-primary)", fontWeight: 600 }}>
                {course?.instructorRole || "Lead Course Instructor"}
              </div>
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6, background: "var(--bg-card)", padding: "0.85rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
              {course?.instructorBio || `${course?.instructor} is an experienced industry educator specializing in ${course?.category}. They have taught thousands of engineering students worldwide.`}
            </p>
          </div>

          {/* Quick Details Sidebar Card */}
          <div className="section-card" style={{ background: "var(--bg-secondary)", padding: "1.5rem" }}>
            <h4 style={{ fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: "0.85rem" }}>
              ⚡ Course Quick Overview
            </h4>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
                <span style={{ color: "var(--text-secondary)" }}>Course Code:</span>
                <strong style={{ color: "var(--text-primary)" }}>{course?.code}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
                <span style={{ color: "var(--text-secondary)" }}>Category:</span>
                <strong style={{ color: "var(--text-primary)" }}>{course?.category}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
                <span style={{ color: "var(--text-secondary)" }}>Total Hours:</span>
                <strong style={{ color: "var(--text-primary)" }}>{course?.estimatedHours}h</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Certificate:</span>
                <span style={{ color: "var(--accent-success)", fontWeight: 700 }}>Included</span>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={handleBackToCatalog}
              style={{ width: "100%", justifyContent: "center", marginTop: "1.25rem" }}
            >
              Return to Catalog Dashboard
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
