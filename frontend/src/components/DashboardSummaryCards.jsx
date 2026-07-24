import StatCard from "./StatCard";

export default function DashboardSummaryCards({ stats }) {
  const {
    totalEnrolled = 0,
    inProgressCount = 0,
    completedCount = 0,
    notStartedCount = 0
  } = stats || {};

  return (
    <section className="stats-grid" aria-label="Course Progress Summary Statistics">
      <StatCard
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        }
        colorClass="icon-purple"
        title="Total Enrolled Courses"
        value={totalEnrolled}
        trend="All Enrolled"
        trendType="neutral"
        subtext="Total course enrollments"
      />

      <StatCard
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        }
        colorClass="icon-cyan"
        title="In-Progress Courses"
        value={inProgressCount}
        trend="Active Learning"
        trendType="up"
        subtext="0% < Progress < 100%"
      />

      <StatCard
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        }
        colorClass="icon-emerald"
        title="Completed Courses"
        value={completedCount}
        trend={`${completedCount} Certificates`}
        trendType="up"
        subtext="100% Finished"
      />

      <StatCard
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        }
        colorClass="icon-amber"
        title="Not Started Courses"
        value={notStartedCount}
        trend="Pending Start"
        trendType="neutral"
        subtext="0% Progress"
      />
    </section>
  );
}
