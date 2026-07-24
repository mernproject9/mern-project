import { useState, useEffect } from "react";
import StatCard from "./StatCard";
import EnrollmentStatsChart from "./EnrollmentStatsChart";

// Helper function to decode JWT payload
const parseJwt = (token) => {
  try {
    if (!token) return null;
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export default function AdminDashboard({ adminToken, onSwitchToStudent }) {
  // Decode JWT payload & check role before rendering form
  const decodedPayload = parseJwt(adminToken);
  const isAdminRole = decodedPayload && decodedPayload.role && decodedPayload.role.toLowerCase() === "admin";

  const [adminStats, setAdminStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalEnrollments: 0,
    activeEnrollments: 0,
    completedCertificates: 0,
    overallCompletionRate: 0,
    systemHealth: "Optimal",
    platformRegion: "Urban Metro Hubs"
  });

  const [courses, setCourses] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiLog, setApiLog] = useState(null);

  // New course form state
  const [newCourse, setNewCourse] = useState({
    title: "",
    code: "",
    category: "Web Development",
    duration: "",
    description: "",
    instructor: "",
    estimatedHours: ""
  });

  // Validation & Feedback state
  const [validationErrors, setValidationErrors] = useState({});
  const [formSuccess, setFormSuccess] = useState(null);
  const [formError, setFormError] = useState(null);

  // Fetch courses from database (Admin Endpoint)
  const fetchCoursesList = async () => {
    setCoursesLoading(true);
    try {
      const res = await fetch("/api/admin/courses", {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
      const data = await res.json();
      if (res.ok && data.courses) {
        setCourses(data.courses);
      }
    } catch (err) {
      console.warn("Failed to fetch admin courses list:", err.message);
    } finally {
      setCoursesLoading(false);
    }
  };

  // Fetch admin stats & reports from API
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/overview", {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setAdminStats(data.stats);
        setApiLog({ status: res.status, message: "Authorized 200 OK - Admin JWT payload verified." });
      } else {
        setApiLog({ status: res.status, error: data.message });
      }

      // Fetch reports
      const reportsRes = await fetch("/api/admin/reports", {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData.reports || []);
      }
    } catch (err) {
      setApiLog({ status: 500, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken && isAdminRole) {
      fetchAdminData();
      fetchCoursesList();
    }
  }, [adminToken, isAdminRole]);

  // Client-side form validation
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!newCourse.title || !newCourse.title.trim()) {
      errors.title = "Course title is required.";
      isValid = false;
    } else if (newCourse.title.trim().length < 3) {
      errors.title = "Course title must be at least 3 characters.";
      isValid = false;
    }

    if (!newCourse.category || !newCourse.category.trim()) {
      errors.category = "Category is required.";
      isValid = false;
    }

    if (!newCourse.duration || !newCourse.duration.trim()) {
      errors.duration = "Course duration is required (e.g., '40 Hours' or '6 Weeks').";
      isValid = false;
    }

    if (!newCourse.description || !newCourse.description.trim()) {
      errors.description = "Course description is required.";
      isValid = false;
    } else if (newCourse.description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters.";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  // Handle Add New Course submission
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setFormSuccess(null);
    setFormError(null);

    // Re-verify Admin Role before sending request
    if (!isAdminRole) {
      setFormError("Access Denied: Only users with 'admin' role in JWT token can submit this form.");
      return;
    }

    // Validate fields before sending request
    if (!validateForm()) {
      setFormError("Please fix the highlighted validation errors before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          title: newCourse.title.trim(),
          code: newCourse.code ? newCourse.code.trim() : undefined,
          category: newCourse.category.trim(),
          duration: newCourse.duration.trim(),
          description: newCourse.description.trim(),
          instructor: newCourse.instructor ? newCourse.instructor.trim() : undefined,
          estimatedHours: newCourse.estimatedHours ? Number(newCourse.estimatedHours) : undefined
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setFormSuccess(`🎉 Success! Course "${data.course?.title || newCourse.title}" has been saved to the database.`);
        setNewCourse({
          title: "",
          code: "",
          category: "Web Development",
          duration: "",
          description: "",
          instructor: "",
          estimatedHours: ""
        });
        setValidationErrors({});
        fetchAdminData();
        fetchCoursesList();
      } else {
        setFormError(data.message || "Failed to create course. Please check all required fields.");
        if (data.errors) {
          setValidationErrors(data.errors);
        }
      }
    } catch (err) {
      setFormError("Server error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete course handler
  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to remove course "${courseTitle}" from database?`)) return;
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setFormSuccess(`Course "${courseTitle}" was removed from database.`);
        fetchAdminData();
        fetchCoursesList();
      } else {
        setFormError(data.message || "Failed to delete course.");
      }
    } catch (err) {
      setFormError("Error deleting course: " + err.message);
    }
  };

  // Strict Access Control Guard - Check JWT and Admin Role before rendering form
  if (!adminToken || !isAdminRole) {
    return (
      <div className="section-card" style={{ textAlign: "center", padding: "3rem 1.5rem", maxWidth: "600px", margin: "2rem auto" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔒</div>
        <h2 style={{ color: "var(--accent-danger)", marginBottom: "0.5rem" }}>
          Admin Privileges Required
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.25rem", fontSize: "0.9rem" }}>
          Dashboard Access Denied: Admin analytics and course management are restricted strictly to authenticated users with <strong>admin</strong> role in their JWT token.
        </p>

        {decodedPayload ? (
          <div style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#f87171",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.82rem",
            marginBottom: "1.5rem",
            fontFamily: "monospace",
            textAlign: "left"
          }}>
            <div><strong>Decoded JWT User:</strong> {decodedPayload.name || decodedPayload.email || "Unknown"}</div>
            <div><strong>Decoded JWT Role:</strong> "{decodedPayload.role || 'none'}"</div>
            <div style={{ marginTop: "0.3rem", color: "var(--text-muted)", fontSize: "0.78rem" }}>
              Required Role: <code>admin</code>
            </div>
          </div>
        ) : (
          <div style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#f87171",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.82rem",
            marginBottom: "1.5rem"
          }}>
            No valid Bearer JWT token detected in session.
          </div>
        )}

        <button className="btn-primary" onClick={onSwitchToStudent} style={{ margin: "0 auto", justifyContent: "center" }}>
          ← Return to Student View
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Admin Header Banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)",
        border: "1px solid rgba(99, 102, 241, 0.3)",
        borderRadius: "var(--radius-lg)",
        padding: "1.5rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)" }}>
              Urban EdTech Admin Portal 🛠️
            </h1>
            <span style={{
              background: "rgba(239, 68, 68, 0.2)",
              color: "#f87171",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              padding: "0.2rem 0.65rem",
              borderRadius: "var(--radius-full)",
              fontSize: "0.75rem",
              fontWeight: 700
            }}>
              🛡️ Admin Verified ({decodedPayload.email})
            </span>
          </div>
          <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>
            Real-time enrollment statistics, course catalog management, and student progress analytics.
          </p>
        </div>

        <button className="btn-secondary" onClick={onSwitchToStudent}>
          ← Switch to Student View
        </button>
      </div>

      {/* API Auth Logger Status */}
      {apiLog && (
        <div style={{
          background: apiLog.status === 200 ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
          border: `1px solid ${apiLog.status === 200 ? "var(--accent-success)" : "#f87171"}`,
          borderRadius: "var(--radius-md)",
          padding: "0.85rem 1.25rem",
          fontSize: "0.82rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{
              background: apiLog.status === 200 ? "var(--accent-success)" : "#ef4444",
              color: "white",
              padding: "0.15rem 0.5rem",
              borderRadius: "4px",
              fontWeight: 800
            }}>
              HTTP {apiLog.status}
            </span>
            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              {apiLog.message || apiLog.error}
            </span>
          </div>
          <code style={{ fontSize: "0.75rem", color: "var(--accent-primary)", opacity: 0.9 }}>
            JWT Verified: role = "{decodedPayload.role}"
          </code>
        </div>
      )}

      {/* Admin KPI Stats Grid */}
      <div className="stats-grid">
        <StatCard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>}
          colorClass="icon-purple"
          title="Total Active Courses"
          value={courses.length || adminStats.totalCourses}
          trend="Saved in DB"
          trendType="neutral"
          subtext="Admin Course Offerings"
        />

        <StatCard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 1 0 7.75"/></svg>}
          colorClass="icon-cyan"
          title="Registered Students"
          value={adminStats.totalStudents}
          trend="Active Learners"
          trendType="up"
          subtext="Total Student Profiles"
        />

        <StatCard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
          colorClass="icon-emerald"
          title="Certificates Awarded"
          value={adminStats.completedCertificates}
          trend={`${adminStats.overallCompletionRate}% Rate`}
          trendType="up"
          subtext="100% Completion"
        />

        <StatCard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
          colorClass="icon-amber"
          title="Platform System Health"
          value={adminStats.systemHealth}
          trend={adminStats.platformRegion}
          trendType="neutral"
          subtext="MongoDB Atlas Connected"
        />
      </div>

      {/* Admin Enrollment Statistics Widget (Real-time Charts) */}
      <EnrollmentStatsChart adminToken={adminToken} />

      {/* Main Section Grid: Add Course Form & Database Course List */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "1.5rem" }}>
        
        {/* Admin Add New Course Form */}
        <div className="section-card">
          <div className="section-header" style={{ marginBottom: "1.25rem" }}>
            <div>
              <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add New Course Form
              </h2>
              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                Fill in all required fields to validate and register a course in MongoDB.
              </span>
            </div>
            <span style={{
              background: "rgba(99, 102, 241, 0.15)",
              color: "var(--accent-primary)",
              padding: "0.25rem 0.6rem",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.75rem",
              fontWeight: 700
            }}>
              JWT Admin Verified
            </span>
          </div>

          {/* Success Banner */}
          {formSuccess && (
            <div style={{
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid var(--accent-success)",
              color: "#34d399",
              padding: "0.85rem 1rem",
              borderRadius: "var(--radius-md)",
              marginBottom: "1.25rem",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <span>{formSuccess}</span>
            </div>
          )}

          {/* Global Error Banner */}
          {formError && (
            <div style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid #ef4444",
              color: "#f87171",
              padding: "0.85rem 1rem",
              borderRadius: "var(--radius-md)",
              marginBottom: "1.25rem",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <span>⚠️ {formError}</span>
            </div>
          )}

          <form onSubmit={handleCreateCourse} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {/* Title Field (Required) */}
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: "0.35rem" }}>
                Course Title <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                className="search-input"
                style={{
                  width: "100%",
                  paddingLeft: "1rem",
                  borderColor: validationErrors.title ? "#ef4444" : undefined,
                  background: validationErrors.title ? "rgba(239, 68, 68, 0.05)" : undefined
                }}
                value={newCourse.title}
                onChange={(e) => {
                  setNewCourse({ ...newCourse, title: e.target.value });
                  if (validationErrors.title) setValidationErrors(prev => ({ ...prev, title: null }));
                }}
                placeholder="e.g. Next.js 15 Server Components & Architecture"
              />
              {validationErrors.title && (
                <div style={{ fontSize: "0.75rem", color: "#f87171", marginTop: "0.25rem" }}>
                  ⚠️ {validationErrors.title}
                </div>
              )}
            </div>

            {/* Category & Duration Row (Required Fields) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
              {/* Category (Required) */}
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: "0.35rem" }}>
                  Category <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  className="select-input"
                  style={{
                    width: "100%",
                    borderColor: validationErrors.category ? "#ef4444" : undefined,
                    background: validationErrors.category ? "rgba(239, 68, 68, 0.05)" : undefined
                  }}
                  value={newCourse.category}
                  onChange={(e) => {
                    setNewCourse({ ...newCourse, category: e.target.value });
                    if (validationErrors.category) setValidationErrors(prev => ({ ...prev, category: null }));
                  }}
                >
                  <option value="Web Development">Web Development</option>
                  <option value="AI & Data Science">AI & Data Science</option>
                  <option value="Design & UX">Design & UX</option>
                  <option value="DevOps & Cloud">DevOps & Cloud</option>
                  <option value="Security">Security</option>
                  <option value="Urban Tech">Urban Tech</option>
                </select>
                {validationErrors.category && (
                  <div style={{ fontSize: "0.75rem", color: "#f87171", marginTop: "0.25rem" }}>
                    ⚠️ {validationErrors.category}
                  </div>
                )}
              </div>

              {/* Duration (Required) */}
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: "0.35rem" }}>
                  Duration <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  className="search-input"
                  style={{
                    width: "100%",
                    paddingLeft: "1rem",
                    borderColor: validationErrors.duration ? "#ef4444" : undefined,
                    background: validationErrors.duration ? "rgba(239, 68, 68, 0.05)" : undefined
                  }}
                  value={newCourse.duration}
                  onChange={(e) => {
                    setNewCourse({ ...newCourse, duration: e.target.value });
                    if (validationErrors.duration) setValidationErrors(prev => ({ ...prev, duration: null }));
                  }}
                  placeholder="e.g. 40 Hours or 6 Weeks"
                />
                {validationErrors.duration && (
                  <div style={{ fontSize: "0.75rem", color: "#f87171", marginTop: "0.25rem" }}>
                    ⚠️ {validationErrors.duration}
                  </div>
                )}
              </div>
            </div>

            {/* Description Field (Required) */}
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: "0.35rem" }}>
                Course Description <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <textarea
                className="search-input"
                rows="3"
                style={{
                  width: "100%",
                  padding: "0.6rem 1rem",
                  height: "auto",
                  resize: "vertical",
                  borderColor: validationErrors.description ? "#ef4444" : undefined,
                  background: validationErrors.description ? "rgba(239, 68, 68, 0.05)" : undefined
                }}
                value={newCourse.description}
                onChange={(e) => {
                  setNewCourse({ ...newCourse, description: e.target.value });
                  if (validationErrors.description) setValidationErrors(prev => ({ ...prev, description: null }));
                }}
                placeholder="Comprehensive overview of course content, learning goals, prerequisites, and target audience..."
              />
              {validationErrors.description && (
                <div style={{ fontSize: "0.75rem", color: "#f87171", marginTop: "0.25rem" }}>
                  ⚠️ {validationErrors.description}
                </div>
              )}
            </div>

            {/* Optional Metadata Row: Code, Instructor, Est. Hours */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 0.8fr", gap: "0.75rem" }}>
              <div>
                <label style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>
                  Code (Optional)
                </label>
                <input
                  type="text"
                  className="search-input"
                  style={{ paddingLeft: "0.75rem", fontSize: "0.82rem" }}
                  value={newCourse.code}
                  onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value.toUpperCase() })}
                  placeholder="WEB-402"
                />
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>
                  Instructor (Optional)
                </label>
                <input
                  type="text"
                  className="search-input"
                  style={{ paddingLeft: "0.75rem", fontSize: "0.82rem" }}
                  value={newCourse.instructor}
                  onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                  placeholder="Dr. Alex Morgan"
                />
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.25rem" }}>
                  Est. Hours
                </label>
                <input
                  type="number"
                  className="search-input"
                  style={{ paddingLeft: "0.75rem", fontSize: "0.82rem" }}
                  value={newCourse.estimatedHours}
                  onChange={(e) => setNewCourse({ ...newCourse, estimatedHours: e.target.value })}
                  placeholder="40"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
                style={{ flex: 1, justifyContent: "center", padding: "0.75rem 1.25rem" }}
              >
                {submitting ? (
                  <>
                    <span className="spinner-small" /> Saving to Database...
                  </>
                ) : (
                  <>
                    ➕ Publish & Save Course to Database
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setNewCourse({
                    title: "",
                    code: "",
                    category: "Web Development",
                    duration: "",
                    description: "",
                    instructor: "",
                    estimatedHours: ""
                  });
                  setValidationErrors({});
                  setFormSuccess(null);
                  setFormError(null);
                }}
                style={{ padding: "0.75rem 1rem" }}
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Database Course Catalog List Section */}
        <div className="section-card">
          <div className="section-header" style={{ marginBottom: "1rem" }}>
            <div>
              <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
                Database Course Catalog
              </h2>
              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                Live courses stored in MongoDB database ({courses.length} items)
              </span>
            </div>

            <button
              className="btn-secondary"
              onClick={fetchCoursesList}
              style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem" }}
            >
              🔄 Refresh List
            </button>
          </div>

          {coursesLoading ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
              Loading courses from MongoDB database...
            </div>
          ) : courses.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem", border: "1px dashed var(--border-color)", borderRadius: "var(--radius-md)" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📚</div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
                No courses found in database. Use the form on the left to add a new course!
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", maxHeight: "580px", overflowY: "auto", paddingRight: "0.25rem" }}>
              {courses.map((c) => (
                <div
                  key={c._id || c.id || c.code}
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-md)",
                    padding: "1rem 1.25rem",
                    transition: "var(--transition-fast)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.35rem" }}>
                        <span style={{
                          background: "var(--gradient-brand)",
                          color: "white",
                          padding: "0.15rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.72rem",
                          fontWeight: 700
                        }}>
                          {c.code || "COURSE"}
                        </span>
                        <span style={{
                          background: "rgba(99, 102, 241, 0.15)",
                          color: "var(--accent-primary)",
                          padding: "0.15rem 0.5rem",
                          borderRadius: "var(--radius-full)",
                          fontSize: "0.72rem",
                          fontWeight: 600
                        }}>
                          {c.category}
                        </span>
                        {c.duration && (
                          <span style={{
                            background: "rgba(16, 185, 129, 0.15)",
                            color: "#34d399",
                            padding: "0.15rem 0.5rem",
                            borderRadius: "var(--radius-full)",
                            fontSize: "0.72rem",
                            fontWeight: 600
                          }}>
                            ⏳ {c.duration}
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.35rem" }}>
                        {c.title}
                      </h3>

                      <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.5rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {c.description || "No description provided."}
                      </p>

                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", gap: "1rem" }}>
                        <span>👤 Instructor: {c.instructor || "Urban Faculty"}</span>
                        <span>📖 Lessons: {c.totalLessons || (c.modules ? c.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) : 0)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteCourse(c._id || c.id, c.title)}
                      title="Remove Course from DB"
                      style={{
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        color: "#f87171",
                        padding: "0.35rem 0.6rem",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.75rem",
                        cursor: "pointer"
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Student Enrollment Progress Reports Table */}
      <div className="section-card">
        <div className="section-header">
          <h2 className="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            Student Progress & Enrollment Reports (Admin Protected)
          </h2>

          <button className="btn-secondary" onClick={fetchAdminData} style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem" }}>
            🔄 Refresh Reports
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
                <th style={{ padding: "0.75rem" }}>Student</th>
                <th style={{ padding: "0.75rem" }}>Course Title</th>
                <th style={{ padding: "0.75rem" }}>Progress</th>
                <th style={{ padding: "0.75rem" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {reports.length > 0 ? (
                reports.map((r) => (
                  <tr key={r.enrollmentId} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "0.75rem", fontWeight: 600, color: "var(--text-primary)" }}>
                      {r.studentName}
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{r.studentEmail}</div>
                    </td>
                    <td style={{ padding: "0.75rem", color: "var(--text-secondary)" }}>
                      <strong style={{ color: "var(--text-primary)" }}>{r.courseCode}</strong> - {r.courseTitle}
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{
                          flex: 1,
                          height: "6px",
                          background: "var(--bg-card)",
                          borderRadius: "3px",
                          overflow: "hidden"
                        }}>
                          <div style={{
                            width: `${r.progressPercentage}%`,
                            height: "100%",
                            background: r.progressPercentage === 100 ? "var(--accent-success)" : "var(--accent-primary)"
                          }} />
                        </div>
                        <span style={{ fontSize: "0.78rem", fontWeight: 700 }}>{r.progressPercentage}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <span style={{
                        padding: "0.2rem 0.5rem",
                        borderRadius: "var(--radius-full)",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        background: r.status === "completed" ? "rgba(16, 185, 129, 0.15)" : "rgba(99, 102, 241, 0.15)",
                        color: r.status === "completed" ? "#34d399" : "#818cf8"
                      }}>
                        {r.status ? r.status.toUpperCase() : "ACTIVE"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                    No student progress reports retrieved yet. Click Refresh Reports.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
