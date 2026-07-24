import { useState, useEffect } from "react";

export default function EnrollmentStatsChart({ adminToken }) {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("enrollments"); // "enrollments", "status", "categories"
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchEnrollmentStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/enrollment-stats", {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatsData(data);
      } else {
        setError(data.message || "Failed to load enrollment aggregation stats");
      }
    } catch (err) {
      setError("Error connecting to server: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchEnrollmentStats();
    }
  }, [adminToken]);

  // Real-time periodic auto-refresh
  useEffect(() => {
    if (!autoRefresh || !adminToken) return;
    const interval = setInterval(() => {
      fetchEnrollmentStats();
    }, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, [autoRefresh, adminToken]);

  if (loading && !statsData) {
    return (
      <div className="section-card" style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
        <div className="spinner-small" style={{ margin: "0 auto 1rem", width: "24px", height: "24px" }} />
        <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
          Aggregating MongoDB enrollment stats for chart visualization...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section-card" style={{ borderLeft: "4px solid #ef4444" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "1rem", color: "#f87171" }}>⚠️ Enrollment Statistics Error</h3>
          <button className="btn-secondary" onClick={fetchEnrollmentStats} style={{ fontSize: "0.78rem" }}>
            🔄 Retry
          </button>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
          {error}
        </p>
      </div>
    );
  }

  const chartData = statsData?.chartData || [];
  const categoryData = statsData?.categoryData || [];
  const maxEnrollment = Math.max(...chartData.map((d) => d.enrollmentCount), 1);

  return (
    <div className="section-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Widget Header & Real-time Refresh Toggle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            Course Enrollment Statistics Dashboard
          </h2>
          <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
            Real-time enrollment aggregation powered by MongoDB pipelines
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", color: "var(--text-secondary)", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            ⚡ Real-time Sync (15s)
          </label>

          <button
            className="btn-secondary"
            onClick={fetchEnrollmentStats}
            style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.35rem" }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Metric Summary Ribbon */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
        gap: "0.75rem",
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-md)",
        padding: "0.85rem 1.1rem"
      }}>
        <div>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>Total Enrollments</span>
          <strong style={{ fontSize: "1.3rem", color: "var(--accent-primary)" }}>{statsData?.totalEnrollments || 0}</strong>
        </div>
        <div>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>Active Learners</span>
          <strong style={{ fontSize: "1.3rem", color: "#38bdf8" }}>{statsData?.totalActive || 0}</strong>
        </div>
        <div>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>Completed Certs</span>
          <strong style={{ fontSize: "1.3rem", color: "#34d399" }}>{statsData?.totalCompleted || 0}</strong>
        </div>
        <div>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>Total Courses</span>
          <strong style={{ fontSize: "1.3rem", color: "#c084fc" }}>{statsData?.totalCourses || 0}</strong>
        </div>
      </div>

      {/* Visualization Tab Switcher */}
      <div className="tab-group" style={{ marginBottom: "0.25rem" }}>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'enrollments' ? 'active' : ''}`}
          onClick={() => setActiveTab('enrollments')}
        >
          📊 Enrollments per Course
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'status' ? 'active' : ''}`}
          onClick={() => setActiveTab('status')}
        >
          📈 Status Breakdown
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          🏷️ Category Distribution
        </button>
      </div>

      {/* Chart Visualization Area */}
      {chartData.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", border: "1px dashed var(--border-color)", borderRadius: "var(--radius-md)" }}>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>No enrollment records found in MongoDB.</p>
        </div>
      ) : activeTab === "enrollments" ? (
        /* Tab 1: Enrollments per Course Bar Chart */
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {chartData.map((item) => {
            const barPct = Math.max(8, Math.round((item.enrollmentCount / maxEnrollment) * 100));
            return (
              <div key={item.courseId} style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.83rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{
                      background: "var(--gradient-brand)",
                      color: "white",
                      padding: "0.1rem 0.45rem",
                      borderRadius: "4px",
                      fontSize: "0.7rem",
                      fontWeight: 800
                    }}>
                      {item.courseCode}
                    </span>
                    <strong style={{ color: "var(--text-primary)" }}>{item.courseTitle}</strong>
                  </div>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--accent-primary)" }}>
                    {item.enrollmentCount} {item.enrollmentCount === 1 ? 'Student' : 'Students'}
                  </span>
                </div>

                <div style={{
                  height: "22px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-sm)",
                  overflow: "hidden",
                  position: "relative"
                }}>
                  <div
                    style={{
                      width: `${barPct}%`,
                      height: "100%",
                      background: item.thumbnailGradient || "var(--gradient-brand)",
                      borderRadius: "var(--radius-sm)",
                      transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      paddingRight: "0.5rem"
                    }}
                  >
                    {barPct > 20 && (
                      <span style={{ color: "white", fontSize: "0.7rem", fontWeight: 800 }}>
                        {item.enrollmentCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : activeTab === "status" ? (
        /* Tab 2: Status Breakdown per Course */
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {chartData.map((item) => (
            <div key={item.courseId} style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              padding: "0.85rem 1rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.83rem" }}>
                <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{item.courseTitle}</span>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.78rem" }}>Avg Progress: {item.avgProgress}%</span>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", fontSize: "0.75rem" }}>
                <span style={{
                  background: "rgba(56, 189, 248, 0.15)",
                  color: "#38bdf8",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: 600
                }}>
                  ⚡ Active: {item.activeCount}
                </span>

                <span style={{
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "#34d399",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "var(--radius-sm)",
                  fontWeight: 600
                }}>
                  🎓 Completed: {item.completedCount}
                </span>

                {item.bookmarkedCount > 0 && (
                  <span style={{
                    background: "rgba(245, 158, 11, 0.15)",
                    color: "#fbbf24",
                    padding: "0.2rem 0.5rem",
                    borderRadius: "var(--radius-sm)",
                    fontWeight: 600
                  }}>
                    🔖 Bookmarked: {item.bookmarkedCount}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Tab 3: Category Distribution */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.85rem" }}>
          {categoryData.map((cat) => (
            <div key={cat.category} style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              padding: "1rem",
              textAlign: "center"
            }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.3rem" }}>
                {cat.category}
              </span>
              <strong style={{ fontSize: "1.4rem", color: "var(--accent-primary)" }}>
                {cat.count}
              </strong>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block", marginTop: "0.2rem" }}>
                Total Course Registrations
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "right", marginTop: "0.25rem" }}>
        MongoDB Data Synced: {statsData?.generatedAt ? new Date(statsData.generatedAt).toLocaleTimeString() : 'Just now'}
      </div>
    </div>
  );
}
