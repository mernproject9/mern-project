import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar({
  currentStudent,
  theme,
  toggleTheme,
  searchQuery,
  setSearchQuery,
  onOpenStudentModal,
  onOpenEnrollModal
}) {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <nav className="navbar">
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <Link to="/" className="nav-brand" style={{ textDecoration: "none" }}>
          <div className="brand-icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <span className="brand-title">EduPulse</span>
        </Link>

        {/* Top Header Navigation Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Link
            to="/"
            style={{
              padding: "0.4rem 0.85rem",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.85rem",
              fontWeight: 600,
              textDecoration: "none",
              background: location.pathname === "/" ? "var(--bg-card-hover)" : "transparent",
              color: location.pathname === "/" ? "var(--accent-primary)" : "var(--text-secondary)",
              border: location.pathname === "/" ? "1px solid var(--border-glow)" : "1px solid transparent",
              transition: "all 0.2s ease"
            }}
          >
            🏠 Dashboard
          </Link>

          <Link
            to="/enrolled"
            style={{
              padding: "0.4rem 0.85rem",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.85rem",
              fontWeight: 600,
              textDecoration: "none",
              background: location.pathname === "/enrolled" || location.pathname === "/my-courses" ? "var(--bg-card-hover)" : "transparent",
              color: location.pathname === "/enrolled" || location.pathname === "/my-courses" ? "var(--accent-primary)" : "var(--text-secondary)",
              border: location.pathname === "/enrolled" || location.pathname === "/my-courses" ? "1px solid var(--border-glow)" : "1px solid transparent",
              transition: "all 0.2s ease"
            }}
          >
            📚 My Courses
          </Link>

          <Link
            to="/certificates"
            style={{
              padding: "0.4rem 0.85rem",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.85rem",
              fontWeight: 600,
              textDecoration: "none",
              background: location.pathname === "/certificates" ? "var(--bg-card-hover)" : "transparent",
              color: location.pathname === "/certificates" ? "var(--accent-primary)" : "var(--text-secondary)",
              border: location.pathname === "/certificates" ? "1px solid var(--border-glow)" : "1px solid transparent",
              transition: "all 0.2s ease"
            }}
          >
            🎓 Certificates
          </Link>
        </div>
      </div>

      <div className="nav-search">
        <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder="Search courses, modules, or topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="nav-actions">
        <button className="btn-primary" onClick={onOpenEnrollModal} style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Explore Catalog
        </button>

        <button className="icon-btn" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}>
          {theme === "dark" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>

        <div style={{ position: "relative" }}>
          <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span className="notification-badge"></span>
          </button>

          {showNotifications && (
            <div style={{
              position: "absolute",
              right: 0,
              top: "48px",
              width: "280px",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              padding: "1rem",
              boxShadow: "var(--shadow-lg)",
              zIndex: 300
            }}>
              <div style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.5rem", display: "flex", justifyContent: "space-between" }}>
                <span>Notifications</span>
                <span style={{ color: "var(--accent-primary)", fontSize: "0.75rem", cursor: "pointer" }}>Mark read</span>
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ padding: "0.4rem", background: "var(--bg-card)", borderRadius: "6px" }}>
                  🎉 <strong>Great job!</strong> You completed 6 lessons in MERN Architecture!
                </div>
                <div style={{ padding: "0.4rem", background: "var(--bg-card)", borderRadius: "6px" }}>
                  ⏰ <strong>Reminder:</strong> Data Science Quiz due tomorrow at 11:59 PM.
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="profile-pill" onClick={onOpenStudentModal}>
          <img src={currentStudent?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} alt={currentStudent?.name} className="avatar-img" />
          <div className="profile-info">
            <span className="profile-name">{currentStudent?.name || "Student"}</span>
            <span className="profile-role">{currentStudent?.department?.split(" ")[0] || "Enrolled"}</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text-muted)" }}>
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
    </nav>
  );
}
