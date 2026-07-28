import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ModuleProgressChart from "../components/charts/ModuleProgressChart";
import QuizScoreChart from "../components/charts/QuizScoreChart";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "http://localhost:5000";

function CourseDetails() {
  const { id } = useParams();
  const { role } = useAuth();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolled, setEnrolled] = useState(false);

  const fetchCourseDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const [courseRes, progressRes] = await Promise.all([
        fetch(`${API_BASE_URL}/courses/${id}`),
        fetch(`${API_BASE_URL}/courses/${id}/progress`),
      ]);

      if (!courseRes.ok) {
        throw new Error(`Failed to load course details (Status: ${courseRes.status})`);
      }

      const courseData = await courseRes.json();
      setCourse(courseData);

      if (progressRes.ok) {
        const progressData = await progressRes.json();
        setProgress(progressData);
      }
    } catch (err) {
      setError(err.message || "Could not connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCourseDetails();
    }
  }, [id]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#0f172a" }}>
      <div className="container" style={{ flex: 1 }}>
        <Navbar />

        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Loading course details and progress analytics...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h3>Course Load Error</h3>
            <p className="error-message">{error}</p>
            <button className="retry-btn" onClick={fetchCourseDetails}>
              🔄 Try Again
            </button>
          </div>
        )}

        {!loading && !error && course && (
          <div
            style={{
              background: "#1e293b",
              padding: "35px",
              borderRadius: "16px",
              marginTop: "20px",
              color: "white",
              boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
              border: role === "Admin" ? "1px solid rgba(245, 158, 11, 0.3)" : "1px solid rgba(99, 102, 241, 0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ fontSize: "60px", marginBottom: "15px" }}>
                {course.image || "💻"}
              </div>

              {/* JWT Role Badge */}
              <span
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  background: role === "Admin" ? "rgba(245, 158, 11, 0.2)" : "rgba(16, 185, 129, 0.2)",
                  color: role === "Admin" ? "#fbbf24" : "#34d399",
                  border: `1px solid ${role === "Admin" ? "#f59e0b" : "#10b981"}`,
                }}
              >
                ROLE: {role.toUpperCase()}
              </span>
            </div>

            <h1 style={{ fontSize: "32px", marginBottom: "15px" }}>{course.title}</h1>

            <div
              style={{
                display: "flex",
                gap: "20px",
                flexWrap: "wrap",
                marginBottom: "20px",
                color: "#cbd5e1",
              }}
            >
              <p>
                <strong>👨‍🏫 Instructor:</strong> {course.instructor || course.provider || "Urban EdTech"}
              </p>
              <p>
                <strong>Rating:</strong> {course.rating || "⭐ 4.9"}
              </p>
              <p>
                <strong>Duration:</strong> {course.duration || "8 Weeks"}
              </p>
              <p>
                <strong>Level:</strong> {course.level || "Beginner to Intermediate"}
              </p>
              <p>
                <strong>Price:</strong>{" "}
                <span style={{ color: "#a78bfa", fontWeight: "bold" }}>
                  {course.price || "Free"}
                </span>
              </p>
            </div>

            <h2 style={{ marginTop: "25px", marginBottom: "10px", color: "#a78bfa" }}>
              📖 Course Description
            </h2>
            <p style={{ lineHeight: "1.7", color: "#e2e8f0", fontSize: "16px" }}>
              {course.description}
            </p>

            <h2 style={{ marginTop: "25px", marginBottom: "10px", color: "#a78bfa" }}>
              📚 Learning Objectives & Outcomes
            </h2>
            <ul style={{ lineHeight: "2", color: "#cbd5e1", paddingLeft: "20px" }}>
              <li>Full-Stack MERN Architecture & State Management</li>
              <li>RESTful API integration & JWT Role-Based Access Control</li>
              <li>Interactive Chart.js visualizations & progress analytics</li>
              <li>Certificate of Completion upon 100% module requirement</li>
            </ul>

            {/* Module & Quiz Progress Charts Section */}
            {progress && (
              <div style={{ marginTop: "40px", borderTop: "1px solid #334155", paddingTop: "30px" }}>
                <h2 style={{ fontSize: "22px", color: "#f8fafc", marginBottom: "20px" }}>
                  📈 Course Progress & Performance Analytics
                </h2>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                    gap: "20px",
                  }}
                >
                  <div
                    style={{
                      background: "#0f172a",
                      padding: "20px",
                      borderRadius: "14px",
                      border: "1px solid #334155",
                    }}
                  >
                    <h4 style={{ margin: "0 0 15px 0", color: "#a78bfa" }}>
                      Module Completion & Time Spent
                    </h4>
                    <ModuleProgressChart modules={progress.modules} />
                  </div>

                  <div
                    style={{
                      background: "#0f172a",
                      padding: "20px",
                      borderRadius: "14px",
                      border: "1px solid #334155",
                    }}
                  >
                    <h4 style={{ margin: "0 0 15px 0", color: "#38bdf8" }}>
                      Quiz Scores vs 70% Pass Mark
                    </h4>
                    <QuizScoreChart quizzes={progress.quizzes} />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons - Role Aware */}
            <div style={{ marginTop: "35px", display: "flex", gap: "15px", flexWrap: "wrap" }}>
              {role === "Admin" ? (
                <Link to="/dashboard?tab=add-course">
                  <button
                    style={{
                      background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                      color: "#0f172a",
                      border: "none",
                      padding: "14px 28px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    ⚡ Edit & Manage Course (Admin)
                  </button>
                </Link>
              ) : (
                <button
                  style={{
                    background: enrolled ? "#10b981" : "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
                    color: "white",
                    border: "none",
                    padding: "14px 28px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                  onClick={() => {
                    setEnrolled(true);
                    alert(`Successfully enrolled in ${course.title}! Go to dashboard to track your progress.`);
                  }}
                >
                  {enrolled ? "✅ Enrolled Successfully!" : "🎓 Enroll in Course"}
                </button>
              )}

              <Link to="/dashboard">
                <button
                  style={{
                    background: "#1e293b",
                    color: "#a78bfa",
                    border: "1px solid #a78bfa",
                    padding: "14px 28px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  View Learning Dashboard
                </button>
              </Link>

              <Link to="/courses">
                <button
                  style={{
                    background: "transparent",
                    color: "#cbd5e1",
                    border: "1px solid #475569",
                    padding: "14px 28px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  Back to Courses
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default CourseDetails;
