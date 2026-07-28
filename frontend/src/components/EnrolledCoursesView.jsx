import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function EnrolledCoursesView({
  courses = [],
  currentStudent,
  onOpenEnrollModal,
  onSelectCourse,
  onOpenCertificate
}) {
  const navigate = useNavigate();

  // Enrolled courses state loaded from API
  const [enrolledList, setEnrolledList] = useState(courses);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Filter & Search states
  const [statusTab, setStatusTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Sync state if prop updates
  useEffect(() => {
    if (courses && courses.length > 0) {
      setEnrolledList(courses);
    }
  }, [courses]);

  // Fetch user's enrolled courses from backend GET /users/:id/enrollments endpoint
  useEffect(() => {
    let isMounted = true;
    const fetchUserEnrollments = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const studentId = currentStudent?.id || "demo_1";
        // Connect frontend to backend GET /users/:id/enrollments API
        const API_URL = window.location.port === "5173"
          ? `/api/users/${studentId}/enrollments`
          : `http://localhost:5000/users/${studentId}/enrollments`;

        const res = await fetch(API_URL);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Failed to fetch enrollments`);
        }
        const data = await res.json();
        if (isMounted && Array.isArray(data)) {
          setEnrolledList(data);
        }
      } catch (err) {
        if (isMounted) {
          console.warn("Enrollments API connection note:", err.message);
          setFetchError("Backend offline, using cached enrollments.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUserEnrollments();

    return () => {
      isMounted = false;
    };
  }, [currentStudent?.id]);

  // Active courses list to display
  const activeCourses = enrolledList.length > 0 ? enrolledList : courses;

  // Save scroll position prior to opening detail view
  const handleCourseClick = () => {
    sessionStorage.setItem("catalog_scroll_pos", window.scrollY.toString());
  };

  // Metrics summary calculation
  const stats = useMemo(() => {
    const total = activeCourses.length;
    let inProgress = 0;
    let completed = 0;
    let notStarted = 0;

    activeCourses.forEach((c) => {
      if (c.progressPercentage >= 100 || c.status === "completed") {
        completed++;
      } else if (c.progressPercentage === 0 || c.status === "not-started") {
        notStarted++;
      } else {
        inProgress++;
      }
    });

    return { total, inProgress, completed, notStarted };
  }, [activeCourses]);

  // Categories list
  const categoriesList = useMemo(() => {
    const cats = new Set(activeCourses.map((c) => c.category));
    return ["all", ...Array.from(cats)];
  }, [activeCourses]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return activeCourses.filter((c) => {
      // Status filter
      if (statusTab === "in-progress" && (c.progressPercentage === 0 || c.progressPercentage >= 100)) return false;
      if (statusTab === "completed" && c.progressPercentage < 100) return false;
      if (statusTab === "not-started" && c.progressPercentage > 0) return false;

      // Category filter
      if (categoryFilter !== "all" && c.category !== categoryFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = c.title?.toLowerCase().includes(q);
        const matchCode = c.code?.toLowerCase().includes(q);
        const matchInstructor = c.instructor?.toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchInstructor) return false;
      }

      return true;
    });
  }, [activeCourses, statusTab, categoryFilter, searchQuery]);

  return (
    <div className="dashboard-container" style={{ paddingBottom: "4rem" }}>
      {/* Top Header & Breadcrumb */}
      <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link
          to="/"
          className="btn-secondary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "0.85rem"
          }}
        >
          ← Return to Main Dashboard
        </Link>

        <button className="btn-primary" onClick={onOpenEnrollModal}>
          + Enroll New Course
        </button>
      </div>

      {/* Hero Welcome Banner */}
      <div
        className="section-card"
        style={{
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)",
          border: "1px solid var(--border-glow)",
          marginBottom: "2rem",
          padding: "2rem"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
              <span style={{ fontSize: "1.5rem" }}>📚</span>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>
                My Enrolled Courses ({courses.length})
              </h1>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
              View and manage all courses active for <strong>{currentStudent?.name || "Student"}</strong>. Click any course title to access full syllabus, lessons, and instructor details.
            </p>
          </div>

          {/* Quick Stats Pills */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <div
              style={{
                background: "var(--bg-card)",
                padding: "0.6rem 1rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
                textAlign: "center"
              }}
            >
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--accent-primary)" }}>{stats.total}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Total Enrolled</div>
            </div>

            <div
              style={{
                background: "var(--bg-card)",
                padding: "0.6rem 1rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
                textAlign: "center"
              }}
            >
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--accent-info)" }}>{stats.inProgress}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>In Progress</div>
            </div>

            <div
              style={{
                background: "var(--bg-card)",
                padding: "0.6rem 1rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
                textAlign: "center"
              }}
            >
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--accent-success)" }}>{stats.completed}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Section Card */}
      <div className="section-card">
        {/* Controls Bar */}
        <div className="section-header" style={{ flexWrap: "wrap", gap: "1rem" }}>
          <div className="tab-group">
            <button
              className={`tab-btn ${statusTab === "all" ? "active" : ""}`}
              onClick={() => setStatusTab("all")}
            >
              All Courses ({stats.total})
            </button>
            <button
              className={`tab-btn ${statusTab === "in-progress" ? "active" : ""}`}
              onClick={() => setStatusTab("in-progress")}
            >
              In-Progress ({stats.inProgress})
            </button>
            <button
              className={`tab-btn ${statusTab === "completed" ? "active" : ""}`}
              onClick={() => setStatusTab("completed")}
            >
              Completed ({stats.completed})
            </button>
            <button
              className={`tab-btn ${statusTab === "not-started" ? "active" : ""}`}
              onClick={() => setStatusTab("not-started")}
            >
              Not Started ({stats.notStarted})
            </button>
          </div>

          <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Category:</span>
              <select
                className="select-input"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="text"
              className="select-input"
              style={{ minWidth: "200px" }}
              placeholder="🔍 Search enrolled..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Enrolled Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="courses-grid" style={{ marginTop: "1rem" }}>
            {filteredCourses.map((course) => {
              const targetId = course.id || course._id || course.code;
              const isCompleted = course.progressPercentage >= 100 || course.status === "completed";
              const isNotStarted = course.progressPercentage === 0 || course.status === "not-started";

              return (
                <div key={course.id || course._id} className="course-card" style={{ display: "flex", flexDirection: "column" }}>
                  {/* Banner Header */}
                  <div
                    className="course-banner"
                    style={{ background: course.thumbnailGradient || "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" }}
                  >
                    <span className="course-badge">{course.category}</span>
                    {isCompleted ? (
                      <span className="course-status-pill status-completed">✓ Completed</span>
                    ) : isNotStarted ? (
                      <span className="course-status-pill" style={{ background: "rgba(245, 158, 11, 0.9)", color: "#fff" }}>
                        Not Started
                      </span>
                    ) : (
                      <span className="course-status-pill status-active">▶ In Progress</span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="course-body" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                    <div className="course-code">{course.code}</div>

                    {/* Course Title as explicit direct Link to detail view */}
                    <h3 className="course-title" style={{ marginTop: "0.25rem", marginBottom: "0.5rem" }}>
                      <Link
                        to={`/course/${targetId}`}
                        onClick={handleCourseClick}
                        style={{
                          color: "var(--text-primary)",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          transition: "color 0.2s ease"
                        }}
                        className="enrolled-course-title-link"
                      >
                        {course.title}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                      </Link>
                    </h3>

                    {/* Instructor Info */}
                    <div className="course-instructor" style={{ marginBottom: "1rem" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      Instructor: <strong>{course.instructor}</strong>
                    </div>

                    {/* Progress Bar */}
                    <div className="progress-container" style={{ marginTop: "auto", marginBottom: "1rem" }}>
                      <div className="progress-header">
                        <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                          {course.completedLessons || 0} of {course.totalLessons || 10} Lessons Completed
                        </span>
                        <span
                          style={{
                            color: isCompleted ? "var(--accent-success)" : "var(--accent-primary)",
                            fontWeight: 700,
                            fontSize: "0.85rem"
                          }}
                        >
                          {course.progressPercentage || 0}%
                        </span>
                      </div>
                      <div className="progress-track">
                        <div
                          className={`progress-fill ${isCompleted ? "completed" : ""}`}
                          style={{
                            width: `${course.progressPercentage || 0}%`,
                            background: isCompleted
                              ? "linear-gradient(90deg, #10b981 0%, #059669 100%)"
                              : "var(--gradient-brand)"
                          }}
                        />
                      </div>
                    </div>

                    {/* Quick Link Buttons Footer */}
                    <div className="course-card-footer" style={{ gap: "0.5rem", marginTop: "0.5rem" }}>
                      {/* Direct Link button to Course Detail view */}
                      <Link
                        to={`/course/${targetId}`}
                        onClick={handleCourseClick}
                        className="btn-card-action primary"
                        style={{
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.4rem"
                        }}
                      >
                        📖 View Detail Page
                      </Link>

                      {/* Modal Syllabus trigger */}
                      {onSelectCourse && (
                        <button
                          className="btn-card-action"
                          onClick={() => onSelectCourse(course)}
                          title="View Lessons Checklist"
                          style={{ width: "auto", padding: "0.55rem 0.75rem" }}
                        >
                          📋
                        </button>
                      )}

                      {/* Certificate trigger if completed */}
                      {isCompleted && onOpenCertificate && (
                        <button
                          className="btn-card-action"
                          onClick={() => onOpenCertificate(course)}
                          title="View Certificate"
                          style={{ width: "auto", padding: "0.55rem 0.75rem" }}
                        >
                          🎓
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Friendly Empty State */
          <div
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              background: "var(--bg-secondary)",
              borderRadius: "var(--radius-lg)",
              border: "1px dashed var(--border-color)",
              margin: "1.5rem 0"
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "rgba(99, 102, 241, 0.12)",
                color: "var(--accent-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.5rem",
                margin: "0 auto 1.5rem"
              }}
            >
              🎓
            </div>

            <h3 style={{ fontSize: "1.35rem", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
              {courses.length === 0 ? "No Enrolled Courses Found" : "No Matching Courses Found"}
            </h3>

            <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", maxWidth: "480px", margin: "0 auto 1.75rem", lineHeight: 1.6 }}>
              {courses.length === 0
                ? "You are not enrolled in any courses yet. Explore our extensive course catalog to kickstart your learning journey!"
                : `No enrolled courses matched your search or status filter "${statusTab}". Try clearing filters or searching another keyword.`}
            </p>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              {courses.length > 0 && (
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setStatusTab("all");
                    setCategoryFilter("all");
                    setSearchQuery("");
                  }}
                >
                  Clear Filters
                </button>
              )}

              <button className="btn-primary" onClick={onOpenEnrollModal}>
                + Explore Course Catalog & Enroll
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
