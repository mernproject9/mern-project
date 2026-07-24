export default function MilestoneNotificationBanner({ notifications = [], onDismiss }) {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div
      className="milestone-notifications-container"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        maxWidth: "420px",
        width: "90%"
      }}
      aria-live="polite"
      aria-label="Progress Milestone Notifications"
    >
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className="milestone-toast-card"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--accent-primary)",
            borderRadius: "var(--radius-lg)",
            padding: "1rem 1.25rem",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.85rem",
            animation: "slideInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: "4px",
              background: notif.threshold === 100
                ? "var(--accent-success)"
                : notif.threshold >= 50
                ? "var(--gradient-brand)"
                : "var(--accent-warning)"
            }}
          />

          <div
            style={{
              fontSize: "1.6rem",
              lineHeight: 1,
              background: "var(--bg-tertiary)",
              padding: "0.5rem",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {notif.badgeIcon || "🎉"}
          </div>

          <div style={{ flex: 1, paddingRight: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: notif.threshold === 100 ? "#34d399" : "var(--accent-primary)",
                  background: notif.threshold === 100 ? "rgba(16, 185, 129, 0.15)" : "rgba(99, 102, 241, 0.15)",
                  padding: "0.15rem 0.45rem",
                  borderRadius: "var(--radius-full)"
                }}
              >
                {notif.threshold}% Milestone Reached
              </span>
            </div>

            <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.2rem" }}>
              {notif.message}
            </div>

            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Course: {notif.courseTitle}
            </div>
          </div>

          <button
            onClick={() => onDismiss(notif.id)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontSize: "1rem",
              padding: "0.2rem 0.4rem",
              borderRadius: "var(--radius-sm)",
              transition: "var(--transition-fast)"
            }}
            title="Dismiss notification"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
