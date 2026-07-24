import { useState, useEffect, useMemo } from "react";
import Navbar from "./components/Navbar";
import CourseDetailModal from "./components/CourseDetailModal";
import EnrollCourseModal from "./components/EnrollCourseModal";
import CertificateModal from "./components/CertificateModal";
import StudentSwitcherModal from "./components/StudentSwitcherModal";
import AdminDashboard from "./components/AdminDashboard";
import StudentDashboard from "./components/StudentDashboard";
import JwtTokenModal from "./components/JwtTokenModal";

// Initial fallback mock data
const initialMockData = {
  student: {
    id: "demo_1",
    name: "Alex Morgan",
    email: "alex.morgan@university.edu",
    department: "Computer Science & AI",
    studentIdCode: "STU-2026-8942",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    streakDays: 14,
    totalLearningHours: 48.5
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
  courses: [
    {
      id: "c_mern",
      title: "Full-Stack MERN Architecture & React 19",
      code: "CS-401",
      category: "Web Development",
      instructor: "Dr. Sarah Jenkins",
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
      title: "Advanced Data Science & Machine Learning",
      code: "DS-502",
      category: "AI & Data Science",
      instructor: "Prof. Michael Rivera",
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
      title: "Cybersecurity & Network Defense",
      code: "SEC-301",
      category: "Security",
      instructor: "Cmdr. Robert Sterling",
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
  ]
};

function App() {
  const [theme, setTheme] = useState("dark");
  
  // Authentication State Guard
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [authEmail, setAuthEmail] = useState("alex.morgan@university.edu");
  const [userRole, setUserRole] = useState("student"); // "student" or "admin"
  const [viewMode, setViewMode] = useState("student"); // "student" or "admin"

  // JWT Tokens
  const [studentToken, setStudentToken] = useState("");
  const [adminToken, setAdminToken] = useState("");

  const [currentStudent, setCurrentStudent] = useState(initialMockData.student);
  const [courses, setCourses] = useState(initialMockData.courses);
  const [weeklyActivity] = useState(initialMockData.weeklyActivity);
  
  // Async Loading & Error Handling States
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Filter & Search states
  const [statusTab, setStatusTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("progress-desc");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [selectedCourseModal, setSelectedCourseModal] = useState(null);
  const [selectedCertificateCourse, setSelectedCertificateCourse] = useState(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

  // Apply dark/light theme attribute to root
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Update document title
  useEffect(() => {
    document.title = isAuthenticated
      ? `EduPulse | ${viewMode === "admin" ? "Admin Portal" : currentStudent?.name + "'s Progress Dashboard"}`
      : "EduPulse | Student Authentication Required";
  }, [isAuthenticated, currentStudent, viewMode]);

  // Fetch demo JWT tokens from API on startup
  useEffect(() => {
    fetch("/api/auth/demo-tokens")
      .then(res => res.json())
      .then(data => {
        if (data.student) setStudentToken(data.student.token);
        if (data.admin) setAdminToken(data.admin.token);
      })
      .catch(err => console.warn("Demo tokens note:", err.message));
  }, []);

  // Fetch student progress data from backend API
  const fetchDashboardData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setApiError(null);
    try {
      const studentId = currentStudent?.id || "demo";
      const headers = studentToken ? { Authorization: `Bearer ${studentToken}` } : {};
      const endpoint = studentToken ? "/api/dashboard/me" : `/api/dashboard/${studentId}`;
      const res = await fetch(endpoint, { headers });
      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: Failed to load student progress`);
      }
      const data = await res.json();
      if (data.courses) setCourses(data.courses);
      if (data.student) setCurrentStudent(prev => ({ ...prev, ...data.student }));
    } catch (err) {
      console.warn("API Connection note:", err.message);
      setApiError("Backend connection offline. Using local cached progress data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentStudent?.id, isAuthenticated, studentToken]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  // Toggle lesson completion handler
  const handleToggleLesson = async (courseId, lessonId) => {
    setCourses(prevCourses => {
      return prevCourses.map(c => {
        if (c.id !== courseId) return c;

        let totalL = 0;
        let completedL = 0;

        const updatedModules = c.modules.map(mod => {
          const updatedLessons = mod.lessons.map(les => {
            totalL++;
            const isTarget = les.id === lessonId;
            const isCompleted = isTarget ? !les.completed : les.completed;
            if (isCompleted) completedL++;
            return { ...les, completed: isCompleted };
          });
          return { ...mod, lessons: updatedLessons };
        });

        const pct = Math.min(100, Math.round((completedL / (totalL || 1)) * 100));
        let status = "in-progress";
        if (pct >= 100) status = "completed";
        else if (pct === 0) status = "not-started";

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

        const updatedCourse = {
          ...c,
          completedLessons: completedL,
          totalLessons: totalL,
          progressPercentage: pct,
          status,
          nextLesson,
          modules: updatedModules
        };

        if (selectedCourseModal && selectedCourseModal.id === courseId) {
          setSelectedCourseModal(updatedCourse);
        }

        return updatedCourse;
      });
    });

    try {
      const headers = {
        "Content-Type": "application/json",
        ...(studentToken ? { Authorization: `Bearer ${studentToken}` } : {})
      };
      await fetch(`/api/dashboard/${currentStudent?.id || 'demo'}/toggle-lesson`, {
        method: "POST",
        headers,
        body: JSON.stringify({ courseId, lessonId })
      });
    } catch (e) {
      // Local state sync succeeds
    }
  };

  // Enroll in course handler
  const handleEnrollCourse = (newCourseData) => {
    const newCourse = {
      id: "c_" + Date.now(),
      title: newCourseData.title,
      code: newCourseData.code,
      category: newCourseData.category,
      instructor: newCourseData.instructor,
      thumbnailGradient: newCourseData.thumbnailGradient,
      totalLessons: newCourseData.totalLessons || 10,
      completedLessons: 0,
      progressPercentage: 0,
      status: "not-started",
      modules: newCourseData.modules || []
    };

    setCourses(prev => [newCourse, ...prev]);
    setIsEnrollModalOpen(false);
  };

  // Computed summary metrics
  const calculatedStats = useMemo(() => {
    const totalEnrolled = courses.length;
    let inProgressCount = 0;
    let completedCount = 0;
    let notStartedCount = 0;
    let totalCompletedLessons = 0;
    let totalAllLessons = 0;

    courses.forEach(c => {
      totalCompletedLessons += c.completedLessons || 0;
      totalAllLessons += c.totalLessons || 0;

      if (c.progressPercentage >= 100 || c.status === "completed") {
        completedCount++;
      } else if (c.progressPercentage === 0 || c.status === "not-started") {
        notStartedCount++;
      } else {
        inProgressCount++;
      }
    });

    const overallRate = totalAllLessons > 0 ? Math.round((totalCompletedLessons / totalAllLessons) * 100) : 0;

    return {
      totalEnrolled,
      inProgressCount,
      completedCount,
      notStartedCount,
      totalCompletedLessons,
      totalAllLessons,
      overallRate
    };
  }, [courses]);

  // Unique categories list
  const categoriesList = useMemo(() => {
    const cats = new Set(courses.map(c => c.category));
    return ["all", ...Array.from(cats)];
  }, [courses]);

  // Filtered & sorted courses
  const filteredCourses = useMemo(() => {
    return courses
      .filter(c => {
        if (statusTab === "in-progress" && (c.progressPercentage === 0 || c.progressPercentage >= 100)) return false;
        if (statusTab === "completed" && c.progressPercentage < 100) return false;
        if (statusTab === "not-started" && c.progressPercentage > 0) return false;

        if (categoryFilter !== "all" && c.category !== categoryFilter) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = c.title.toLowerCase().includes(q);
          const matchCode = c.code.toLowerCase().includes(q);
          const matchInstructor = c.instructor.toLowerCase().includes(q);
          if (!matchTitle && !matchCode && !matchInstructor) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "progress-desc") return b.progressPercentage - a.progressPercentage;
        if (sortBy === "progress-asc") return a.progressPercentage - b.progressPercentage;
        if (sortBy === "title") return a.title.localeCompare(b.title);
        return 0;
      });
  }, [courses, statusTab, categoryFilter, sortBy, searchQuery]);

  // Authentication Login Handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!authEmail) return;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authEmail,
          password: "password123",
          requestedRole: userRole
        })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        if (data.user.role === "admin") {
          setAdminToken(data.token);
          setViewMode("admin");
        } else {
          setStudentToken(data.token);
          setViewMode("student");
        }
      }
    } catch (err) {
      console.warn("Login fallback:", err.message);
    }

    setIsAuthenticated(true);
    if (userRole === "admin") {
      setViewMode("admin");
    } else {
      setViewMode("student");
      setCurrentStudent(prev => ({ ...prev, email: authEmail, name: authEmail.split("@")[0].toUpperCase() }));
    }
  };

  // Render Authentication Guard screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="app-wrapper" style={{ justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: "2rem" }}>
        <div style={{
          maxWidth: "420px",
          width: "100%",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          padding: "2rem",
          boxShadow: "var(--shadow-lg)",
          textAlign: "center"
        }}>
          <div className="brand-icon-wrapper" style={{ margin: "0 auto 1rem", width: "50px", height: "50px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>

          <h2 style={{ fontSize: "1.4rem", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
            Urban EdTech Portal Login
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            Authenticate with Student or Admin credentials to receive a signed JWT token and access protected routes.
          </p>

          <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", textAlign: "left" }}>
            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                Select Login Role
              </label>
              <div className="tab-group" style={{ marginBottom: "0.5rem" }}>
                <button
                  type="button"
                  className={`tab-btn ${userRole === 'student' ? 'active' : ''}`}
                  onClick={() => { setUserRole('student'); setAuthEmail('alex.morgan@university.edu'); }}
                  style={{ flex: 1 }}
                >
                  🎓 Student Role
                </button>
                <button
                  type="button"
                  className={`tab-btn ${userRole === 'admin' ? 'active' : ''}`}
                  onClick={() => { setUserRole('admin'); setAuthEmail('admin@urban.edu'); }}
                  style={{ flex: 1 }}
                >
                  🛡️ Admin Role
                </button>
              </div>
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                Email Address
              </label>
              <input
                type="email"
                className="search-input"
                style={{ paddingLeft: "1rem" }}
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder={userRole === "admin" ? "admin@urban.edu" : "student@university.edu"}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                Passcode / Token
              </label>
              <input
                type="password"
                className="search-input"
                style={{ paddingLeft: "1rem" }}
                defaultValue="••••••••"
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ justifyContent: "center", marginTop: "0.5rem" }}>
              Authenticate JWT & View Dashboard
            </button>
          </form>

          <div style={{ marginTop: "1.25rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>
            Current Selected Role: <strong style={{ color: userRole === "admin" ? "#f87171" : "var(--accent-primary)" }}>{userRole.toUpperCase()}</strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <Navbar
        currentStudent={currentStudent}
        theme={theme}
        toggleTheme={toggleTheme}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenStudentModal={() => setIsStudentModalOpen(true)}
        onOpenEnrollModal={() => setIsEnrollModalOpen(true)}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(prev => prev === "admin" ? "student" : "admin")}
        userRole={userRole}
        jwtToken={viewMode === "admin" ? adminToken : studentToken}
        onOpenTokenModal={() => setIsTokenModalOpen(true)}
      />

      <main className="dashboard-container">
        {/* Render Admin Dashboard if viewMode is admin */}
        {viewMode === "admin" ? (
          <AdminDashboard
            adminToken={adminToken}
            onSwitchToStudent={() => setViewMode("student")}
          />
        ) : (
          /* Render Student Dashboard Component */
          <StudentDashboard
            currentStudent={currentStudent}
            calculatedStats={calculatedStats}
            courses={courses}
            loading={loading}
            weeklyActivity={weeklyActivity}
            searchQuery={searchQuery}
            apiError={apiError}
            fetchDashboardData={fetchDashboardData}
            onSignOut={() => setIsAuthenticated(false)}
            onOpenEnrollModal={() => setIsEnrollModalOpen(true)}
            onSelectCourse={(c) => setSelectedCourseModal(c)}
            onOpenCertificate={(c) => setSelectedCertificateCourse(c)}
          />
        )}
      </main>

      {/* Modals */}
      {selectedCourseModal && (
        <CourseDetailModal
          course={selectedCourseModal}
          onClose={() => setSelectedCourseModal(null)}
          onToggleLesson={handleToggleLesson}
          onOpenCertificate={(c) => {
            setSelectedCourseModal(null);
            setSelectedCertificateCourse(c);
          }}
        />
      )}

      {selectedCertificateCourse && (
        <CertificateModal
          course={selectedCertificateCourse}
          student={currentStudent}
          onClose={() => setSelectedCertificateCourse(null)}
        />
      )}

      {isEnrollModalOpen && (
        <EnrollCourseModal
          onClose={() => setIsEnrollModalOpen(false)}
          onEnrollCourse={handleEnrollCourse}
        />
      )}

      {isStudentModalOpen && (
        <StudentSwitcherModal
          currentStudent={currentStudent}
          onSelectStudent={(st) => setCurrentStudent(st)}
          onClose={() => setIsStudentModalOpen(false)}
        />
      )}

      {isTokenModalOpen && (
        <JwtTokenModal
          studentToken={studentToken}
          adminToken={adminToken}
          onClose={() => setIsTokenModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;