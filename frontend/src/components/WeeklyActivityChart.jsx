export default function WeeklyActivityChart({ data = [] }) {
  const maxHours = Math.max(...data.map(d => d.hours || 0), 6);

  return (
    <div className="section-card">
      <div className="section-header">
        <h3 className="section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          Weekly Activity
        </h3>
        <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 600 }}>
          This Week: 21.5 hrs
        </span>
      </div>

      <div className="chart-bars-container">
        {data.map((item, idx) => {
          const heightPct = Math.round(((item.hours || 0) / maxHours) * 100);
          return (
            <div key={idx} className="bar-column">
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                {item.hours > 0 ? `${item.hours}h` : ''}
              </span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ height: `${heightPct}%` }}
                  title={`${item.day}: ${item.hours} hours`}
                />
              </div>
              <span className="bar-label">{item.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
