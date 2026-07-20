import { useState } from "react";

export default function UpcomingDeadlines() {
  const [items, setItems] = useState([
    { id: 1, title: "React 19 Hooks Quiz", course: "MERN Stack", dueDate: "Tomorrow, 11:59 PM", status: "pending", urgency: "high" },
    { id: 2, title: "Pandas Data Cleaning Lab", course: "Data Science", dueDate: "Jul 23, 2026", status: "pending", urgency: "medium" },
    { id: 3, title: "Figma Dark Mode Design System", course: "UI/UX Design", dueDate: "Jul 25, 2026", status: "completed", urgency: "low" }
  ]);

  const toggleStatus = (id) => {
    setItems(items.map(item => item.id === id ? {
      ...item,
      status: item.status === "completed" ? "pending" : "completed"
    } : item));
  };

  return (
    <div className="section-card">
      <div className="section-header">
        <h3 className="section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Upcoming Milestones
        </h3>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              padding: "0.75rem",
              borderRadius: "var(--radius-md)",
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.75rem"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <button
                onClick={() => toggleStatus(item.id)}
                style={{
                  background: item.status === "completed" ? "var(--accent-success)" : "transparent",
                  border: `2px solid ${item.status === "completed" ? "var(--accent-success)" : "var(--text-muted)"}`,
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "0.7rem"
                }}
              >
                {item.status === "completed" && "✓"}
              </button>
              <div>
                <div style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: item.status === "completed" ? "var(--text-muted)" : "var(--text-primary)",
                  textDecoration: item.status === "completed" ? "line-through" : "none"
                }}>
                  {item.title}
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                  {item.course} • {item.dueDate}
                </div>
              </div>
            </div>

            <span style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              padding: "0.2rem 0.5rem",
              borderRadius: "var(--radius-full)",
              background: item.urgency === "high" ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.15)",
              color: item.urgency === "high" ? "#f87171" : "#fbbf24",
              textTransform: "uppercase"
            }}>
              {item.urgency === "high" ? "Due Soon" : "Upcoming"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
