export default function StatCard({ icon, colorClass, title, value, trend, trendType, subtext }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div className={`stat-icon ${colorClass}`}>
          {icon}
        </div>
        {trend && (
          <span className={`stat-trend ${trendType === 'up' ? 'trend-up' : 'trend-neutral'}`}>
            {trendType === 'up' ? '↑' : '•'} {trend}
          </span>
        )}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{title}</div>
      {subtext && (
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
          {subtext}
        </div>
      )}
    </div>
  );
}
