import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./CourseCatalog.css";

const API_BASE_URL = "http://localhost:5000";

function CourseCatalog() {
  const { role } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/courses`);
      if (!response.ok) {
        throw new Error(`Server returned HTTP status ${response.status}`);
      }
      const data = await response.json();
      setCourses(data);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError(err.message || "Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="catalog">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
        <div>
          <h2 style={{ margin: 0 }}>📚 Explore Urban Course Catalog</h2>
          <p className="subtitle" style={{ margin: "4px 0 0 0" }}>
            Learn from industry-ready courses, track real-time progress, and download verified certificates.
          </p>
        </div>

        {/* Admin specific action button: Show/Hide based on JWT role */}
        {(role === "Admin" || role === "Instructor") && (
          <Link to="/dashboard?tab=add-course">
            <button
              style={{
                padding: "12px 20px",
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                color: "#0f172a",
                border: "none",
                borderRadius: "10px",
                fontWeight: "bold",
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(245, 158, 11, 0.4)",
              }}
            >
              ⚡ Add New Course (Admin Control)
            </button>
          </Link>
        )}
      </div>

      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Fetching courses from backend...</p>
        </div>
      )}

      {error && (
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Failed to Load Courses</h3>
          <p className="error-message">{error}</p>
          <button className="retry-btn" onClick={fetchCourses}>
            🔄 Try Again
          </button>
        </div>
      )}

      {!loading && !error && courses.length === 0 && (
        <div className="empty-container">
          <p>No courses available right now.</p>
        </div>
      )}

      {!loading && !error && courses.length > 0 && (
        <div className="course-grid">
          {courses.map((course) => {
            const courseId = course._id || course.id;
            return (
              <div className="course-card" key={courseId}>
                <div className="course-image">{course.image || "📚"}</div>

                <h3>{course.title}</h3>

                <span className="badge">{course.category || "General"}</span>

                <p><strong>👨‍🏫 Instructor:</strong> {course.instructor || course.provider || "Urban EdTech"}</p>

                <p className="course-description">{course.description}</p>

                <div className="footer">
                  <span>{course.rating || "⭐ 4.9"}</span>
                  <strong>{course.price || "Free"}</strong>
                </div>

                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <Link to={`/course/${courseId}`} style={{ flex: 1 }}>
                    <button className="enroll-btn" style={{ width: "100%" }}>
                      {role === "Admin" ? "Manage / View" : "View & Enroll"}
                    </button>
                  </Link>

                  {/* Role-specific button on card */}
                  <Link to={`/dashboard`}>
                    <button
                      style={{
                        padding: "10px 14px",
                        background: role === "Admin" ? "rgba(245, 158, 11, 0.2)" : "rgba(99, 102, 241, 0.2)",
                        border: `1px solid ${role === "Admin" ? "#f59e0b" : "#6366f1"}`,
                        color: role === "Admin" ? "#fbbf24" : "#818cf8",
                        borderRadius: "8px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        fontSize: "13px",
                      }}
                    >
                      {role === "Admin" ? "⚡ Metrics" : "📊 Track"}
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CourseCatalog;
