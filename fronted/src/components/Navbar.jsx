import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BookOpen, LayoutDashboard, Settings, LogOut, Award } from "lucide-react";
import { clearToken, clearUser, getUser } from "../utils/api";

const Navbar = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  const handleLogout = () => {
    clearToken();
    clearUser();
    if (onLogout) onLogout();
    navigate("/login");
  };

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass-panel" style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      margin: "1rem",
      borderRadius: "var(--radius-sm)",
      padding: "1rem 2rem",
      display: "flex",
      alignItems: "center",
      gap: "2rem",
      background: "rgba(17, 24, 39, 0.8)",
      borderBottom: "1px solid var(--border-glass)",
      justifyContent: "space-between"
    }}>
      <Link to="/" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Award size={28} style={{ color: "var(--primary)" }} />
        <span style={{ fontSize: "1.3rem", fontWeight: 800, tracking: "tight", background: "linear-gradient(to right, #ffffff, var(--primary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          UrbanEd Hub
        </span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <Link 
          to="/dashboard" 
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: isActive("/dashboard") ? "var(--primary)" : "var(--text-secondary)",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "0.95rem",
            transition: "color var(--transition-fast)"
          }}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </Link>

        <Link 
          to="/catalog" 
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: isActive("/catalog") ? "var(--primary)" : "var(--text-secondary)",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "0.95rem",
            transition: "color var(--transition-fast)"
          }}
        >
          <BookOpen size={18} />
          Courses
        </Link>

        {user.role === "admin" && (
          <Link 
            to="/admin" 
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: isActive("/admin") ? "var(--primary)" : "var(--text-secondary)",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              transition: "color var(--transition-fast)"
            }}
          >
            <Settings size={18} />
            Admin Panel
          </Link>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", borderRight: "1px solid var(--border-glass)", paddingRight: "1.5rem" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--primary), var(--accent-teal))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            color: "#ffffff"
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{user.name}</span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "capitalize" }}>
              {user.role} Learner
            </span>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="btn btn-secondary" 
          style={{
            padding: "0.5rem 1rem",
            fontSize: "0.85rem",
            borderColor: "rgba(244, 63, 94, 0.3)",
            color: "var(--accent-rose)"
          }}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
