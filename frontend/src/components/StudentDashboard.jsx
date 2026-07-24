import DashboardSummaryCards from "./DashboardSummaryCards";
import CourseProgressGrid from "./CourseProgressGrid";
import OverallProgressGauge from "./OverallProgressGauge";
import WeeklyActivityChart from "./WeeklyActivityChart";
import UpcomingDeadlines from "./UpcomingDeadlines";

export default function StudentDashboard({
  currentStudent,
  calculatedStats,
  courses,
  loading,
  weeklyActivity,
  searchQuery,
  apiError,
  fetchDashboardData,
  onSignOut,
  onOpenEnrollModal,
  onSelectCourse,
  onOpenCertificate
}) {
  return (
    <>
      {/* API Warning Banner */}
      {apiError && (
        <div
          style={{
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
          }}
        >
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
            <span
              style={{
                background: "rgba(16, 185, 129, 0.15)",
                color: "#34d399",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                padding: "0.2rem 0.6rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.75rem",
                fontWeight: 700
              }}
            >
              🎓 Authenticated Student (JWT Verified)
            </span>
          </div>
          <p className="welcome-subtitle">
            Overview of your enrolled courses, real-time completion rates, and active study milestones.
          </p>
        </div>

        <div className="header-cta-group">
          <button className="btn-secondary" onClick={onSignOut}>
            🔒 Sign Out
          </button>
          <button className="btn-primary" onClick={onOpenEnrollModal}>
            + Enroll New Course
          </button>
        </div>
      </header>

      {/* KPI Status Summary Cards Component */}
      <DashboardSummaryCards stats={calculatedStats} />

      {/* Main Dashboard Container & Layout Grid */}
      <div className="dashboard-main-grid">
        {/* Main Enrolled Courses Progress Grid */}
        <div>
          <CourseProgressGrid
            courses={courses}
            loading={loading}
            onSelectCourse={onSelectCourse}
            onOpenCertificate={onOpenCertificate}
            onOpenEnrollModal={onOpenEnrollModal}
            searchQuery={searchQuery}
          />
        </div>

        {/* Analytics Sidebar */}
        <div>
          <div className="section-card">
            <div className="section-header">
              <h3 className="section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
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
    </>
  );
}
