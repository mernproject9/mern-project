import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user, role, isAuthenticated, logout, setDemoRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const currentPath = location.pathname;

  return (
    <nav className="navbar">
      {/* Brand & Logo */}
      <Link to="/" className="nav-brand">
        <h2>🎓 Urban Learn Hub</h2>
      </Link>

      {/* Center Nav Links - Dynamically filtered by JWT Role */}
      <div className="nav-links">
        <Link
          to="/"
          className={`nav-link ${currentPath === "/" ? "active" : ""}`}
        >
          🏠 Home
        </Link>

        <Link
          to="/courses"
          className={`nav-link ${currentPath === "/courses" ? "active" : ""}`}
        >
          📚 Courses
        </Link>

        {/* Dashboard Link with role-specific label */}
        <Link
          to="/dashboard"
          className={`nav-link ${
            currentPath === "/dashboard" ? "active" : ""
          } ${role === "Admin" ? "admin-link" : ""}`}
        >
          {role === "Admin"
            ? "⚡ Admin Dashboard"
            : role === "Instructor"
            ? "👨‍🏫 Instructor Dashboard"
            : "📊 Student Dashboard"}
        </Link>

        {/* Role-Specific Links (Show/Hide based on JWT role) */}
        {role === "Admin" && (
          <>
            <Link
              to="/dashboard?tab=add-course"
              className="nav-link admin-link"
              title="Add a new course to urban catalog"
            >
              ➕ Add Course
            </Link>
            <Link
              to="/dashboard?tab=analytics"
              className="nav-link admin-link"
              title="View urban enrollment statistics & reports"
            >
              📈 Stats & Reports
            </Link>
          </>
        )}

        {role === "Instructor" && (
          <Link
            to="/dashboard?tab=add-course"
            className="nav-link"
            title="Create new course module"
          >
            ✏️ Manage Courses
          </Link>
        )}

        {role === "Student" && (
          <Link
            to="/dashboard?tab=certificates"
            className="nav-link"
            title="Download your earned certificates"
          >
            🏆 Certificates
          </Link>
        )}
      </div>

      {/* User Auth Section & Role Badge */}
      <div className="nav-links">
        {/* Quick Role Switcher (For easy demo & testing of JWT roles) */}
        <div className="demo-role-switcher" title="Quickly simulate JWT claims for different roles">
          <span style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase" }}>JWT Role:</span>
          <button
            className={`demo-role-btn ${role === "Student" ? "active" : ""}`}
            onClick={() => setDemoRole("Student")}
          >
            🎓 Student
          </button>
          <button
            className={`demo-role-btn ${role === "Instructor" ? "active" : ""}`}
            onClick={() => setDemoRole("Instructor")}
          >
            👨‍🏫 Inst
          </button>
          <button
            className={`demo-role-btn ${role === "Admin" ? "active" : ""}`}
            onClick={() => setDemoRole("Admin")}
          >
            ⚡ Admin
          </button>
        </div>

        {isAuthenticated ? (
          <div className="user-profile-section">
            {/* JWT Role Badge */}
            <span
              className={`role-badge ${
                role === "Admin"
                  ? "admin"
                  : role === "Instructor"
                  ? "instructor"
                  : "student"
              }`}
            >
              {role === "Admin"
                ? "⚡ ADMIN"
                : role === "Instructor"
                ? "👨‍🏫 INSTRUCTOR"
                : "🎓 STUDENT"}
            </span>

            <span className="user-name">{user?.name || "Learner"}</span>

            <button className="btn-logout" onClick={handleLogout} title="Logout & clear JWT token">
              🚪 Logout
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "10px" }}>
            <Link to="/login" className="nav-link btn-login">
              Login
            </Link>
            <Link to="/register" className="nav-link btn-register">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
