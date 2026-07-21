import { useState, useEffect } from "react";
import StatCard from "./StatCard";

export default function AdminDashboard({ adminToken, onSwitchToStudent }) {
  const [adminStats, setAdminStats] = useState({
    totalCourses: 5,
    totalStudents: 3,
    totalEnrollments: 4,
    activeEnrollments: 2,
    completedCertificates: 2,
    overallCompletionRate: 50,
    systemHealth: "Optimal",
    platformRegion: "Urban Metro Hubs"
  });

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiLog, setApiLog] = useState(null);

  // New course form state
  const [newCourse, setNewCourse] = useState({
    title: "",
    code: "",
    category: "Web Development",
    instructor: "",
    estimatedHours: 40
  });

  const [formSuccess, setFormSuccess] = useState(null);
  const [formError, setFormError] = useState(null);

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
    fetchAdminData();
  }, [adminToken]);

  // Handle Add New Course submission
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setFormSuccess(null);
    setFormError(null);

    if (!newCourse.title || !newCourse.code) {
      setFormError("Course title and code are required.");
      return;
    }

    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(newCourse)
      });

      const data = await res.json();
      if (res.ok) {
        setFormSuccess(`Success! Course "${data.course?.title || newCourse.title}" created.`);
        setNewCourse({
          title: "",
          code: "",
          category: "Web Development",
          instructor: "",
          estimatedHours: 40
        });
        fetchAdminData();
      } else {
        setFormError(data.message || "Failed to create course.");
      }
    } catch (err) {
      setFormError("Error connecting to server: " + err.message);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Admin Welcome & Header Banner */}
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
              🛡️ Admin Privilege Active
            </span>
          </div>
          <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>
            Centralized course catalog administration, urban enrollment reporting, and JWT role verification metrics.
          </p>
        </div>

        <button className="btn-secondary" onClick={onSwitchToStudent}>
          ← Switch to Student View
        </button>
      </div>

      {/* API Auth Logger Status Card */}
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
            Role Check: req.user.role === 'admin'
          </code>
        </div>
      )}

      {/* Admin KPI Stats Grid */}
      <div className="stats-grid">
        <StatCard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>}
          colorClass="icon-purple"
          title="Total Active Courses"
          value={adminStats.totalCourses}
          trend="Catalog Size"
          trendType="neutral"
          subtext="Admin Course Offerings"
        />

        <StatCard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          colorClass="icon-cyan"
          title="Registered Urban Students"
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
          subtext="100% Course Completion"
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "1.5rem" }}>
        {/* Add Course Form */}
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add New Course (Admin)
            </h2>
          </div>

          {formSuccess && (
            <div style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399", padding: "0.6rem 1rem", borderRadius: "var(--radius-sm)", marginBottom: "1rem", fontSize: "0.82rem" }}>
              {formSuccess}
            </div>
          )}

          {formError && (
            <div style={{ background: "rgba(239, 68, 68, 0.15)", color: "#f87171", padding: "0.6rem 1rem", borderRadius: "var(--radius-sm)", marginBottom: "1rem", fontSize: "0.82rem" }}>
              {formError}
            </div>
          )}

          <form onSubmit={handleCreateCourse} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                Course Title *
              </label>
              <input
                type="text"
                className="search-input"
                style={{ paddingLeft: "1rem" }}
                value={newCourse.title}
                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                placeholder="e.g. Next.js 15 & Server Components"
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                  Course Code *
                </label>
                <input
                  type="text"
                  className="search-input"
                  style={{ paddingLeft: "1rem" }}
                  value={newCourse.code}
                  onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. WEB-402"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                  Category
                </label>
                <select
                  className="select-input"
                  style={{ width: "100%" }}
                  value={newCourse.category}
                  onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                >
                  <option value="Web Development">Web Development</option>
                  <option value="AI & Data Science">AI & Data Science</option>
                  <option value="Design & UX">Design & UX</option>
                  <option value="DevOps & Cloud">DevOps & Cloud</option>
                  <option value="Security">Security</option>
                  <option value="Urban Tech">Urban Tech</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                  Instructor Name
                </label>
                <input
                  type="text"
                  className="search-input"
                  style={{ paddingLeft: "1rem" }}
                  value={newCourse.instructor}
                  onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                  placeholder="e.g. Dr. Alex Morgan"
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                  Est. Hours
                </label>
                <input
                  type="number"
                  className="search-input"
                  style={{ paddingLeft: "1rem" }}
                  value={newCourse.estimatedHours}
                  onChange={(e) => setNewCourse({ ...newCourse, estimatedHours: Number(e.target.value) })}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: "0.5rem", justifyContent: "center" }}>
              + Publish Course to Catalog
            </button>
          </form>
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
                          {r.status.toUpperCase()}
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
    </div>
  );
}
