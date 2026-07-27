import { useState, useEffect, useMemo } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import StatCard from "./components/StatCard";
import OverallProgressGauge from "./components/OverallProgressGauge";
import CourseCard from "./components/CourseCard";
import CourseDetailModal from "./components/CourseDetailModal";
import WeeklyActivityChart from "./components/WeeklyActivityChart";
import UpcomingDeadlines from "./components/UpcomingDeadlines";
import EnrollCourseModal from "./components/EnrollCourseModal";
import CertificateModal from "./components/CertificateModal";
import StudentSwitcherModal from "./components/StudentSwitcherModal";
import LoginForm from "./components/LoginForm";
import CourseDetailView from "./components/CourseDetailView";

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
  
  // Authentication State Guard & LocalStorage Token Management
  const [authToken, setAuthToken] = useState(() => localStorage.getItem("urban_edu_token") || null);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("urban_edu_user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [currentStudent, setCurrentStudent] = useState(initialMockData.student);
  const [courses, setCourses] = useState(initialMockData.courses);
  const [weeklyActivity] = useState(initialMockData.weeklyActivity);
  
  // Async Loading & Error Handling States
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Filter & Search states
  const [statusTab, setStatusTab] = useState("all"); // "all", "in-progress", "completed", "not-started"
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("progress-desc");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [selectedCourseModal, setSelectedCourseModal] = useState(null);
  const [selectedCertificateCourse, setSelectedCertificateCourse] = useState(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  // Apply dark/light theme attribute to root
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Update document title
  useEffect(() => {
    document.title = isAuthenticated
      ? `EduPulse | ${currentStudent?.name || 'Student'}'s Progress Dashboard`
      : "EduPulse | Student Authentication Required";
  }, [isAuthenticated, currentStudent]);

  // Fetch student progress data from backend API
  const fetchDashboardData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setApiError(null);
    try {
      const studentId = currentStudent?.id || "demo";
      const res = await fetch(`/api/dashboard/${studentId}`);
      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: Failed to load student progress`);
      }
      const data = await res.json();
      if (data.courses) setCourses(data.courses);
      if (data.student) setCurrentStudent(prev => ({ ...prev, ...data.student }));
    } catch (err) {
      console.warn("API Connection note:", err.message);
      // Fallback to reactive local store so application remains 100% operational
      setApiError("Backend connection offline. Using local cached progress data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentStudent?.id, isAuthenticated]);

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
      await fetch(`/api/dashboard/${currentStudent?.id || 'demo'}/toggle-lesson`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, lessonId })
      });
    } catch (e) {
      // Local reactive update succeeds seamlessly
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
        // Status tab filtering
        if (statusTab === "in-progress" && (c.progressPercentage === 0 || c.progressPercentage >= 100)) return false;
        if (statusTab === "completed" && c.progressPercentage < 100) return false;
        if (statusTab === "not-started" && c.progressPercentage > 0) return false;

        // Category filter
        if (categoryFilter !== "all" && c.category !== categoryFilter) return false;

        // Search query
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

  // Authentication Handlers
  const handleLoginSuccess = ({ token, user }) => {
    if (token) {
      localStorage.setItem("urban_edu_token", token);
      setAuthToken(token);
    }
    if (user) {
      localStorage.setItem("urban_edu_user", JSON.stringify(user));
      setCurrentUser(user);
      setCurrentStudent(prev => ({
        ...prev,
        id: user.id || prev.id,
        name: user.name || prev.name,
        email: user.email || prev.email,
        department: user.department || prev.department,
        avatar: user.avatar || prev.avatar,
        role: user.role
      }));
    }
    setIsAuthenticated(true);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("urban_edu_token");
    localStorage.removeItem("urban_edu_user");
    setAuthToken(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // Render Authentication Guard screen if student is not authenticated
  if (!isAuthenticated) {
    return (
      <div className="app-wrapper" style={{ justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: "2rem" }}>
        <LoginForm
          onLoginSuccess={handleLoginSuccess}
          onClose={null}
        />
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
      />

      <Routes>
        <Route
          path="/"
          element={
            <main className="dashboard-container">
        {/* API Connection Warning Banner if offline */}
        {apiError && (
          <div style={{
            background: "rgba(245, 158, 11, 0.15)",
            border: "1px solid var(--accent-warning)",
            color: "#fbbf24",
            padding: "0.75rem 1.25rem",
            borderRadius: "var(--radius-md)",
            marginBottom: "1.5rem",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <span>⚡ {apiError}</span>
            <button
              onClick={fetchDashboardData}
              style={{
                background: "var(--accent-warning)",
                border: "none",
                color: "black",
                padding: "0.3rem 0.75rem",
                borderRadius: "var(--radius-sm)",
                fontWeight: 600,
                fontSize: "0.78rem",
                cursor: "pointer"
              }}
            >
              Retry API
            </button>
          </div>
        )}

        {/* Dashboard Welcome Header */}
        <header className="dashboard-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
              <h1 className="welcome-title">Welcome back, {currentStudent?.name || "Student"}! 👋</h1>
              <span style={{
                background: "rgba(16, 185, 129, 0.15)",
                color: "#34d399",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                padding: "0.2rem 0.6rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.75rem",
                fontWeight: 700
              }}>
                🔒 Authenticated Student
              </span>
            </div>
            <p className="welcome-subtitle">
              Overview of your enrolled courses, real-time completion rates, and active study milestones.
            </p>
          </div>

          <div className="header-cta-group">
            <button className="btn-secondary" onClick={handleLogout}>
              🔒 Sign Out
            </button>
            <button className="btn-secondary" onClick={() => setIsLoginModalOpen(true)}>
              🔑 JWT Auth Modal
            </button>
            <button className="btn-primary" onClick={() => setIsEnrollModalOpen(true)}>
              + Enroll New Course
            </button>
          </div>
        </header>

        {/* KPI Status Summary Cards */}
        <section className="stats-grid">
          <StatCard
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>}
            colorClass="icon-purple"
            title="Total Enrolled Courses"
            value={calculatedStats.totalEnrolled}
            trend="All Enrolled"
            trendType="neutral"
            subtext="Total student enrollments"
          />

          <StatCard
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
            colorClass="icon-cyan"
            title="In-Progress Courses"
            value={calculatedStats.inProgressCount}
            trend="Active Learning"
            trendType="up"
            subtext="0% < Progress < 100%"
          />

          <StatCard
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
            colorClass="icon-emerald"
            title="Completed Courses"
            value={calculatedStats.completedCount}
            trend={`${calculatedStats.completedCount} Certificates`}
            trendType="up"
            subtext="100% Finished"
          />

          <StatCard
            icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
            colorClass="icon-amber"
            title="Not Started Courses"
            value={calculatedStats.notStartedCount}
            trend="Pending Start"
            trendType="neutral"
            subtext="0% Progress"
          />
        </section>

        {/* Dashboard Container & Grid */}
        <div className="dashboard-main-grid">
          {/* Main Enrolled Courses View */}
          <div>
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                  </svg>
                  Enrolled Course Progress ({filteredCourses.length})
                </h2>

                <div className="tab-group">
                  <button
                    className={`tab-btn ${statusTab === 'all' ? 'active' : ''}`}
                    onClick={() => setStatusTab('all')}
                  >
                    All ({courses.length})
                  </button>
                  <button
                    className={`tab-btn ${statusTab === 'in-progress' ? 'active' : ''}`}
                    onClick={() => setStatusTab('in-progress')}
                  >
                    In-Progress ({calculatedStats.inProgressCount})
                  </button>
                  <button
                    className={`tab-btn ${statusTab === 'completed' ? 'active' : ''}`}
                    onClick={() => setStatusTab('completed')}
                  >
                    Completed ({calculatedStats.completedCount})
                  </button>
                  <button
                    className={`tab-btn ${statusTab === 'not-started' ? 'active' : ''}`}
                    onClick={() => setStatusTab('not-started')}
                  >
                    Not Started ({calculatedStats.notStartedCount})
                  </button>
                </div>
              </div>

              {/* Filters & Controls */}
              <div className="filter-bar">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Category:</span>
                  <select
                    className="select-input"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    {categoriesList.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === "all" ? "All Categories" : cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Sort By:</span>
                  <select
                    className="select-input"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="progress-desc">Progress: Highest First</option>
                    <option value="progress-asc">Progress: Lowest First</option>
                    <option value="title">Course Title (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* Course Cards Layout Grid */}
              {loading ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
                  <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>⏳</div>
                  Fetching real-time course progress from API...
                </div>
              ) : filteredCourses.length > 0 ? (
                <div className="courses-grid">
                  {filteredCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onSelectCourse={(c) => setSelectedCourseModal(c)}
                      onOpenCertificate={(c) => setSelectedCertificateCourse(c)}
                    />
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: "center",
                  padding: "3rem 1.5rem",
                  background: "var(--bg-card)",
                  borderRadius: "var(--radius-md)",
                  border: "1px dashed var(--border-color)"
                }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📖</div>
                  <h3 style={{ fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                    No Enrolled Courses Found
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                    {searchQuery ? `No matches for "${searchQuery}"` : `No courses in the "${statusTab}" filter.`}
                  </p>
                  <button className="btn-primary" onClick={() => setIsEnrollModalOpen(true)}>
                    Explore Catalog & Enroll
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column Analytics Sidebar */}
          <div>
            <div className="section-card">
              <div className="section-header">
                <h3 className="section-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 2a10 10 0 0 1 10 10"/>
                  </svg>
                  Overall Progress Rate
                </h3>
              </div>

              <OverallProgressGauge
                percentage={calculatedStats.overallRate}
                totalCompleted={calculatedStats.totalCompletedLessons}
                totalLessons={calculatedStats.totalAllLessons}
              />
            </div>

            <WeeklyActivityChart data={weeklyActivity} />
            <UpcomingDeadlines />
          </div>
        </div>
      </main>
          }
        />
        <Route path="/course/:id" element={<CourseDetailView />} />
      </Routes>

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

      {isLoginModalOpen && (
        <LoginForm
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;