export default function OverallProgressGauge({ percentage = 0, totalCompleted = 0, totalLessons = 0 }) {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ textAlign: "center", padding: "0.5rem 0" }}>
      <div className="gauge-wrapper">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <filter id="gaugeShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#6366f1" floodOpacity="0.4"/>
            </filter>
          </defs>
          
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="var(--bg-primary)"
            strokeWidth="12"
          />

          {/* Progress circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 1s ease-in-out",
              transform: "rotate(-90deg)",
              transformOrigin: "50% 50%",
              filter: "url(#gaugeShadow)"
            }}
          />
        </svg>

        <div className="gauge-center">
          <span className="gauge-pct">{percentage}%</span>
          <span className="gauge-subtext">Completion</span>
        </div>
      </div>

      <div style={{ marginTop: "1rem", fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", justifyContent: "center", gap: "1.2rem" }}>
        <div>
          <span style={{ fontWeight: 700, color: "var(--accent-success)" }}>{totalCompleted}</span>
          <span style={{ display: "block", fontSize: "0.72rem", color: "var(--text-muted)" }}>Lessons Done</span>
        </div>
        <div style={{ borderLeft: "1px solid var(--border-color)", paddingLeft: "1.2rem" }}>
          <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{totalLessons}</span>
          <span style={{ display: "block", fontSize: "0.72rem", color: "var(--text-muted)" }}>Total Lessons</span>
        </div>
      </div>
    </div>
  );
}
